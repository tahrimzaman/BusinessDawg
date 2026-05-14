import { redirect } from 'next/navigation';
import { isAuthed } from '@/lib/admin/auth';
import { prisma } from '@/lib/db/prisma';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  if (!(await isAuthed())) redirect('/admin/login');

  const [subscribers, applications] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }),
    prisma.application.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }),
  ]);

  return (
    <AdminClient
      subscribers={subscribers.map((s) => ({
        id: s.id,
        email: s.email,
        source: s.source,
        createdAt: s.createdAt.toISOString(),
      }))}
      applications={applications.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: a.role,
        portfolio: a.portfolio,
        note: a.note,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
