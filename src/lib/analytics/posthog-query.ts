/**
 * Server-side PostHog *read* client (HogQL queries).
 *
 * Counterpart to `posthog-server.ts` which only writes events. This file
 * reads them back via PostHog's HogQL Query API for the admin Traffic tab.
 *
 * Auth: requires `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID`.
 *   - Personal API key: PostHog → Account → Personal API Keys → create with
 *     `query:read` scope only.
 *   - Project ID: PostHog → Settings → numeric ID in the URL.
 *
 * Everything no-ops to zeros/empty arrays if either env var is missing, so
 * `/admin/traffic` renders a "Wire your PostHog read-key" CTA instead of
 * crashing.
 *
 * Caching: every query result is memoised for 5 minutes in-process. PostHog
 * Cloud free tier has generous query limits but we don't need fresher than
 * 5 min for an admin glance.
 */

const HOST = process.env.POSTHOG_HOST || 'https://us.i.posthog.com';
const KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT = process.env.POSTHOG_PROJECT_ID;

export function isConfigured(): boolean {
  return Boolean(KEY && PROJECT);
}

type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60_000;

function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e) return null;
  if (e.expires < Date.now()) {
    cache.delete(key);
    return null;
  }
  return e.value as T;
}

function setCached<T>(key: string, value: T): void {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

type HogQLResponse = {
  results?: unknown[][];
  error?: string;
};

/**
 * Run a HogQL query against the configured project. Returns raw row arrays.
 * Each row is an array of column values in the order of the SELECT list.
 * Throws on network/auth failure — callers wrap in try/catch.
 */
async function hogql(query: string, cacheKey?: string): Promise<unknown[][]> {
  if (!isConfigured()) return [];
  if (cacheKey) {
    const hit = getCached<unknown[][]>(cacheKey);
    if (hit) return hit;
  }
  const url = `${HOST}/api/projects/${PROJECT}/query/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`PostHog HogQL ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as HogQLResponse;
  if (data.error) throw new Error(`PostHog HogQL: ${data.error}`);
  const rows = data.results ?? [];
  if (cacheKey) setCached(cacheKey, rows);
  return rows;
}

// ---------------------------------------------------------------------------
// Public query helpers
// ---------------------------------------------------------------------------

/** Count of $pageview events since UTC midnight. Cheap "site visitors today". */
export async function pageviewsToday(): Promise<number> {
  if (!isConfigured()) return 0;
  try {
    const rows = await hogql(
      `SELECT count() FROM events
       WHERE event = '$pageview'
         AND timestamp >= toStartOfDay(now())`,
      'pageviews:today',
    );
    return Number(rows[0]?.[0] ?? 0);
  } catch {
    return 0;
  }
}

export type WindowKey = 'today' | '30d' | 'all';

function whereWindow(w: WindowKey): string {
  if (w === 'today') return 'timestamp >= toStartOfDay(now())';
  if (w === '30d') return 'timestamp >= now() - INTERVAL 30 DAY';
  return '1 = 1';
}

export async function pageviewsTotal(w: WindowKey): Promise<number> {
  if (!isConfigured()) return 0;
  try {
    const rows = await hogql(
      `SELECT count() FROM events WHERE event = '$pageview' AND ${whereWindow(w)}`,
      `pv:total:${w}`,
    );
    return Number(rows[0]?.[0] ?? 0);
  } catch {
    return 0;
  }
}

export async function uniqueVisitors(w: WindowKey): Promise<number> {
  if (!isConfigured()) return 0;
  try {
    const rows = await hogql(
      `SELECT count(DISTINCT properties.$device_id) FROM events
       WHERE event = '$pageview' AND ${whereWindow(w)}`,
      `pv:unique:${w}`,
    );
    return Number(rows[0]?.[0] ?? 0);
  } catch {
    return 0;
  }
}

export async function sessionsCount(w: WindowKey): Promise<number> {
  if (!isConfigured()) return 0;
  try {
    const rows = await hogql(
      `SELECT count(DISTINCT properties.$session_id) FROM events
       WHERE ${whereWindow(w)}`,
      `sess:count:${w}`,
    );
    return Number(rows[0]?.[0] ?? 0);
  } catch {
    return 0;
  }
}

export async function pageviewsByDay(days = 30): Promise<{ day: string; count: number }[]> {
  if (!isConfigured()) return [];
  try {
    const rows = await hogql(
      `SELECT toDate(timestamp) AS day, count() AS c FROM events
       WHERE event = '$pageview'
         AND timestamp >= now() - INTERVAL ${days} DAY
       GROUP BY day ORDER BY day ASC`,
      `pv:byday:${days}`,
    );
    return rows.map((r) => ({ day: String(r[0]), count: Number(r[1]) }));
  } catch {
    return [];
  }
}

export async function topPages(
  w: WindowKey,
  limit = 10,
): Promise<{ path: string; count: number }[]> {
  if (!isConfigured()) return [];
  try {
    const rows = await hogql(
      `SELECT properties.$pathname AS p, count() AS c FROM events
       WHERE event = '$pageview' AND ${whereWindow(w)}
       GROUP BY p ORDER BY c DESC LIMIT ${limit}`,
      `pv:top:${w}:${limit}`,
    );
    return rows.filter((r) => r[0]).map((r) => ({ path: String(r[0]), count: Number(r[1]) }));
  } catch {
    return [];
  }
}

export async function topClicks(
  w: WindowKey,
  limit = 10,
): Promise<{ label: string; count: number }[]> {
  if (!isConfigured()) return [];
  try {
    const rows = await hogql(
      `SELECT coalesce(properties.$el_text, properties.$elements_chain) AS label, count() AS c
       FROM events
       WHERE event = '$autocapture' AND properties.$event_type = 'click'
         AND ${whereWindow(w)}
       GROUP BY label ORDER BY c DESC LIMIT ${limit}`,
      `click:top:${w}:${limit}`,
    );
    return rows
      .filter((r) => r[0])
      .map((r) => ({ label: String(r[0]).slice(0, 80), count: Number(r[1]) }));
  } catch {
    return [];
  }
}

export async function topReferrers(
  w: WindowKey,
  limit = 10,
): Promise<{ referrer: string; count: number }[]> {
  if (!isConfigured()) return [];
  try {
    const rows = await hogql(
      `SELECT properties.$referring_domain AS r, count() AS c FROM events
       WHERE event = '$pageview' AND ${whereWindow(w)}
         AND properties.$referring_domain IS NOT NULL
         AND properties.$referring_domain != '$direct'
       GROUP BY r ORDER BY c DESC LIMIT ${limit}`,
      `ref:top:${w}:${limit}`,
    );
    return rows.filter((r) => r[0]).map((r) => ({ referrer: String(r[0]), count: Number(r[1]) }));
  } catch {
    return [];
  }
}

export async function topUtm(
  w: WindowKey,
  limit = 10,
): Promise<{ source: string; count: number }[]> {
  if (!isConfigured()) return [];
  try {
    const rows = await hogql(
      `SELECT properties.utm_source AS s, count() AS c FROM events
       WHERE event = '$pageview' AND ${whereWindow(w)}
         AND properties.utm_source IS NOT NULL
       GROUP BY s ORDER BY c DESC LIMIT ${limit}`,
      `utm:top:${w}:${limit}`,
    );
    return rows.filter((r) => r[0]).map((r) => ({ source: String(r[0]), count: Number(r[1]) }));
  } catch {
    return [];
  }
}

export type RecentVisitor = {
  timestamp: string;
  distinctId: string;
  city: string | null;
  country: string | null;
  countryCode: string | null;
  os: string | null;
  browser: string | null;
  device: string | null;
  referrer: string | null;
  landingPath: string | null;
  pageviews: number;
};

export async function recentVisitors(limit = 200): Promise<RecentVisitor[]> {
  if (!isConfigured()) return [];
  try {
    // Latest pageview per distinct_id with denormalised geo/UA props.
    const rows = await hogql(
      `SELECT max(timestamp) AS t, distinct_id,
              any(properties.$geoip_city_name) AS city,
              any(properties.$geoip_country_name) AS country,
              any(properties.$geoip_country_code) AS cc,
              any(properties.$os) AS os,
              any(properties.$browser) AS browser,
              any(properties.$device_type) AS device,
              any(properties.$referring_domain) AS ref,
              argMin(properties.$pathname, timestamp) AS landing,
              count() AS pv
       FROM events
       WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY
       GROUP BY distinct_id
       ORDER BY t DESC
       LIMIT ${limit}`,
      `visitors:recent:${limit}`,
    );
    return rows.map((r) => ({
      timestamp: String(r[0]),
      distinctId: String(r[1]),
      city: r[2] ? String(r[2]) : null,
      country: r[3] ? String(r[3]) : null,
      countryCode: r[4] ? String(r[4]) : null,
      os: r[5] ? String(r[5]) : null,
      browser: r[6] ? String(r[6]) : null,
      device: r[7] ? String(r[7]) : null,
      referrer: r[8] && r[8] !== '$direct' ? String(r[8]) : null,
      landingPath: r[9] ? String(r[9]) : null,
      pageviews: Number(r[10] ?? 0),
    }));
  } catch {
    return [];
  }
}

export type FunnelCounts = {
  visitedSite: number;
  visitedAbout: number;
  visitedJoin: number;
  visitedContact: number;
  clickedBook: number;
};

export async function funnelCounts(w: WindowKey): Promise<FunnelCounts> {
  if (!isConfigured()) {
    return {
      visitedSite: 0,
      visitedAbout: 0,
      visitedJoin: 0,
      visitedContact: 0,
      clickedBook: 0,
    };
  }
  try {
    const rows = await hogql(
      `SELECT
         count(DISTINCT properties.$device_id) AS visited,
         count(DISTINCT if(properties.$pathname LIKE '/about%', properties.$device_id, NULL)) AS about,
         count(DISTINCT if(properties.$pathname LIKE '/join%', properties.$device_id, NULL)) AS join_,
         count(DISTINCT if(properties.$pathname LIKE '/contact%', properties.$device_id, NULL)) AS contact
       FROM events
       WHERE event = '$pageview' AND ${whereWindow(w)}`,
      `funnel:pv:${w}`,
    );
    const clickRows = await hogql(
      `SELECT count(DISTINCT properties.$device_id) FROM events
       WHERE event = '$autocapture'
         AND properties.$event_type = 'click'
         AND lower(properties.$el_text) LIKE '%book a call%'
         AND ${whereWindow(w)}`,
      `funnel:click:${w}`,
    );
    const r = rows[0] ?? [];
    return {
      visitedSite: Number(r[0] ?? 0),
      visitedAbout: Number(r[1] ?? 0),
      visitedJoin: Number(r[2] ?? 0),
      visitedContact: Number(r[3] ?? 0),
      clickedBook: Number(clickRows[0]?.[0] ?? 0),
    };
  } catch {
    return {
      visitedSite: 0,
      visitedAbout: 0,
      visitedJoin: 0,
      visitedContact: 0,
      clickedBook: 0,
    };
  }
}
