import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const screeningStatus = searchParams.get('screeningStatus')?.trim();
    const interviewStatus = searchParams.get('interviewStatus')?.trim();
    const finalDecision = searchParams.get('finalDecision')?.trim();
    const companyName = searchParams.get('companyName')?.trim();
    const jobId = searchParams.get('jobId')?.trim();
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { skills: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { currentRole: { contains: q, mode: 'insensitive' } },
        { currentCompany: { contains: q, mode: 'insensitive' } },
        { jobTitle: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const ALLOWED_SCREENING_STATUSES = ['Good', 'Average', 'good', 'average', 'GOOD', 'AVERAGE'];

    if (screeningStatus && screeningStatus.toUpperCase() === 'GOOD') {
      where.screeningStatus = { in: ['Good', 'good', 'GOOD'] };
    } else if (screeningStatus && screeningStatus.toUpperCase() === 'AVERAGE') {
      where.screeningStatus = { in: ['Average', 'average', 'AVERAGE'] };
    } else if (screeningStatus && screeningStatus !== 'ALL') {
      where.screeningStatus = screeningStatus;
    } else {
      // Default: Only Good or Average candidates are visible in the Interview Schedule Portal
      where.screeningStatus = { in: ALLOWED_SCREENING_STATUSES };
    }

    if (interviewStatus && interviewStatus !== 'ALL') {
      where.interviewStatus = interviewStatus;
    }

    if (finalDecision && finalDecision !== 'ALL') {
      where.finalDecision = finalDecision;
    }

    if (companyName && companyName !== 'ALL') {
      where.companyName = companyName;
    }

    if (jobId && jobId !== 'ALL') {
      where.jobId = jobId;
    }

    const [candidates, totalCount, statsCounts] = await Promise.all([
      prisma.candidate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              companyName: true,
              jobTitle: true,
              salaryBudget: true,
              experience: true,
              location: true,
              shiftTiming: true,
              status: true,
            },
          },
          interviews: {
            orderBy: { interviewDate: 'desc' },
            select: {
              id: true,
              referenceCode: true,
              interviewDate: true,
              startTime: true,
              endTime: true,
              roundNumber: true,
              roundName: true,
              mode: true,
              status: true,
              rating: true,
              feedback: true,
              meetingLink: true,
            },
          },
          _count: {
            select: { interviews: true },
          },
        },
      }),
      prisma.candidate.count({ where }),
      prisma.candidate.groupBy({
        by: ['screeningStatus', 'interviewStatus', 'finalDecision'],
        _count: { id: true },
      }),
    ]);

    // Aggregate overall pipeline statistics
    const stats = {
      total: 0,
      newApplied: 0,
      underScreening: 0,
      screeningPassed: 0,
      shortlisted: 0,
      screeningRejected: 0,
      inInterviews: 0,
      finalSelected: 0,
      finalRejected: 0,
      offerReleased: 0,
      pendingDecision: 0,
    };

    statsCounts.forEach((group) => {
      const count = group._count.id;
      stats.total += count;

      if (group.screeningStatus === 'NEW') stats.newApplied += count;
      if (group.screeningStatus === 'UNDER_SCREENING') stats.underScreening += count;
      if (group.screeningStatus === 'SCREENING_PASSED') stats.screeningPassed += count;
      if (group.screeningStatus === 'SHORTLISTED') stats.shortlisted += count;
      if (group.screeningStatus === 'SCREENING_REJECTED') stats.screeningRejected += count;

      if (
        group.interviewStatus !== 'NOT_SCHEDULED' &&
        group.interviewStatus !== 'INTERVIEW_REJECTED'
      ) {
        stats.inInterviews += count;
      }

      if (group.finalDecision === 'FINAL_SELECT' || group.finalDecision === 'OFFER_ACCEPTED') {
        stats.finalSelected += count;
      }
      if (group.finalDecision === 'FINAL_REJECT') stats.finalRejected += count;
      if (group.finalDecision === 'OFFER_RELEASED') stats.offerReleased += count;
      if (group.finalDecision === 'PENDING') stats.pendingDecision += count;
    });

    return NextResponse.json({
      success: true,
      candidates,
      totalCount,
      stats,
    });
  } catch (error) {
    console.error('Failed to get candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    // Allow create either if authenticated or for portal intake
    const body = await req.json();

    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      experience,
      location,
      currentRole,
      currentCompany,
      currentCtc,
      expectedCtc,
      noticePeriod,
      resumeUrl,
      linkedinUrl,
      portfolioUrl,
      skills,
      notes,
      jobId,
      companyName,
      jobTitle,
      jdShiftTiming,
      jdSalaryBudget,
      jdNotes,
      screeningStatus = 'NEW',
      screenedBy,
      screeningDate,
      screeningResponse,
      screeningNotes,
      techSkillsRating,
      communicationRating,
      interviewStatus = 'NOT_SCHEDULED',
      finalDecision = 'PENDING',
      finalDecisionNotes,
      finalDecisionDate,
    } = body;

    // Resolve full name
    const resolvedFirst = firstName ? firstName.trim() : '';
    const resolvedLast = lastName ? lastName.trim() : '';
    let resolvedName = name ? name.trim() : '';
    if (!resolvedName && (resolvedFirst || resolvedLast)) {
      resolvedName = `${resolvedFirst} ${resolvedLast}`.trim();
    }

    if (!resolvedName) {
      return NextResponse.json({ error: 'Candidate Name is required.' }, { status: 400 });
    }

    // Resolve job details if jobId provided
    let finalCompanyName = companyName?.trim() || null;
    let finalJobTitle = jobTitle?.trim() || null;

    if (jobId) {
      const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
      });
      if (existingJob) {
        if (!finalCompanyName) finalCompanyName = existingJob.companyName;
        if (!finalJobTitle) finalJobTitle = existingJob.jobTitle;
      }
    }

    const candidate = await prisma.candidate.create({
      data: {
        firstName: resolvedFirst || null,
        lastName: resolvedLast || null,
        name: resolvedName,
        email: email && email.trim() ? email.toLowerCase().trim() : null,
        phone: phone ? phone.trim() : null,
        experience: experience ? experience.trim() : null,
        location: location ? location.trim() : null,
        currentRole: currentRole ? currentRole.trim() : null,
        currentCompany: currentCompany ? currentCompany.trim() : null,
        currentCtc: currentCtc ? currentCtc.trim() : null,
        expectedCtc: expectedCtc ? expectedCtc.trim() : null,
        noticePeriod: noticePeriod ? noticePeriod.trim() : null,
        resumeUrl: resumeUrl ? resumeUrl.trim() : null,
        linkedinUrl: linkedinUrl ? linkedinUrl.trim() : null,
        portfolioUrl: portfolioUrl ? portfolioUrl.trim() : null,
        skills: skills ? skills.trim() : null,
        notes: notes ? notes.trim() : null,

        // JD Mapping
        jobId: jobId || null,
        companyName: finalCompanyName,
        jobTitle: finalJobTitle,
        jdShiftTiming: jdShiftTiming ? jdShiftTiming.trim() : null,
        jdSalaryBudget: jdSalaryBudget ? jdSalaryBudget.trim() : null,
        jdNotes: jdNotes ? jdNotes.trim() : null,

        // Screening
        screeningStatus: screeningStatus || 'NEW',
        screenedBy: screenedBy ? screenedBy.trim() : (session?.name || null),
        screeningDate: screeningDate ? new Date(screeningDate) : new Date(),
        screeningResponse: screeningResponse ? screeningResponse.trim() : null,
        screeningNotes: screeningNotes ? screeningNotes.trim() : null,
        techSkillsRating: techSkillsRating ? parseInt(techSkillsRating, 10) : null,
        communicationRating: communicationRating ? parseInt(communicationRating, 10) : null,

        // Interview & Final Decision
        interviewStatus: interviewStatus || 'NOT_SCHEDULED',
        finalDecision: finalDecision || 'PENDING',
        finalDecisionNotes: finalDecisionNotes ? finalDecisionNotes.trim() : null,
        finalDecisionDate: finalDecisionDate ? new Date(finalDecisionDate) : (finalDecision !== 'PENDING' ? new Date() : null),
      },
      include: {
        job: true,
        interviews: true,
      },
    });

    return NextResponse.json({ success: true, candidate }, { status: 201 });
  } catch (error) {
    console.error('Failed to create candidate:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}
