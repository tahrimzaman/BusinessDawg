import { createHash } from 'node:crypto';

// One-way hash of an IP — enough to dedupe abuse without storing raw IPs.
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}
