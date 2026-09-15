import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ ref: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { ref } = await context.params;
    const cleanRef = decodeURIComponent(ref).trim();

    // Look up by referenceCode, candidate name, email, or phone
    const interview = await prisma.interview.findFirst({
      where: {
        OR: [
          { referenceCode: { equals: cleanRef, mode: 'insensitive' } },
          { candidate: { name: { contains: cleanRef, mode: 'insensitive' } } },
          { candidate: { email: { contains: cleanRef, mode: 'insensitive' } } },
          { candidate: { phone: { contains: cleanRef, mode: 'insensitive' } } },
        ],
      },
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
            jobDescription: true,
          },
        },
      },
      orderBy: { interviewDate: 'desc' },
    });

    if (!interview) {
      return NextResponse.json({ error: 'No candidate or interview appointment found matching your query.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, interview });
  } catch (error) {
    console.error('Failed to track interview:', error);
    return NextResponse.json({ error: 'Failed to look up interview appointment' }, { status: 500 });
  }
}
