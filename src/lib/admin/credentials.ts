import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/db/prisma';

// Hardcoded cold-start credentials. On the first login attempt after a fresh
// deploy (or after the AdminCredential row is wiped), these seed the row.
// After that, the password is whatever was last set via the change-password
// UI — the constant below is no longer consulted.
const INITIAL_EMAIL = 'tahrimzaman4@gmail.com';
const INITIAL_PASSWORD = 'I<3MySelf :)';

const SCRYPT_KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, SCRYPT_KEYLEN);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPasswordHash(plain: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], 'hex');
    expected = Buffer.from(parts[2], 'hex');
  } catch {
    return false;
  }
  const got = scryptSync(plain, salt, expected.length);
  if (got.length !== expected.length) return false;
  return timingSafeEqual(got, expected);
}

export async function ensureAdminSeeded(): Promise<void> {
  const existing = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  if (existing) return;
  await prisma.adminCredential.create({
    data: {
      id: 1,
      email: INITIAL_EMAIL,
      passwordHash: hashPassword(INITIAL_PASSWORD),
    },
  });
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  await ensureAdminSeeded();
  const row = await prisma.adminCredential.findUnique({ where: { id: 1 } });
  if (!row) return false;
  if (row.email.toLowerCase() !== email.toLowerCase()) return false;
  return verifyPasswordHash(password, row.passwordHash);
}

export async function updatePassword(newPlain: string): Promise<void> {
  await prisma.adminCredential.update({
    where: { id: 1 },
    data: { passwordHash: hashPassword(newPlain) },
  });
}
