/**
 * Free IP → geolocation lookup via ip-api.com.
 *
 * - No API key required.
 * - Free tier: 45 requests/minute per source IP.
 * - HTTP-only (https requires their paid plan). We're calling from server,
 *   so the cleartext call never crosses a user browser.
 *
 * Caching: per-IP in-memory for 24h so repeat hits don't burn quota. The
 * cache is process-local — fine for a single Hostinger Node process.
 *
 * Never throws — every error path returns null fields so writes that include
 * geo can fire-and-forget without try/catch at the call site.
 */

export type Geo = {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  isp: string | null;
  tz: string | null;
};

const EMPTY: Geo = {
  city: null,
  country: null,
  countryCode: null,
  isp: null,
  tz: null,
};

type CacheEntry = { value: Geo; expires: number };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 24 * 60 * 60_000;

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
  return false;
}

export async function lookupGeo(ip: string | null | undefined): Promise<Geo> {
  if (!ip || isPrivateIp(ip)) return EMPTY;

  const hit = cache.get(ip);
  if (hit && hit.expires > Date.now()) return hit.value;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,country,countryCode,isp,timezone`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    if (!res.ok) return EMPTY;
    const j = (await res.json()) as {
      status?: string;
      city?: string;
      country?: string;
      countryCode?: string;
      isp?: string;
      timezone?: string;
    };
    if (j.status !== 'success') return EMPTY;
    const geo: Geo = {
      city: j.city || null,
      country: j.country || null,
      countryCode: j.countryCode || null,
      isp: j.isp || null,
      tz: j.timezone || null,
    };
    cache.set(ip, { value: geo, expires: Date.now() + TTL_MS });
    return geo;
  } catch {
    return EMPTY;
  }
}

/**
 * Convenience: format the "City, Country" string that goes into the
 * `approxLocation` column. Returns null if neither field is available.
 */
export function formatApproxLocation(geo: Geo): string | null {
  if (geo.city && geo.country) return `${geo.city}, ${geo.country}`;
  if (geo.country) return geo.country;
  if (geo.city) return geo.city;
  return null;
}
