import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { generateReferenceCode } from '@/lib/formatters';
import { InterviewStatus, InterviewMode, Prisma } from '@prisma/client';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company')?.trim();
    const status = searchParams.get('status')?.trim();
    const dateFilter = searchParams.get('date')?.trim(); // 'today' | 'tomorrow' | 'this_week' | 'all'
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.InterviewWhereInput = {};

    if (company && company !== 'All') {
      where.companyName = { equals: company, mode: 'insensitive' };
    }

    if (status && status !== 'All') {
      where.status = status as InterviewStatus;
    }

    if (search) {
      where.OR = [
        { referenceCode: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { candidate: { name: { contains: search, mode: 'insensitive' } } },
        { candidate: { email: { contains: search, mode: 'insensitive' } } },
        { candidate: { phone: { contains: search, mode: 'insensitive' } } },
        { interviewerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Date filtering
    const now = new Date();
    if (dateFilter === 'today') {
      where.interviewDate = {
        gte: startOfDay(now),
        lte: endOfDay(now),
      };
    } else if (dateFilter === 'tomorrow') {
      const tomorrow = addDays(now, 1);
      where.interviewDate = {
        gte: startOfDay(tomorrow),
        lte: endOfDay(tomorrow),
      };
    } else if (dateFilter === 'this_week') {
      where.interviewDate = {
        gte: startOfWeek(now, { weekStartsOn: 1 }),
        lte: endOfWeek(now, { weekStartsOn: 1 }),
      };
    }

    const [total, interviews, stats] = await Promise.all([
      prisma.interview.count({ where }),
      prisma.interview.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              experience: true,
              location: true,
              currentRole: true,
              skills: true,
              resumeUrl: true,
            },
          },
          job: {
            select: {
              id: true,
              companyName: true,
              jobTitle: true,
              contactPerson: true,
              location: true,
              salaryBudget: true,
              experience: true,
              status: true,
            },
          },
        },
        orderBy: [
          { interviewDate: 'asc' },
          { startTime: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      // Overall metrics for header
      Promise.all([
        prisma.interview.count({
          where: {
            interviewDate: {
              gte: startOfDay(now),
              lte: endOfDay(now),
            },
          },
        }),
        prisma.interview.count({
          where: {
            interviewDate: {
              gte: startOfWeek(now, { weekStartsOn: 1 }),
              lte: endOfWeek(now, { weekStartsOn: 1 }),
            },
          },
        }),
        prisma.interview.groupBy({
          by: ['companyName'],
          _count: true,
        }),
        prisma.interview.count({
          where: {
            status: { in: ['SELECTED', 'L1', 'L2', 'L3', 'L4', 'L5'] },
          },
        }),
      ]),
    ]);

    const [todayCount, thisWeekCount, companiesCountGroup, completedCount] = stats;

    return NextResponse.json({
      success: true,
      interviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        todayCount,
        thisWeekCount,
        activeCompaniesCount: companiesCountGroup.length,
        completedCount,
      },
    });
  } catch (error) {
    console.error('Failed to get interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview schedules' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      candidateId,
      newCandidate,
      jobId,
      companyName,
      jobTitle,
      interviewDate,
      startTime,
      endTime,
      timezone = 'IST (UTC+5:30)',
      roundNumber = 1,
      roundName,
      mode = 'GOOGLE_MEET',
      meetingLink,
      locationAddress,
      interviewerName,
      interviewerRole,
      interviewerEmail,
      adminNotes,
      recruiterCompany,
      recruiterCandidate,
      l1Questions,
      l2Questions,
      l3Questions,
      l4Questions,
      l5Questions,
    } = body;

    if (!companyName || !jobTitle || !interviewDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required interview schedule fields (company, job title, date, start and end time)' },
        { status: 400 }
      );
    }

    let resolvedCandidateId = candidateId;

    // If new candidate provided, create them first
    if (!resolvedCandidateId && newCandidate) {
      if (!newCandidate.name) {
        return NextResponse.json(
          { error: 'Candidate name is required to create a candidate.' },
          { status: 400 }
        );
      }
      const candEmail = newCandidate.email && newCandidate.email.trim()
        ? newCandidate.email.toLowerCase().trim()
        : `${newCandidate.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cand'}-${Date.now()}@candidate.forcecraver.com`;

      const candidate = await prisma.candidate.create({
        data: {
          name: newCandidate.name,
          email: candEmail,
          phone: newCandidate.phone || null,
          experience: newCandidate.experience || null,
          location: newCandidate.location || null,
          currentRole: newCandidate.currentRole || null,
          currentCtc: newCandidate.currentCtc || null,
          expectedCtc: newCandidate.expectedCtc || null,
          noticePeriod: newCandidate.noticePeriod || null,
          skills: newCandidate.skills || null,
          notes: newCandidate.notes || null,
        },
      });
      resolvedCandidateId = candidate.id;
    }

    if (!resolvedCandidateId) {
      return NextResponse.json(
        { error: 'A candidate must be selected or provided' },
        { status: 400 }
      );
    }

    const referenceCode = generateReferenceCode();

    let resolvedJobId = jobId;
    if (!resolvedJobId && companyName && jobTitle) {
      const matchedJob = await prisma.job.findFirst({
        where: {
          companyName: { equals: companyName, mode: 'insensitive' },
          jobTitle: { equals: jobTitle, mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (matchedJob) {
        resolvedJobId = matchedJob.id;
      }
    }

    const interview = await prisma.interview.create({
      data: {
        referenceCode,
        jobId: resolvedJobId || null,
        candidateId: resolvedCandidateId,
        companyName,
        jobTitle,
        recruiterCompany: recruiterCompany || null,
        recruiterCandidate: recruiterCandidate || null,
        interviewDate: new Date(interviewDate),
        startTime,
        endTime,
        timezone,
        roundNumber: Number(roundNumber) || 1,
        roundName,
        mode: mode as InterviewMode,
        meetingLink: meetingLink || null,
        locationAddress: locationAddress || null,
        interviewerName: interviewerName || null,
        interviewerRole: interviewerRole || null,
        interviewerEmail: interviewerEmail || null,
        status: InterviewStatus.SCHEDULED,
        adminNotes: adminNotes || null,
        l1Questions: l1Questions?.trim() || null,
        l2Questions: l2Questions?.trim() || null,
        l3Questions: l3Questions?.trim() || null,
        l4Questions: l4Questions?.trim() || null,
        l5Questions: l5Questions?.trim() || null,
      },
      include: {
        candidate: true,
        job: true,
      },
    });

    return NextResponse.json({ success: true, interview }, { status: 201 });
  } catch (error) {
    console.error('Failed to create interview:', error);
    return NextResponse.json(
      { error: 'Failed to schedule interview' },
      { status: 500 }
    );
  }
}
