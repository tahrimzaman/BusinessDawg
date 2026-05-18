/**
 * Bundles all the PostHog reads needed for the admin Traffic tab into a
 * single Promise.all so the page renders in one round-trip.
 *
 * Used by both the initial server render (in `/admin/page.tsx`) and the
 * window-toggle API route (`/api/admin/traffic`).
 */

import {
  funnelCounts,
  isConfigured,
  pageviewsByDay,
  pageviewsTotal,
  recentVisitors,
  sessionsCount,
  topClicks,
  topPages,
  topReferrers,
  topUtm,
  uniqueVisitors,
  type WindowKey,
} from '@/lib/analytics/posthog-query';
import type { TrafficData } from '@/app/admin/AdminTrafficTab';

export async function getTrafficData(window: WindowKey): Promise<TrafficData> {
  if (!isConfigured()) {
    return {
      configured: false,
      window,
      pageviews: 0,
      uniqueVisitors: 0,
      sessions: 0,
      pageviewsByDay: [],
      topPages: [],
      topClicks: [],
      topReferrers: [],
      topUtm: [],
      funnel: {
        visitedSite: 0,
        visitedAbout: 0,
        visitedJoin: 0,
        visitedContact: 0,
        clickedBook: 0,
      },
      recentVisitors: [],
    };
  }
  const days = window === 'today' ? 1 : window === '30d' ? 30 : 90;
  const [pv, uniq, sess, byDay, tp, tc, tr, tu, fn, rv] = await Promise.all([
    pageviewsTotal(window),
    uniqueVisitors(window),
    sessionsCount(window),
    pageviewsByDay(days),
    topPages(window, 10),
    topClicks(window, 10),
    topReferrers(window, 10),
    topUtm(window, 10),
    funnelCounts(window),
    recentVisitors(200),
  ]);
  return {
    configured: true,
    window,
    pageviews: pv,
    uniqueVisitors: uniq,
    sessions: sess,
    pageviewsByDay: byDay,
    topPages: tp,
    topClicks: tc,
    topReferrers: tr,
    topUtm: tu,
    funnel: fn,
    recentVisitors: rv,
  };
}
