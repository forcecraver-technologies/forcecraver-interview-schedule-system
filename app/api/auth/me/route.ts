import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: {
      adminId: session.adminId,
      email: session.email,
      name: session.name,
    },
  });
}
