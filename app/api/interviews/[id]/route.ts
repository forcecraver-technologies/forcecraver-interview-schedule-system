import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { parseDateToUTCMidnight } from '@/lib/formatters';
import { InterviewStatus, InterviewMode } from '@prisma/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, interview });
  } catch (error) {
    console.error('Failed to get interview:', error);
    return NextResponse.json({ error: 'Failed to fetch interview details' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();

    const {
      status,
      feedback,
      rating,
      interviewDate,
      startTime,
      endTime,
      timezone,
      meetingLink,
      locationAddress,
      interviewerName,
      interviewerRole,
      interviewerEmail,
      roundNumber,
      roundName,
      mode,
      companyName,
      jobTitle,
      jobId,
      isCustom,
      recruiterCompany,
      recruiterCandidate,
      adminNotes,
      cancellationReason,
      candidate,
      l1Questions,
      l2Questions,
      l3Questions,
      l4Questions,
      l5Questions,
    } = body;

    const updateData: Record<string, any> = {};

    if (status) updateData.status = status as InterviewStatus;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (rating !== undefined) updateData.rating = rating ? Number(rating) : null;
    if (interviewDate) updateData.interviewDate = parseDateToUTCMidnight(interviewDate);
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (timezone) updateData.timezone = timezone;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;
    if (locationAddress !== undefined) updateData.locationAddress = locationAddress;
    if (interviewerName !== undefined) updateData.interviewerName = interviewerName;
    if (interviewerRole !== undefined) updateData.interviewerRole = interviewerRole;
    if (interviewerEmail !== undefined) updateData.interviewerEmail = interviewerEmail;
    if (roundNumber !== undefined) updateData.roundNumber = Number(roundNumber);
    if (roundName !== undefined) updateData.roundName = roundName;
    if (mode) updateData.mode = mode as InterviewMode;
    if (companyName) updateData.companyName = companyName;
    if (jobTitle) updateData.jobTitle = jobTitle;
    if (recruiterCompany !== undefined) updateData.recruiterCompany = recruiterCompany || null;
    if (recruiterCandidate !== undefined) updateData.recruiterCandidate = recruiterCandidate || null;

    if (isCustom === true) {
      updateData.job = { disconnect: true };
    } else if (jobId !== undefined) {
      if (jobId) {
        updateData.job = { connect: { id: jobId } };
      } else {
        updateData.job = { disconnect: true };
      }
    } else if (companyName && jobTitle && isCustom !== false) {
      // Only auto-match if not custom
      const matchedJob = await prisma.job.findFirst({
        where: {
          companyName: { equals: companyName, mode: 'insensitive' },
          jobTitle: { equals: jobTitle, mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (matchedJob) {
        updateData.job = { connect: { id: matchedJob.id } };
      }
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (cancellationReason !== undefined) updateData.cancellationReason = cancellationReason;
    if (l1Questions !== undefined) updateData.l1Questions = l1Questions ? l1Questions.trim() : null;
    if (l2Questions !== undefined) updateData.l2Questions = l2Questions ? l2Questions.trim() : null;
    if (l3Questions !== undefined) updateData.l3Questions = l3Questions ? l3Questions.trim() : null;
    if (l4Questions !== undefined) updateData.l4Questions = l4Questions ? l4Questions.trim() : null;
    if (l5Questions !== undefined) updateData.l5Questions = l5Questions ? l5Questions.trim() : null;

    // Optional candidate update
    if (candidate && candidate.id) {
      const candidateUpdate: Record<string, any> = {};
      if (candidate.name !== undefined) candidateUpdate.name = candidate.name;
      if (candidate.email !== undefined) {
        candidateUpdate.email = candidate.email && candidate.email.trim() ? candidate.email.toLowerCase().trim() : null;
      }
      if (candidate.phone !== undefined) candidateUpdate.phone = candidate.phone;
      if (candidate.experience !== undefined) candidateUpdate.experience = candidate.experience;
      if (candidate.location !== undefined) candidateUpdate.location = candidate.location;
      if (candidate.currentRole !== undefined) candidateUpdate.currentRole = candidate.currentRole;
      if (candidate.skills !== undefined) candidateUpdate.skills = candidate.skills;

      if (Object.keys(candidateUpdate).length > 0) {
        updateData.candidate = {
          update: candidateUpdate,
        };
      }
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        candidate: true,
        job: true,
      },
    });

    return NextResponse.json({ success: true, interview: updated });
  } catch (error) {
    console.error('Failed to update interview:', error);
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.interview.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    console.error('Failed to delete interview:', error);
    return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500 });
  }
}
