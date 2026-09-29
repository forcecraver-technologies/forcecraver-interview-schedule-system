import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const screeningStatus = searchParams.get('screeningStatus')?.trim();
    const interviewStatus = searchParams.get('interviewStatus')?.trim();
    const finalDecision = searchParams.get('finalDecision')?.trim();
    const companyName = searchParams.get('companyName')?.trim();

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
      // Default: Only Good or Average candidates are exported in the Interview Schedule Portal
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

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        job: true,
        _count: {
          select: { interviews: true },
        },
      },
    });

    const rows = candidates.map((cand, idx) => {
      const createdStr = cand.createdAt ? format(new Date(cand.createdAt), 'yyyy-MM-dd') : '';
      const screeningDateStr = cand.screeningDate ? format(new Date(cand.screeningDate), 'yyyy-MM-dd') : '';
      const finalDecisionDateStr = cand.finalDecisionDate ? format(new Date(cand.finalDecisionDate), 'yyyy-MM-dd') : '';

      return {
        'S.No': idx + 1,
        'Candidate Name': cand.name,
        'First Name': cand.firstName || '—',
        'Last Name': cand.lastName || '—',
        'Phone Number': cand.phone || '—',
        'Email Address': cand.email || '—',
        'Location (City)': cand.location || '—',
        'Total Experience': cand.experience || '—',
        'Key Skills': cand.skills || '—',
        'Current Role / Designation': cand.currentRole || '—',
        'Current Company': cand.currentCompany || '—',
        'Current CTC': cand.currentCtc || '—',
        'Expected CTC': cand.expectedCtc || '—',
        'Notice Period': cand.noticePeriod || '—',

        // JD Details
        'Mapped Client Company': cand.companyName || cand.job?.companyName || '—',
        'Mapped Job Title / JD': cand.jobTitle || cand.job?.jobTitle || '—',
        'JD Shift Timing': cand.jdShiftTiming || cand.job?.shiftTiming || '—',
        'JD Salary Budget': cand.jdSalaryBudget || cand.job?.salaryBudget || '—',

        // Screening Details & Response
        'Screening Status': cand.screeningStatus,
        'Screened By': cand.screenedBy || '—',
        'Screening Date': screeningDateStr || '—',
        'Candidate Screening Response / Pitch': cand.screeningResponse || '—',
        'Internal Screening Notes': cand.screeningNotes || '—',
        'Tech Rating (1-5)': cand.techSkillsRating ? `${cand.techSkillsRating} / 5` : '—',
        'Communication Rating (1-5)': cand.communicationRating ? `${cand.communicationRating} / 5` : '—',

        // Interview Status
        'Interview Status': cand.interviewStatus,
        'Total Interviews Scheduled': cand._count.interviews,

        // Final Decision ("Final Krna Hai ya Nhi")
        'Final Hiring Decision': cand.finalDecision,
        'Final Decision Date': finalDecisionDateStr || '—',
        'Final Decision Notes / Offer Remarks': cand.finalDecisionNotes || '—',

        // Links
        'Resume Link': cand.resumeUrl || '—',
        'LinkedIn Profile': cand.linkedinUrl || '—',
        'Portfolio URL': cand.portfolioUrl || '—',
        'Candidate Profile Notes': cand.notes || '—',
        'Added Date': createdStr,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 22 }, // Candidate Name
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 16 }, // Phone Number
      { wch: 26 }, // Email Address
      { wch: 18 }, // Location
      { wch: 16 }, // Total Experience
      { wch: 32 }, // Key Skills
      { wch: 24 }, // Current Role
      { wch: 22 }, // Current Company
      { wch: 16 }, // Current CTC
      { wch: 16 }, // Expected CTC
      { wch: 16 }, // Notice Period
      { wch: 24 }, // Mapped Client Company
      { wch: 28 }, // Mapped Job Title
      { wch: 20 }, // JD Shift Timing
      { wch: 18 }, // JD Salary Budget
      { wch: 18 }, // Screening Status
      { wch: 18 }, // Screened By
      { wch: 14 }, // Screening Date
      { wch: 38 }, // Candidate Screening Response
      { wch: 32 }, // Internal Screening Notes
      { wch: 16 }, // Tech Rating
      { wch: 22 }, // Communication Rating
      { wch: 20 }, // Interview Status
      { wch: 24 }, // Total Interviews Scheduled
      { wch: 22 }, // Final Hiring Decision
      { wch: 16 }, // Final Decision Date
      { wch: 38 }, // Final Decision Notes
      { wch: 30 }, // Resume Link
      { wch: 30 }, // LinkedIn
      { wch: 30 }, // Portfolio URL
      { wch: 30 }, // Profile Notes
      { wch: 14 }, // Added Date
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidates Pool');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Forcecraver_Candidates_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to export candidates to Excel:', error);
    return NextResponse.json({ error: 'Failed to export candidates to Excel' }, { status: 500 });
  }
}
