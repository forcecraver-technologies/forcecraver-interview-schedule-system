import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Find all distinct companies that have scheduled interviews
    const interviews = await prisma.interview.findMany({
      include: {
        job: {
          select: {
            contactPerson: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { interviewDate: 'desc' },
    });

    const companyMap = new Map<
      string,
      {
        companyName: string;
        interviewCount: number;
        contactPerson?: string | null;
        latestInterviewDate?: string;
        candidateCount: number;
        candidatesSet: Set<string>;
      }
    >();

    interviews.forEach((item) => {
      const name = item.companyName;
      if (!name) return;

      if (!companyMap.has(name)) {
        companyMap.set(name, {
          companyName: name,
          interviewCount: 0,
          contactPerson: item.recruiterCompany || item.job?.contactPerson || null,
          latestInterviewDate: item.interviewDate ? item.interviewDate.toISOString() : undefined,
          candidateCount: 0,
          candidatesSet: new Set<string>(),
        });
      }

      const entry = companyMap.get(name)!;
      entry.interviewCount += 1;
      if (item.candidate?.id) {
        entry.candidatesSet.add(item.candidate.id);
      }
      if (!entry.contactPerson && (item.recruiterCompany || item.job?.contactPerson)) {
        entry.contactPerson = item.recruiterCompany || item.job?.contactPerson || null;
      }
    });

    const companies = Array.from(companyMap.values()).map((c) => ({
      companyName: c.companyName,
      interviewCount: c.interviewCount,
      contactPerson: c.contactPerson,
      latestInterviewDate: c.latestInterviewDate,
      candidateCount: c.candidatesSet.size,
    }));

    return NextResponse.json({ success: true, companies });
  } catch (error) {
    console.error('Error fetching companies with interviews:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}
