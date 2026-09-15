import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { JobStatus } from '@prisma/client';

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: JobStatus.ACTIVE,
      },
      select: {
        id: true,
        companyName: true,
        jobTitle: true,
        contactPerson: true,
        location: true,
        experience: true,
        skills: true,
        salaryBudget: true,
      },
      orderBy: [
        { companyName: 'asc' },
        { jobTitle: 'asc' },
      ],
    });

    // Group jobs by company
    const companiesMap = new Map<string, typeof jobs>();
    jobs.forEach((job) => {
      const existing = companiesMap.get(job.companyName) || [];
      existing.push(job);
      companiesMap.set(job.companyName, existing);
    });

    const companies = Array.from(companiesMap.entries()).map(([companyName, companyJobs]) => ({
      companyName,
      jobCount: companyJobs.length,
      jobs: companyJobs,
    }));

    return NextResponse.json({
      success: true,
      jobs,
      companies,
      totalActiveJobs: jobs.length,
    });
  } catch (error) {
    console.error('Failed to fetch jobs for interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active jobs' },
      { status: 500 }
    );
  }
}
