/**
 * Admin dashboard stats — server-side aggregations against the existing
 * Prisma tables. No new schema, no analytics service, just SQL via Prisma.
 *
 * Each helper returns a small shape suitable for serialising to the client.
 * `windowDays` defaults to 30; the dashboard pairs `getXXX()` with
 * `getXXXPrior()` to compute trend deltas.
 */

import { prisma } from '@/lib/db/prisma';

const DAY_MS = 86_400_000;

export type Window = { from: Date; to: Date };

export function rollingWindow(days = 30, anchor: Date = new Date()): Window {
  const to = anchor;
  const from = new Date(to.getTime() - days * DAY_MS);
  return { from, to };
}

export function priorWindow(days = 30, anchor: Date = new Date()): Window {
  const to = new Date(anchor.getTime() - days * DAY_MS);
  const from = new Date(to.getTime() - days * DAY_MS);
  return { from, to };
}

/** Day-bucket key in UTC: `YYYY-MM-DD`. */
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Bucket a list of {createdAt} rows into a day-indexed series. Missing days
 * get a 0 so sparkline rendering is straightforward.
 */
export function bucketByDay(
  rows: { createdAt: Date }[],
  days: number,
  anchor: Date = new Date(),
): { day: string; count: number }[] {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor.getTime() - i * DAY_MS);
    buckets.set(dayKey(d), 0);
  }
  for (const r of rows) {
    const k = dayKey(r.createdAt);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
}

/** Percent change A vs B. Returns null if base is 0 (avoid Infinity). */
export function trendPct(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return Math.round(((current - prior) / prior) * 100);
}

export type DashboardStats = {
  windowDays: number;
  bookings: {
    current: number;
    prior: number;
    trendPct: number | null;
    series: { day: string; count: number }[];
  };
  customers: {
    total: number;
    byStage: Record<'PROSPECT' | 'ACTIVE' | 'DELIVERED' | 'CHURNED', number>;
  };
  subscribers: {
    current: number;
    prior: number;
    trendPct: number | null;
    series: { day: string; count: number }[];
    topSources: { source: string; count: number }[];
  };
  applications: {
    current: number;
    prior: number;
    trendPct: number | null;
  };
  chat: {
    current: number;
    prior: number;
    trendPct: number | null;
    uniqueIps: number; // unique hashed IPs in current window
  };
  bookingHealth: {
    confirmed: number;
    cancelled: number;
    completed: number;
    noShow: number;
    showRate: number | null; // (completed) / (completed + noShow), 0-100, null if no data
  };
  funnel: {
    label: string;
    count: number;
  }[];
  activity: ActivityEvent[];
};

export type ActivityEvent = {
  id: string;
  type:
    | 'booking_created'
    | 'booking_status'
    | 'customer_promoted'
    | 'application_received'
    | 'subscriber_joined'
    | 'chat_turn';
  at: string; // ISO
  summary: string;
};

export async function getDashboardStats(windowDays = 30): Promise<DashboardStats> {
  const now = new Date();
  const cur = rollingWindow(windowDays, now);
  const prev = priorWindow(windowDays, now);

  const [
    bookingsCur,
    bookingsPrev,
    bookingsForSeries,
    customersAll,
    subsCur,
    subsPrev,
    subsForSeries,
    subsBySource,
    appsCur,
    appsPrev,
    chatsCur,
    chatsPrev,
    chatsUniqueIps,
    bookingHealthCounts,
    recentBookings,
    recentEvents,
    recentApps,
    recentSubs,
    recentChats,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: cur.from, lt: cur.to } } }),
    prisma.booking.count({ where: { createdAt: { gte: prev.from, lt: prev.to } } }),
    prisma.booking.findMany({
      where: { createdAt: { gte: cur.from, lt: cur.to } },
      select: { createdAt: true },
    }),
    prisma.customer.findMany({ select: { stage: true } }),
    prisma.subscriber.count({ where: { createdAt: { gte: cur.from, lt: cur.to } } }),
    prisma.subscriber.count({ where: { createdAt: { gte: prev.from, lt: prev.to } } }),
    prisma.subscriber.findMany({
      where: { createdAt: { gte: cur.from, lt: cur.to } },
      select: { createdAt: true },
    }),
    prisma.subscriber.groupBy({
      by: ['source'],
      _count: { _all: true },
      orderBy: { _count: { source: 'desc' } },
      take: 5,
    }),
    prisma.application.count({ where: { createdAt: { gte: cur.from, lt: cur.to } } }),
    prisma.application.count({ where: { createdAt: { gte: prev.from, lt: prev.to } } }),
    prisma.chatLog.count({ where: { createdAt: { gte: cur.from, lt: cur.to } } }),
    prisma.chatLog.count({ where: { createdAt: { gte: prev.from, lt: prev.to } } }),
    prisma.chatLog.findMany({
      where: { createdAt: { gte: cur.from, lt: cur.to }, ipHash: { not: null } },
      select: { ipHash: true },
      distinct: ['ipHash'],
    }),
    prisma.booking.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, intent: true, createdAt: true, startUtc: true },
    }),
    prisma.bookingEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        booking: { select: { name: true, email: true } },
      },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, role: true, createdAt: true },
    }),
    prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, email: true, source: true, createdAt: true },
    }),
    prisma.chatLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, lastUserMessage: true, createdAt: true },
    }),
  ]);

  // Customer stage rollup
  const byStage: DashboardStats['customers']['byStage'] = {
    PROSPECT: 0,
    ACTIVE: 0,
    DELIVERED: 0,
    CHURNED: 0,
  };
  for (const c of customersAll) byStage[c.stage]++;

  // Booking health
  const healthMap = new Map<string, number>();
  for (const h of bookingHealthCounts) healthMap.set(h.status, h._count._all);
  const completed = healthMap.get('COMPLETED') ?? 0;
  const noShow = healthMap.get('NO_SHOW') ?? 0;
  const showSample = completed + noShow;
  const showRate = showSample > 0 ? Math.round((completed / showSample) * 100) : null;

  // Funnel (top-of-funnel → revenue) using rolling-window counts where we
  // can, totals where we can't.
  const funnel: DashboardStats['funnel'] = [
    { label: 'Chat turns', count: chatsCur },
    { label: 'Subscribers', count: subsCur },
    { label: 'Bookings', count: bookingsCur },
    { label: 'Active customers', count: byStage.ACTIVE },
  ];

  // Activity feed — merge several sources, sort by date desc, take top N.
  const activity: ActivityEvent[] = [];
  for (const b of recentBookings) {
    activity.push({
      id: `b:${b.id}`,
      type: 'booking_created',
      at: b.createdAt.toISOString(),
      summary: `${b.name} booked ${b.intent ? `— ${b.intent.slice(0, 60)}` : ''}`,
    });
  }
  for (const e of recentEvents) {
    activity.push({
      id: `e:${e.id}`,
      type: 'booking_status',
      at: e.createdAt.toISOString(),
      summary: `${e.booking?.name ?? 'Booking'} · ${e.type}`,
    });
  }
  for (const a of recentApps) {
    activity.push({
      id: `a:${a.id}`,
      type: 'application_received',
      at: a.createdAt.toISOString(),
      summary: `${a.name} applied${a.role ? ` for ${a.role.slice(0, 40)}` : ''}`,
    });
  }
  for (const s of recentSubs) {
    activity.push({
      id: `s:${s.id}`,
      type: 'subscriber_joined',
      at: s.createdAt.toISOString(),
      summary: `${s.email} subscribed (${s.source})`,
    });
  }
  for (const c of recentChats) {
    const msg = c.lastUserMessage.replace(/\s+/g, ' ').slice(0, 80);
    activity.push({
      id: `c:${c.id}`,
      type: 'chat_turn',
      at: c.createdAt.toISOString(),
      summary: `Chat: "${msg}${msg.length === 80 ? '…' : ''}"`,
    });
  }
  activity.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  return {
    windowDays,
    bookings: {
      current: bookingsCur,
      prior: bookingsPrev,
      trendPct: trendPct(bookingsCur, bookingsPrev),
      series: bucketByDay(bookingsForSeries, windowDays, now),
    },
    customers: {
      total: customersAll.length,
      byStage,
    },
    subscribers: {
      current: subsCur,
      prior: subsPrev,
      trendPct: trendPct(subsCur, subsPrev),
      series: bucketByDay(subsForSeries, windowDays, now),
      topSources: subsBySource.map((s) => ({
        source: s.source,
        count: s._count._all,
      })),
    },
    applications: {
      current: appsCur,
      prior: appsPrev,
      trendPct: trendPct(appsCur, appsPrev),
    },
    chat: {
      current: chatsCur,
      prior: chatsPrev,
      trendPct: trendPct(chatsCur, chatsPrev),
      uniqueIps: chatsUniqueIps.length,
    },
    bookingHealth: {
      confirmed: healthMap.get('CONFIRMED') ?? 0,
      cancelled: healthMap.get('CANCELLED') ?? 0,
      completed,
      noShow,
      showRate,
    },
    funnel,
    activity: activity.slice(0, 14),
  };
}
