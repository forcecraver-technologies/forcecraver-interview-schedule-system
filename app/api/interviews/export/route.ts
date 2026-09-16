import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { isRealCandidateEmail } from '@/lib/formatters';
import { InterviewStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const company = searchParams.get('company') || '';

    const where: any = {};

    if (status && status !== 'All') {
      where.status = status as InterviewStatus;
    }

    if (company && company !== 'All') {
      where.companyName = { equals: company, mode: 'insensitive' };
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { referenceCode: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { jobTitle: { contains: q, mode: 'insensitive' } },
        { recruiterCompany: { contains: q, mode: 'insensitive' } },
        { recruiterCandidate: { contains: q, mode: 'insensitive' } },
        { candidate: { name: { contains: q, mode: 'insensitive' } } },
        { candidate: { email: { contains: q, mode: 'insensitive' } } },
        { candidate: { phone: { contains: q, mode: 'insensitive' } } },
        { candidate: { location: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        candidate: true,
        job: true,
      },
      orderBy: [
        { interviewDate: 'asc' },
        { startTime: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Build Excel dataset
    const rows = interviews.map((item, index) => {
      const dateStr = item.interviewDate
        ? format(new Date(item.interviewDate), 'yyyy-MM-dd')
        : '';

      const modeFormatted = item.mode === 'NOT_KNOWN'
        ? 'Not Known'
        : item.mode.replace('_', ' ');

      return {
        'S.No': index + 1,
        'Reference Code': item.referenceCode,
        'Status': item.status,
        'Client Company': item.companyName,
        'Active JD / Role': item.jobTitle,
        'Recruiter Company (Handled By)': item.recruiterCompany || item.job?.contactPerson || '—',
        'Recruiter Candidate': item.recruiterCandidate || '—',
        'Candidate Name': item.candidate.name,
        'Candidate Phone': item.candidate.phone || '—',
        'Candidate Experience': item.candidate.experience || '—',
        'Candidate Location': item.candidate.location || '—',
        'Current Designation': item.candidate.currentRole || '—',
        'Interview Date': dateStr,
        'Start Time': item.startTime,
        'End Time': item.endTime,
        'Timezone': item.timezone,
        'Round Number': item.roundNumber,
        'Round Name': item.roundName,
        'Platform / Mode': modeFormatted,
        'Meeting Link': item.meetingLink || '—',
        'Location Address': item.locationAddress || '—',
        'Interviewer Name': item.interviewerName || '—',
        'Interviewer Email': item.interviewerEmail || '—',
        'Rating (1-5)': item.rating ? `${item.rating} / 5` : '—',
        'Client Feedback': item.feedback || '—',
        'Admin Notes': item.adminNotes || '—',
        'Created At': format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm'),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Column widths for professional readability
    worksheet['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 18 }, // Reference Code
      { wch: 14 }, // Status
      { wch: 22 }, // Client Company
      { wch: 28 }, // Active JD / Role
      { wch: 28 }, // Recruiter Company
      { wch: 22 }, // Recruiter Candidate
      { wch: 22 }, // Candidate Name
      { wch: 28 }, // Candidate Email
      { wch: 16 }, // Candidate Phone
      { wch: 16 }, // Candidate Experience
      { wch: 20 }, // Candidate Location
      { wch: 24 }, // Current Designation
      { wch: 14 }, // Interview Date
      { wch: 12 }, // Start Time
      { wch: 12 }, // End Time
      { wch: 18 }, // Timezone
      { wch: 14 }, // Round Number
      { wch: 26 }, // Round Name
      { wch: 16 }, // Platform / Mode
      { wch: 35 }, // Meeting Link
      { wch: 25 }, // Location Address
      { wch: 20 }, // Interviewer Name
      { wch: 25 }, // Interviewer Email
      { wch: 14 }, // Rating
      { wch: 30 }, // Client Feedback
      { wch: 30 }, // Admin Notes
      { wch: 18 }, // Created At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Interview Schedules');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Interview_Schedules_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to export interviews to Excel:', error);
    return NextResponse.json({ error: 'Failed to export interviews to Excel' }, { status: 500 });
  }
}
