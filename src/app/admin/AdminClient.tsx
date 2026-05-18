'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminAvailabilityPanel from './AdminAvailabilityPanel';
import AdminBookingsTable from './AdminBookingsTable';
import AdminBuildLogTable, { type BuildLogRow } from './AdminBuildLogTable';
import AdminChatTab, { type ChatLogRow } from './AdminChatTab';
import AdminCustomersTable from './AdminCustomersTable';
import AdminGoogleConnection, { type GoogleConnectionState } from './AdminGoogleConnection';
import AdminOverview from './AdminOverview';
import AdminTrafficTab, { type TrafficData } from './AdminTrafficTab';
import type { DashboardStats } from '@/lib/admin/stats';

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

type AvailabilityWindow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
};
type AvailabilityException = {
  date: string;
  blocked: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
};
type BookingRule = {
  durationMin: number;
  minNoticeMin: number;
  maxHorizonDays: number;
  bufferMin: number;
  maxPerDay: number;
  ownerTz: string;
  meetingTitle: string;
};

type BookingStatus = 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
type BookingRow = {
  id: string;
  name: string;
  email: string;
  intent: string;
  status: BookingStatus;
  startUtc: string;
  visitorTz: string;
  needsMeetLink: boolean;
};

type CustomerStage = 'PROSPECT' | 'ACTIVE' | 'DELIVERED' | 'CHURNED';
type CustomerRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  stage: CustomerStage;
  desiredDeadline: string | null;
  promotedAt: string;
  updatedAt: string;
};

type Tab =
  | 'overview'
  | 'traffic'
  | 'bookings'
  | 'chat'
  | 'customers'
  | 'applications'
  | 'subscribers'
  | 'buildlog'
  | 'availability';

export default function AdminClient({
  subscribers,
  applications,
  bookings,
  customers,
  availabilityWindows,
  availabilityExceptions,
  bookingRule,
  google,
  buildLog,
  stats,
  traffic,
  chatLogs,
}: {
  subscribers: Subscriber[];
  applications: Application[];
  bookings: BookingRow[];
  customers: CustomerRow[];
  availabilityWindows: AvailabilityWindow[];
  availabilityExceptions: AvailabilityException[];
  bookingRule: BookingRule;
  google: GoogleConnectionState;
  buildLog: BuildLogRow[];
  stats: DashboardStats;
  traffic: TrafficData;
  chatLogs: ChatLogRow[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

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
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-6xl px-6 pb-24">
      <AdminGoogleConnection initial={google} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
            / Admin
          </p>
          <h1 className="font-display mt-2 text-4xl font-extrabold tracking-tight italic">Leads</h1>
          <p className="mt-2 text-sm text-[color:var(--bd-bone)]/60">
            {bookings.length} booking{bookings.length === 1 ? '' : 's'} · {customers.length}{' '}
            customer{customers.length === 1 ? '' : 's'} · {applications.length} application
            {applications.length === 1 ? '' : 's'} · {subscribers.length} subscriber
            {subscribers.length === 1 ? '' : 's'}
          </p>
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs tracking-widest text-[color:var(--bd-bone)]/70 uppercase hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loggingOut ? 'Logging out…' : 'Log out'}
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {/* Grouped tab bar — Activity → Pipeline → Content → Settings.
            Dividers + glyph prefixes give it scannable visual hierarchy. */}
        <div className="flex flex-wrap items-center gap-2">
          <TabButton
            active={tab === 'overview'}
            primary
            glyph="◐"
            onClick={() => setTab('overview')}
          >
            Overview
          </TabButton>
          <TabButton active={tab === 'traffic'} glyph="◉" onClick={() => setTab('traffic')}>
            Traffic
          </TabButton>
          <TabButton active={tab === 'bookings'} glyph="▦" onClick={() => setTab('bookings')}>
            Bookings · {bookings.length}
          </TabButton>
          <TabButton active={tab === 'chat'} glyph="💬" onClick={() => setTab('chat')}>
            Chat · {chatLogs.length}
          </TabButton>

          <TabDivider />

          <TabButton active={tab === 'customers'} glyph="★" onClick={() => setTab('customers')}>
            Customers · {customers.length}
          </TabButton>
          <TabButton
            active={tab === 'applications'}
            glyph="⌥"
            onClick={() => setTab('applications')}
          >
            Applications · {applications.length}
          </TabButton>
          <TabButton active={tab === 'subscribers'} glyph="✉" onClick={() => setTab('subscribers')}>
            Subscribers · {subscribers.length}
          </TabButton>

          <TabDivider />

          <TabButton active={tab === 'buildlog'} glyph="⊞" onClick={() => setTab('buildlog')}>
            Build log · {buildLog.length}
          </TabButton>

          <TabDivider />

          <TabButton
            active={tab === 'availability'}
            glyph="⚙"
            onClick={() => setTab('availability')}
          >
            Availability
          </TabButton>
        </div>
        {(tab === 'applications' || tab === 'subscribers') && (
          <>
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
          </>
        )}
      </div>

      <div className="mt-6">
        {tab === 'overview' && <AdminOverview stats={stats} />}
        {tab === 'traffic' && <AdminTrafficTab initial={traffic} />}
        {tab === 'chat' && <AdminChatTab rows={chatLogs} />}
        {tab === 'bookings' && (
          <AdminBookingsTable bookings={bookings} ownerTz={bookingRule.ownerTz} />
        )}
        {tab === 'customers' && (
          <AdminCustomersTable customers={customers} ownerTz={bookingRule.ownerTz} />
        )}
        {tab === 'applications' && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
            <ApplicationsTable rows={filteredApps} />
          </div>
        )}
        {tab === 'subscribers' && (
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
            <SubscribersTable rows={filteredSubs} />
          </div>
        )}
        {tab === 'availability' && (
          <AdminAvailabilityPanel
            initialWindows={availabilityWindows}
            initialExceptions={availabilityExceptions}
            initialRule={bookingRule}
          />
        )}
        {tab === 'buildlog' && <AdminBuildLogTable entries={buildLog} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  glyph,
  primary = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  glyph?: string;
  primary?: boolean;
}) {
  const tone = active
    ? primary
      ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)] text-[color:var(--bd-ink)]'
      : 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]'
    : 'border-white/10 text-[color:var(--bd-bone)]/70 hover:border-[color:var(--bd-lime)]/40';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 font-mono text-xs tracking-widest uppercase transition-colors ${tone}`}
    >
      {glyph && (
        <span aria-hidden className="text-[13px] leading-none">
          {glyph}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}

function TabDivider() {
  return <span aria-hidden className="h-5 w-px bg-white/10" />;
}

function ApplicationsTable({ rows }: { rows: Application[] }) {
  if (!rows.length) return <Empty>No applications yet.</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
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
        <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
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
    <div className="px-6 py-16 text-center text-sm text-[color:var(--bd-bone)]/65">{children}</div>
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
