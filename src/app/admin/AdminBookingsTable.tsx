'use client';

/**
 * Bookings list — sortable table inside the /admin Bookings tab. Filter by
 * Upcoming / Past / Cancelled / All, search by name/email/intent, click row
 * to open /admin/bookings/[id]. Status badges color-code at a glance.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Status = 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
type Booking = {
  id: string;
  name: string;
  email: string;
  intent: string;
  status: Status;
  startUtc: string;
  visitorTz: string;
  needsMeetLink: boolean;
};

type Filter = 'upcoming' | 'past' | 'cancelled' | 'all';

const STATUS_LABEL: Record<Status, string> = {
  CONFIRMED: 'Confirmed',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
};

const STATUS_CLASS: Record<Status, string> = {
  CONFIRMED:
    'border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]',
  RESCHEDULED:
    'border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]',
  COMPLETED: 'border-white/15 bg-white/5 text-[color:var(--bd-bone)]/80',
  CANCELLED:
    'border-[color:var(--bd-signal)]/40 bg-[color:var(--bd-signal)]/10 text-[color:var(--bd-signal)]',
  NO_SHOW: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

export default function AdminBookingsTable({
  bookings,
  ownerTz,
}: {
  bookings: Booking[];
  ownerTz: string;
}) {
  const [filter, setFilter] = useState<Filter>('upcoming');
  const [query, setQuery] = useState('');

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
    [ownerTz],
  );

  // Stable timestamp captured once at mount via useState initializer —
  // past/upcoming split doesn't need to drift second-by-second.
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    let list = bookings;
    if (filter === 'upcoming') {
      list = list.filter(
        (b) =>
          (b.status === 'CONFIRMED' || b.status === 'RESCHEDULED') && Date.parse(b.startUtc) >= now,
      );
    } else if (filter === 'past') {
      list = list.filter(
        (b) =>
          b.status === 'COMPLETED' ||
          b.status === 'NO_SHOW' ||
          ((b.status === 'CONFIRMED' || b.status === 'RESCHEDULED') &&
            Date.parse(b.startUtc) < now),
      );
    } else if (filter === 'cancelled') {
      list = list.filter((b) => b.status === 'CANCELLED');
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.intent.toLowerCase().includes(q),
    );
  }, [bookings, filter, query, now]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterButton active={filter === 'upcoming'} onClick={() => setFilter('upcoming')}>
          Upcoming
        </FilterButton>
        <FilterButton active={filter === 'past'} onClick={() => setFilter('past')}>
          Past
        </FilterButton>
        <FilterButton active={filter === 'cancelled'} onClick={() => setFilter('cancelled')}>
          Cancelled
        </FilterButton>
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterButton>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, intent…"
          className="ml-auto h-10 w-full max-w-xs rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-4 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
        {filtered.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[color:var(--bd-bone)]/65">
            No bookings match.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                <tr>
                  <th className="px-4 py-3">When ({ownerTz.replace(/_/g, ' ')})</th>
                  <th className="px-4 py-3">Who</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-[color:var(--bd-bone)]/75">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="hover:text-[color:var(--bd-lime)]"
                      >
                        {fmt.format(new Date(b.startUtc))}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="hover:text-[color:var(--bd-lime)]"
                      >
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${b.email}`} className="hover:text-[color:var(--bd-lime)]">
                        {b.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--bd-bone)]/70">
                      <span className="line-clamp-2 max-w-xs">{b.intent}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase ${STATUS_CLASS[b.status]}`}
                        >
                          {STATUS_LABEL[b.status]}
                        </span>
                        {b.needsMeetLink &&
                          (b.status === 'CONFIRMED' || b.status === 'RESCHEDULED') && (
                            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 font-mono text-[9px] tracking-widest text-amber-300 uppercase">
                              No meet link
                            </span>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
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
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors ${
        active
          ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]'
          : 'border-white/10 text-[color:var(--bd-bone)]/65 hover:border-[color:var(--bd-lime)]/40'
      }`}
    >
      {children}
    </button>
  );
}
