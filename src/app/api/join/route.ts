import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Payload = {
  name?: string;
  email?: string;
  role?: string;
  note?: string;
  portfolio?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Payload;
  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  // v1: log to server. Later this will write to Sanity or forward to an inbox.
  console.log('[join application]', {
    name: body.name,
    email: body.email,
    role: body.role,
    portfolio: body.portfolio,
    note: body.note?.slice(0, 280),
  });

  return NextResponse.json({ ok: true });
}
