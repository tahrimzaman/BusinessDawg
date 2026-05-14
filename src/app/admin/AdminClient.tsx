'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Subscriber = { id: string; email: string; source: string; createdAt: string };
type Application = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  portfolio: string | null;
  note: string | null;
  createdAt: string;
};

export default function AdminClient({
  subscribers,
  applications,
}: {
  subscribers: Subscriber[];
  applications: Application[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'applications' | 'subscribers'>('applications');
  const [query, setQuery] = useState('');

  const filteredSubs = useMemo(() => {
    if (!query) return subscribers;
    const q = query.toLowerCase();
    return subscribers.filter(
      (s) => s.email.toLowerCase().includes(q) || s.source.toLowerCase().includes(q),
    );
  }, [subscribers, query]);

  const filteredApps = useMemo(() => {
    if (!query) return applications;
    const q = query.toLowerCase();
    return applications.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.role || '').toLowerCase().includes(q) ||
        (a.note || '').toLowerCase().includes(q),
    );
  }, [applications, query]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <div className="mx-auto mt-24 max-w-6xl px-6 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Admin
          </p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight italic">Leads</h1>
          <p className="mt-2 text-sm text-[color:var(--bd-bone)]/60">
            {applications.length} application{applications.length === 1 ? '' : 's'} ·{' '}
            {subscribers.length} subscriber{subscribers.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/70 uppercase hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
        >
          Log out
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <TabButton active={tab === 'applications'} onClick={() => setTab('applications')}>
            Applications · {applications.length}
          </TabButton>
          <TabButton active={tab === 'subscribers'} onClick={() => setTab('subscribers')}>
            Subscribers · {subscribers.length}
          </TabButton>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="ml-auto h-10 w-full max-w-xs rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-4 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
        <a
          href={`/api/admin/export?type=${tab}`}
          className="inline-flex h-10 items-center rounded-full bg-[color:var(--bd-lime)] px-4 text-sm font-semibold text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)]"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
        {tab === 'applications' ? (
          <ApplicationsTable rows={filteredApps} />
        ) : (
          <SubscribersTable rows={filteredSubs} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 font-mono text-xs tracking-widest uppercase transition-colors ${
        active
          ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]'
          : 'border-white/10 text-[color:var(--bd-bone)]/70 hover:border-[color:var(--bd-lime)]/40'
      }`}
    >
      {children}
    </button>
  );
}

function ApplicationsTable({ rows }: { rows: Application[] }) {
  if (!rows.length) return <Empty>No applications yet.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
            >
              <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/60">
                {formatDate(r.createdAt)}
              </td>
              <td className="px-4 py-3 font-semibold">{r.name}</td>
              <td className="px-4 py-3">
                <a href={`mailto:${r.email}`} className="hover:text-[color:var(--bd-lime)]">
                  {r.email}
                </a>
              </td>
              <td className="px-4 py-3 text-[color:var(--bd-bone)]/70">{r.role || '—'}</td>
              <td className="px-4 py-3 text-[color:var(--bd-bone)]/70">
                {r.note ? <span className="line-clamp-3 whitespace-pre-wrap">{r.note}</span> : '—'}
                {r.portfolio && (
                  <div className="mt-2">
                    <a
                      href={r.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase hover:underline"
                    >
                      Portfolio ↗
                    </a>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscribersTable({ rows }: { rows: Subscriber[] }) {
  if (!rows.length) return <Empty>No subscribers yet.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/50 uppercase">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
              <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/60">
                {formatDate(r.createdAt)}
              </td>
              <td className="px-4 py-3">
                <a href={`mailto:${r.email}`} className="hover:text-[color:var(--bd-lime)]">
                  {r.email}
                </a>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/60">
                {r.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-16 text-center text-sm text-[color:var(--bd-bone)]/50">{children}</div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
