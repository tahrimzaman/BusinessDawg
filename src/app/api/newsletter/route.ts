import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 });
  }

  const key = process.env.MAILERLITE_API_KEY;
  const group = process.env.MAILERLITE_GROUP_ID;

  // Dev mode: no key configured — accept and log.
  if (!key) {
    console.log('[newsletter dev] would subscribe:', email);
    return NextResponse.json({ ok: true, dev: true });
  }

  const url = group
    ? `https://connect.mailerlite.com/api/subscribers`
    : `https://connect.mailerlite.com/api/subscribers`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      email,
      groups: group ? [group] : undefined,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'mailerlite error' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
