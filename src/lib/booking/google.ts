/**
 * Google Calendar + Meet integration. One singleton OAuth client is stored
 * in the GoogleToken row (refresh + access token, plus the owner's email so
 * the admin UI can show "connected as X"). Per-booking event creation calls
 * calendar.events.insert with conferenceDataVersion=1 so Google generates a
 * fresh Meet link, then we persist event.hangoutLink onto the booking.
 *
 * Designed fail-open: any error short-circuits with `null`, the booking
 * still succeeds, and the admin sees a "Needs Meet link" badge so they can
 * follow up manually.
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

import { google } from 'googleapis';
import type { Credentials, OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

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
  return new google.auth.OAuth2(env.clientId, env.clientSecret, env.redirectUri);
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
  // Pull owner email so we can show "connected as X" in /admin.
  let email: string | null = null;
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const info = await oauth2.userinfo.get();
    email = info.data.email || null;
  } catch {}
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

export type CreatedEvent = {
  eventId: string;
  meetUrl: string | null;
  htmlLink: string | null;
};

/**
 * Insert an event on the owner's calendar with a Google Meet link.
 * sendUpdates: 'all' means Google emails the attendee its native invite.
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
  const calendar = google.calendar({ version: 'v3', auth: client });
  const res = await calendar.events.insert({
    calendarId: env.ownerCalendarId,
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: {
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
    },
  });
  const event = res.data;
  return {
    eventId: event.id || '',
    meetUrl: event.hangoutLink || null,
    htmlLink: event.htmlLink || null,
  };
}

/** Mark an existing event as cancelled. Best-effort. */
export async function cancelBookingEvent(
  client: OAuth2Client,
  env: GoogleEnv,
  eventId: string,
): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth: client });
  await calendar.events.delete({
    calendarId: env.ownerCalendarId,
    eventId,
    sendUpdates: 'all',
  });
}
