/**
 * Tiny User-Agent parser. Pure-JS, no deps — we only care about three
 * coarse buckets (device class, browser family, OS family) for the admin
 * Traffic tab. Adding `ua-parser-js` for this would be 30 KB of overkill;
 * the heuristics below cover ~99% of real traffic and degrade to "Unknown"
 * for the rest.
 */

export type UAParts = {
  device: 'Mobile' | 'Tablet' | 'Desktop' | 'Bot' | 'Unknown';
  browser: string; // "Chrome", "Safari", "Firefox", "Edge", "Unknown"
  os: string; // "iOS", "Android", "macOS", "Windows", "Linux", "Unknown"
};

const UNKNOWN: UAParts = { device: 'Unknown', browser: 'Unknown', os: 'Unknown' };

export function parseUA(ua: string | null | undefined): UAParts {
  if (!ua) return UNKNOWN;
  const s = ua.toLowerCase();

  // Bots first — short-circuit before the device heuristics
  if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp/.test(s)) {
    return { device: 'Bot', browser: 'Bot', os: 'Unknown' };
  }

  // OS
  let os: UAParts['os'] = 'Unknown';
  if (/iphone|ipad|ipod/.test(s)) os = 'iOS';
  else if (/android/.test(s)) os = 'Android';
  else if (/mac os x/.test(s)) os = 'macOS';
  else if (/windows/.test(s)) os = 'Windows';
  else if (/linux/.test(s)) os = 'Linux';

  // Device — iPad first since it can match "mobile"
  let device: UAParts['device'] = 'Desktop';
  if (/ipad|tablet/.test(s)) device = 'Tablet';
  else if (/iphone|ipod|android.*mobile|mobile.*android|mobi/.test(s)) device = 'Mobile';

  // Browser (order matters — Edge / Opera before Chrome, Chrome before Safari)
  let browser = 'Unknown';
  if (/edg\//.test(s)) browser = 'Edge';
  else if (/opr\/|opera/.test(s)) browser = 'Opera';
  else if (/firefox/.test(s)) browser = 'Firefox';
  else if (/chrome|crios/.test(s)) browser = 'Chrome';
  else if (/safari/.test(s)) browser = 'Safari';

  return { device, browser, os };
}
