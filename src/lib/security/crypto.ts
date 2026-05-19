import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Authenticated symmetric encryption for at-rest secrets — currently used
 * for the Google OAuth refresh + access tokens persisted on GoogleToken.
 *
 * Format:  v1:<iv-hex>:<ciphertext-hex>:<tag-hex>
 *
 * Why v1 prefix: lets us migrate existing plaintext rows lazily without a
 * backfill. `decryptToken()` treats anything that doesn't start with `v1:`
 * as legacy plaintext and returns it as-is. The next OAuth round-trip
 * (re-connect button in /admin) re-upserts the row in the new encrypted
 * format. Plan B is a one-shot `scripts/encrypt-google-token.ts` if Tahrim
 * doesn't want to re-auth.
 *
 * Production behavior:
 *   - ADMIN_TOKEN_ENC_KEY missing → throw on encrypt, throw on decrypt of a
 *     v1: payload. Plaintext legacy rows still readable (so an empty key
 *     doesn't brick the site, just blocks new writes).
 *
 * Dev behavior:
 *   - Missing key → return plaintext through both paths with a console.warn.
 *     Local DBs typically have no real tokens; this keeps `next dev`
 *     unblocked while still surfacing the misconfiguration.
 */

const ALGO = 'aes-256-gcm';
const KEY_LEN = 32; // bytes — AES-256
const IV_LEN = 12; // bytes — GCM standard

function readKey(): Buffer | null {
  const raw = process.env.ADMIN_TOKEN_ENC_KEY;
  if (!raw) return null;
  // Accept hex (preferred — 64 chars) or base64 (44 chars with padding) so
  // Tahrim doesn't get blocked on key format. Reject everything else.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, 'hex');
  if (/^[A-Za-z0-9+/]{43}=?$/.test(raw)) {
    const b = Buffer.from(raw, 'base64');
    if (b.length === KEY_LEN) return b;
  }
  throw new Error('ADMIN_TOKEN_ENC_KEY must be 32 bytes (64-hex or 44-base64)');
}

export function encryptToken(plaintext: string): string {
  const key = readKey();
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ADMIN_TOKEN_ENC_KEY required in production to persist Google tokens');
    }
    // Dev: pass through with a warning, but tag it so we can spot it later.
    console.warn('[crypto] ADMIN_TOKEN_ENC_KEY missing — storing token as plaintext (dev only)');
    return plaintext;
  }
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString('hex')}:${ct.toString('hex')}:${tag.toString('hex')}`;
}

export function decryptToken(stored: string): string {
  // Legacy plaintext — return as-is so existing rows keep working until the
  // next OAuth re-auth re-writes them encrypted.
  if (!stored.startsWith('v1:')) return stored;

  const key = readKey();
  if (!key) {
    throw new Error('ADMIN_TOKEN_ENC_KEY required to decrypt encrypted token row');
  }
  const parts = stored.split(':');
  if (parts.length !== 4) throw new Error('malformed encrypted token');
  const [, ivHex, ctHex, tagHex] = parts;
  const iv = Buffer.from(ivHex!, 'hex');
  const ct = Buffer.from(ctHex!, 'hex');
  const tag = Buffer.from(tagHex!, 'hex');
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString('utf8');
}
