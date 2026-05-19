import { prisma } from '@/lib/db/prisma';
import { clientIp } from '@/lib/security/ratelimit';
import { hashIp } from '@/lib/security/hash';

/**
 * Fire-and-forget audit write for state-changing admin actions. Action names
 * follow the route name passed to `withLogging` (e.g. `admin.bookings.cancel`,
 * `admin.customers.update`) so a grep across logs and the AdminAudit table
 * lines up 1:1.
 *
 * Failures are swallowed — the audit table is bookkeeping, not the source of
 * truth. If Prisma is down, the admin operation should still proceed; we
 * already have structured logs + Sentry as the secondary trail.
 */
export function recordAdminAction(
  req: Request,
  action: string,
  metadata?: Record<string, unknown>,
): void {
  const ip = clientIp(req);
  const userAgent = req.headers.get('user-agent')?.slice(0, 500) || null;
  prisma.adminAudit
    .create({
      data: {
        action,
        actorIpHash: hashIp(ip),
        userAgent,
        metadata: metadata as never,
      },
    })
    .catch(() => {
      /* see file header — audit failures must not break the admin flow */
    });
}
