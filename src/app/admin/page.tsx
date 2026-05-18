import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import { getBookingRule } from '@/lib/booking/rules';
import { getGoogleEnv } from '@/lib/booking/google';
import { getDashboardStats } from '@/lib/admin/stats';
import { getTrafficData } from '@/lib/admin/traffic';
import AdminClient from './AdminClient';
import type { GoogleConnectionState } from './AdminGoogleConnection';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  if (!(await isAuthed())) redirect('/admin/login');

  const [
    subscribers,
    applications,
    bookings,
    customers,
    windows,
    exceptions,
    rule,
    googleToken,
    buildLog,
    stats,
    chatLogs,
    traffic,
  ] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }),
    prisma.application.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }),
    prisma.booking.findMany({
      orderBy: { startUtc: 'desc' },
      take: 500,
      select: {
        id: true,
        name: true,
        email: true,
        intent: true,
        status: true,
        startUtc: true,
        visitorTz: true,
        needsMeetLink: true,
      },
    }),
    prisma.customer.findMany({
      orderBy: [{ stage: 'asc' }, { desiredDeadline: 'asc' }, { updatedAt: 'desc' }],
      take: 500,
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        stage: true,
        desiredDeadline: true,
        promotedAt: true,
        updatedAt: true,
      },
    }),
    prisma.availabilityWindow.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }),
    prisma.availabilityException.findMany({ orderBy: { date: 'asc' } }),
    getBookingRule(),
    prisma.googleToken.findUnique({ where: { id: 'singleton' } }),
    prisma.buildLogEntry.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: 500,
    }),
    getDashboardStats(30),
    prisma.chatLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    getTrafficData('30d'),
  ]);

  const env = getGoogleEnv();
  let google: GoogleConnectionState;
  if (!env) {
    google = { status: 'not_configured', ownerEmail: null, lastRefreshAt: null, ageDays: null };
  } else if (!googleToken) {
    google = { status: 'disconnected', ownerEmail: null, lastRefreshAt: null, ageDays: null };
  } else {
    // Server component — Date.now() is request-scoped, not React-render-impure.
    // eslint-disable-next-line react-hooks/purity
    const ageMs = Date.now() - googleToken.lastRefreshAt.getTime();
    const ageDays = Math.floor(ageMs / 86_400_000);
    google = {
      status: 'connected',
      ownerEmail: googleToken.ownerEmail,
      lastRefreshAt: googleToken.lastRefreshAt.toISOString(),
      ageDays,
    };
  }

  return (
    <AdminClient
      subscribers={subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        source: s.source,
        createdAt: s.createdAt.toISOString(),
      }))}
      applications={applications.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        portfolio: a.portfolio,
        note: a.note,
        createdAt: a.createdAt.toISOString(),
      }))}
      bookings={bookings.map((b) => ({
        id: b.id,
        name: b.name,
        email: b.email,
        intent: b.intent,
        status: b.status,
        startUtc: b.startUtc.toISOString(),
        visitorTz: b.visitorTz,
        needsMeetLink: b.needsMeetLink,
      }))}
      customers={customers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        company: c.company,
        stage: c.stage,
        desiredDeadline: c.desiredDeadline ? c.desiredDeadline.toISOString() : null,
        promotedAt: c.promotedAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))}
      availabilityWindows={windows.map((w) => ({
        dayOfWeek: w.dayOfWeek,
        startTime: w.startTime,
        endTime: w.endTime,
        active: w.active,
      }))}
      availabilityExceptions={exceptions.map((e) => ({
        date: e.date.toISOString().slice(0, 10),
        blocked: e.blocked,
        startTime: e.startTime,
        endTime: e.endTime,
        reason: e.reason,
      }))}
      bookingRule={{
        durationMin: rule.durationMin,
        minNoticeMin: rule.minNoticeMin,
        maxHorizonDays: rule.maxHorizonDays,
        bufferMin: rule.bufferMin,
        maxPerDay: rule.maxPerDay,
        ownerTz: rule.ownerTz,
        meetingTitle: rule.meetingTitle,
      }}
      google={google}
      buildLog={buildLog.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        date: e.date.toISOString(),
        body: e.body,
        imageUrl: e.imageUrl,
        imageAlt: e.imageAlt,
        loomUrl: e.loomUrl,
        published: e.published,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }))}
      stats={stats}
      traffic={traffic}
      chatLogs={chatLogs.map((c) => ({
        id: c.id,
        ipHash: c.ipHash,
        model: c.model,
        historyLen: c.historyLen,
        totalChars: c.totalChars,
        lastUserMessage: c.lastUserMessage,
        createdAt: c.createdAt.toISOString(),
      }))}
    />
  );
}
