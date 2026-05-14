// Honeypot field + timestamp gate. Both filled = human; either filled OR
// submitted in under 2 seconds = bot.

export const HONEYPOT_FIELD = 'bd_company';
export const TIMESTAMP_FIELD = 'bd_ts';
const MIN_SUBMIT_MS = 2_000;

export type HoneypotPayload = {
  [HONEYPOT_FIELD]?: unknown;
  [TIMESTAMP_FIELD]?: unknown;
};

export function isLikelyBot(body: HoneypotPayload): boolean {
  const trap = body[HONEYPOT_FIELD];
  if (typeof trap === 'string' && trap.trim().length > 0) return true;

  const ts = Number(body[TIMESTAMP_FIELD]);
  if (Number.isFinite(ts) && Date.now() - ts < MIN_SUBMIT_MS) return true;

  return false;
}
