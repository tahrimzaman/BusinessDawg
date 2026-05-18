/**
 * Build log helpers — slug generation, month grouping, Loom URL parsing.
 *
 * Entries live in the database (Prisma `BuildLogEntry` model) and are
 * created/edited via /admin → Build log tab. The public `/built` page reads
 * published entries and groups them by month so a slow week doesn't visually
 * penalize a single day.
 */

export type BuildLogEntryRow = {
  id: string;
  slug: string;
  title: string;
  date: string; // ISO
  body: string;
  imageUrl: string | null;
  imageAlt: string | null;
  loomUrl: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Slugify a title into a URL-safe slug. Lowercase, hyphenated, ASCII-only.
 * Caller is expected to handle uniqueness collisions (DB returns 409).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Pull the Loom share ID from a paste URL and return the canonical embed URL.
 * Accepts:
 *   - https://www.loom.com/share/<id>
 *   - https://loom.com/share/<id>
 *   - https://www.loom.com/embed/<id>
 *   - bare <id> (32-hex string)
 * Returns null if the input doesn't look like a Loom share.
 */
export function loomEmbedUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Bare 32-hex id
  if (/^[a-f0-9]{32}$/i.test(trimmed)) {
    return `https://www.loom.com/embed/${trimmed.toLowerCase()}`;
  }
  // Full URL
  const m = trimmed.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{32})/i);
  if (m) return `https://www.loom.com/embed/${m[1].toLowerCase()}`;
  return null;
}

const monthKeyFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
});

/**
 * Group entries by month label ("May 2026", "April 2026"). Preserves the
 * input order within each group, so callers should sort by date desc first.
 */
export function groupByMonth(entries: BuildLogEntryRow[]): {
  label: string;
  monthKey: string; // YYYY-MM
  entries: BuildLogEntryRow[];
}[] {
  const buckets = new Map<string, { label: string; entries: BuildLogEntryRow[] }>();
  for (const e of entries) {
    const d = new Date(e.date);
    const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = monthKeyFmt.format(d);
    const bucket = buckets.get(monthKey);
    if (bucket) bucket.entries.push(e);
    else buckets.set(monthKey, { label, entries: [e] });
  }
  return Array.from(buckets.entries()).map(([monthKey, v]) => ({
    monthKey,
    label: v.label,
    entries: v.entries,
  }));
}

/**
 * Truncate a body string into a single-sentence excerpt for cards + meta.
 * Strips markdown markers, collapses whitespace, caps at maxChars.
 */
export function excerpt(body: string, maxChars = 160): string {
  const stripped = body
    .replace(/[#*_`>]+/g, '')
    .replace(/\!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= maxChars) return stripped;
  return stripped.slice(0, maxChars - 1).trimEnd() + '…';
}
