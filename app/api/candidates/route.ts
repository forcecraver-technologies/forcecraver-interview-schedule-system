import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
            { phone: { contains: q, mode: 'insensitive' as const } },
            { currentRole: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const candidates = await prisma.candidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: { interviews: true },
        },
      },
    });

    return NextResponse.json({ success: true, candidates });
  } catch (error) {
    console.error('Failed to get candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, experience, location, currentRole, currentCtc, expectedCtc, noticePeriod, resumeUrl, skills, notes } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const candEmail = email && email.trim()
      ? email.toLowerCase().trim()
      : `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cand'}-${Date.now()}@candidate.forcecraver.com`;

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email: candEmail,
        phone: phone || null,
        experience: experience || null,
        location: location || null,
        currentRole: currentRole || null,
        currentCtc: currentCtc || null,
        expectedCtc: expectedCtc || null,
        noticePeriod: noticePeriod || null,
        resumeUrl: resumeUrl || null,
        skills: skills || null,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, candidate }, { status: 201 });
  } catch (error) {
    console.error('Failed to create candidate:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}
