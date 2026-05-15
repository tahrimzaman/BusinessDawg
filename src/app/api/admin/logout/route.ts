import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/admin/auth';
import { withLogging } from '@/lib/log/route';

export const runtime = 'nodejs';

async function handlePOST() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}

export const POST = withLogging('admin.logout', handlePOST);
