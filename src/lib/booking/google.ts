/**
 * Google Calendar + Meet integration — direct REST against the Calendar v3
 * API, OAuth via `google-auth-library`.
 *
 * Why not `googleapis`: that SDK is ~75 MB installed because it bundles
 * generated clients for every Google API. We use exactly three endpoints
 * (events.insert, events.delete, events.patch) plus OAuth. The SDK's
 * cold-start parse time is non-trivial on a Hostinger Node instance and
 * contributes to 503-storm risk during traffic spikes. Direct fetch +
 * `google-auth-library` (the one piece we actually need) is ~3 MB.
 *
 * One singleton OAuth client is stored in the GoogleToken row (refresh +
 * access token, plus the owner's email so the admin UI can show
 * "connected as X"). Per-booking event creation inserts a Calendar event
 * with conferenceDataVersion=1 so Google generates a fresh Meet link, then
 * we persist event.hangoutLink onto the booking.
 *
 * Designed fail-open: any error short-circuits with `null`/throws, the
 * booking still succeeds, and admin sees a "Needs Meet link" badge.
 *
 * One-time setup (per Tahrim):
 *   1. console.cloud.google.com → new project → enable "Google Calendar API"
 *   2. OAuth consent screen: External, app name "BusinessDawg Booking",
 *      add your Gmail as a Test user. Scope: calendar.events.
 *   3. Credentials → OAuth 2.0 Client ID → Web application
 *      Redirect URI: http://localhost:3000/api/admin/google/callback
 *   4. Copy client ID + secret into .env.local
 *   5. Visit /admin → "Connect Google Calendar"
 */

import { OAuth2Client, type Credentials } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const CAL_API = 'https://www.googleapis.com/calendar/v3';
const USERINFO_API = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Per-request timeout. Google's APIs are usually <1s; >10s means something
// is wrong upstream and we'd rather fail-open on the booking flow than
// hang the visitor's response.
const REQUEST_TIMEOUT_MS = 10_000;

export type GoogleEnv = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  ownerCalendarId: string;
};

export function getGoogleEnv(): GoogleEnv | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/admin/google/callback',
    ownerCalendarId: process.env.GOOGLE_OWNER_CALENDAR_ID || 'primary',
  };
}

export function makeOAuthClient(env: GoogleEnv): OAuth2Client {
  return new OAuth2Client(env.clientId, env.clientSecret, env.redirectUri);
}

export function buildAuthUrl(env: GoogleEnv, state?: string): string {
  const client = makeOAuthClient(env);
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // forces refresh token issuance on re-auth
    scope: SCOPES,
    state,
  });
}

export async function exchangeCode(
  env: GoogleEnv,
  code: string,
): Promise<{ tokens: Credentials; email: string | null }> {
  const client = makeOAuthClient(env);
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  // Pull owner email so the admin UI can show "connected as X".
  let email: string | null = null;
  try {
    const accessToken = (await client.getAccessToken()).token;
    if (accessToken) {
      const res = await fetch(USERINFO_API, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.ok) {
        const info = (await res.json()) as { email?: string };
        email = info.email || null;
      }
    }
  } catch {
    // Don't fail the whole exchange if userinfo fetch errors — the tokens
    // themselves are valid; we just won't display the email.
  }
  return { tokens, email };
}

/** Returns an authenticated OAuth client given the persisted token row. */
export function authedClient(
  env: GoogleEnv,
  token: { refreshToken: string; accessToken: string | null; expiresAt: Date | null },
): OAuth2Client {
  const client = makeOAuthClient(env);
  client.setCredentials({
    refresh_token: token.refreshToken,
    access_token: token.accessToken ?? undefined,
    expiry_date: token.expiresAt ? token.expiresAt.getTime() : undefined,
  });
  return client;
}

/**
 * Custom error so callers can distinguish "the event is already gone" (404/410)
 * from real failures. `cancelBookingEvent` in particular treats 404/410 as
 * success — the visitor's calendar entry is already removed either way.
 */
export class GoogleCalendarError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GoogleCalendarError';
  }
}

async function authedFetch(
  client: OAuth2Client,
  url: string,
  init: RequestInit,
): Promise<Response> {
  const tokenResp = await client.getAccessToken();
  const accessToken = tokenResp.token;
  if (!accessToken) {
    throw new GoogleCalendarError(401, 'no access token (refresh failed?)');
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return res;
}

export type CreatedEvent = {
  eventId: string;
  meetUrl: string | null;
  htmlLink: string | null;
};

/**
 * Insert an event on the owner's calendar with a Google Meet link.
 * `sendUpdates=all` means Google emails the attendee its native invite.
 */
export async function insertBookingEvent(
  client: OAuth2Client,
  env: GoogleEnv,
  args: {
    bookingId: string;
    title: string;
    description: string;
    startUtc: Date;
    endUtc: Date;
    attendeeEmail: string;
    attendeeName: string;
  },
): Promise<CreatedEvent> {
  const url = `${CAL_API}/calendars/${encodeURIComponent(env.ownerCalendarId)}/events?conferenceDataVersion=1&sendUpdates=all`;
  const body = {
    summary: args.title,
    description: args.description,
    start: { dateTime: args.startUtc.toISOString(), timeZone: 'UTC' },
    end: { dateTime: args.endUtc.toISOString(), timeZone: 'UTC' },
    attendees: [{ email: args.attendeeEmail, displayName: args.attendeeName }],
    conferenceData: {
      createRequest: {
        requestId: args.bookingId,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };
  const res = await authedFetch(client, url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GoogleCalendarError(res.status, `events.insert ${res.status}: ${text.slice(0, 300)}`);
  }
  const event = (await res.json()) as {
    id?: string;
    hangoutLink?: string;
    htmlLink?: string;
  };
  return {
    eventId: event.id || '',
    meetUrl: event.hangoutLink || null,
    htmlLink: event.htmlLink || null,
  };
}

/**
 * Mark an existing event as cancelled. Idempotent in spirit: callers should
 * treat status 404/410 from this error as "already gone" → success.
 */
export async function cancelBookingEvent(
  client: OAuth2Client,
  env: GoogleEnv,
  eventId: string,
): Promise<void> {
  const url = `${CAL_API}/calendars/${encodeURIComponent(env.ownerCalendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;
  const res = await authedFetch(client, url, { method: 'DELETE' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GoogleCalendarError(res.status, `events.delete ${res.status}: ${text.slice(0, 300)}`);
  }
}

/**
 * Patch an existing event's start/end times. Used by reschedule. Google
 * emails a fresh invite to the attendee because of sendUpdates=all.
 */
export async function patchBookingEventTime(
  client: OAuth2Client,
  env: GoogleEnv,
  eventId: string,
  args: { startUtc: Date; endUtc: Date },
): Promise<void> {
  const url = `${CAL_API}/calendars/${encodeURIComponent(env.ownerCalendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`;
  const body = {
    start: { dateTime: args.startUtc.toISOString(), timeZone: 'UTC' },
    end: { dateTime: args.endUtc.toISOString(), timeZone: 'UTC' },
  };
  const res = await authedFetch(client, url, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new GoogleCalendarError(res.status, `events.patch ${res.status}: ${text.slice(0, 300)}`);
  }
}
