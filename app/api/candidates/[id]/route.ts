import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        job: true,
        interviews: {
          orderBy: { interviewDate: 'desc' },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, candidate });
  } catch (error) {
    console.error('Failed to get candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.candidate.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const updateData: any = {};

    // First and last names
    if (body.firstName !== undefined) updateData.firstName = body.firstName?.trim() || null;
    if (body.lastName !== undefined) updateData.lastName = body.lastName?.trim() || null;

    if (body.name !== undefined) {
      updateData.name = body.name.trim();
    } else if (body.firstName !== undefined || body.lastName !== undefined) {
      const fn = body.firstName !== undefined ? body.firstName : existing.firstName;
      const ln = body.lastName !== undefined ? body.lastName : existing.lastName;
      updateData.name = `${fn || ''} ${ln || ''}`.trim() || existing.name;
    }

    if (body.email !== undefined) {
      updateData.email = body.email && body.email.trim() ? body.email.toLowerCase().trim() : null;
    }
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;
    if (body.experience !== undefined) updateData.experience = body.experience?.trim() || null;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.currentRole !== undefined) updateData.currentRole = body.currentRole?.trim() || null;
    if (body.currentCompany !== undefined) updateData.currentCompany = body.currentCompany?.trim() || null;
    if (body.currentCtc !== undefined) updateData.currentCtc = body.currentCtc?.trim() || null;
    if (body.expectedCtc !== undefined) updateData.expectedCtc = body.expectedCtc?.trim() || null;
    if (body.noticePeriod !== undefined) updateData.noticePeriod = body.noticePeriod?.trim() || null;
    if (body.resumeUrl !== undefined) updateData.resumeUrl = body.resumeUrl?.trim() || null;
    if (body.linkedinUrl !== undefined) updateData.linkedinUrl = body.linkedinUrl?.trim() || null;
    if (body.portfolioUrl !== undefined) updateData.portfolioUrl = body.portfolioUrl?.trim() || null;
    if (body.skills !== undefined) updateData.skills = body.skills?.trim() || null;
    if (body.notes !== undefined) updateData.notes = body.notes?.trim() || null;

    // JD Mapping
    if (body.jobId !== undefined) updateData.jobId = body.jobId || null;
    if (body.companyName !== undefined) updateData.companyName = body.companyName?.trim() || null;
    if (body.jobTitle !== undefined) updateData.jobTitle = body.jobTitle?.trim() || null;
    if (body.jdShiftTiming !== undefined) updateData.jdShiftTiming = body.jdShiftTiming?.trim() || null;
    if (body.jdSalaryBudget !== undefined) updateData.jdSalaryBudget = body.jdSalaryBudget?.trim() || null;
    if (body.jdNotes !== undefined) updateData.jdNotes = body.jdNotes?.trim() || null;

    // Screening Fields
    if (body.screeningStatus !== undefined) updateData.screeningStatus = body.screeningStatus;
    if (body.screenedBy !== undefined) updateData.screenedBy = body.screenedBy?.trim() || null;
    if (body.screeningDate !== undefined) {
      updateData.screeningDate = body.screeningDate ? new Date(body.screeningDate) : null;
    }
    if (body.screeningResponse !== undefined) updateData.screeningResponse = body.screeningResponse?.trim() || null;
    if (body.screeningNotes !== undefined) updateData.screeningNotes = body.screeningNotes?.trim() || null;
    if (body.techSkillsRating !== undefined) {
      updateData.techSkillsRating = body.techSkillsRating !== null ? parseInt(body.techSkillsRating, 10) : null;
    }
    if (body.communicationRating !== undefined) {
      updateData.communicationRating = body.communicationRating !== null ? parseInt(body.communicationRating, 10) : null;
    }

    // Interview & Final Decision Status
    if (body.interviewStatus !== undefined) updateData.interviewStatus = body.interviewStatus;
    if (body.finalDecision !== undefined) {
      updateData.finalDecision = body.finalDecision;
      if (body.finalDecision !== 'PENDING' && !body.finalDecisionDate && !existing.finalDecisionDate) {
        updateData.finalDecisionDate = new Date();
      }
    }
    if (body.finalDecisionNotes !== undefined) updateData.finalDecisionNotes = body.finalDecisionNotes?.trim() || null;
    if (body.finalDecisionDate !== undefined) {
      updateData.finalDecisionDate = body.finalDecisionDate ? new Date(body.finalDecisionDate) : null;
    }

    const updated = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        job: true,
        interviews: true,
      },
    });

    return NextResponse.json({ success: true, candidate: updated });
  } catch (error) {
    console.error('Failed to update candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.candidate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete candidate:', error);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}
