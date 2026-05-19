import { prisma } from '@/lib/db/prisma';
import { decryptToken } from '@/lib/security/crypto';

/**
 * Load + decrypt the singleton GoogleToken row. Returns null when the row
 * is absent (Google not yet connected) so callers can fail-open without an
 * extra `if (!token)` branch chain.
 *
 * Legacy plaintext rows pass through `decryptToken` unchanged, so this is
 * safe to deploy before any backfill — see [src/lib/security/crypto.ts].
 */
export async function loadGoogleToken(): Promise<{
  refreshToken: string;
  accessToken: string | null;
  expiresAt: Date | null;
} | null> {
  const row = await prisma.googleToken.findUnique({ where: { id: 'singleton' } });
  if (!row) return null;
  return {
    refreshToken: decryptToken(row.refreshToken),
    accessToken: row.accessToken ? decryptToken(row.accessToken) : null,
    expiresAt: row.expiresAt,
  };
}
