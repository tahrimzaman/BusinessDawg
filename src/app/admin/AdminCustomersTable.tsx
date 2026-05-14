'use client';

/**
 * Customers list — promoted bookings that became real engagements. Filter
 * by stage (Prospect / Active / Delivered / Churned / All), search by name
 * or company, click row → /admin/customers/[id]. Sorted by deadline urgency
 * within each stage.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Stage = 'PROSPECT' | 'ACTIVE' | 'DELIVERED' | 'CHURNED';

type Customer = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  stage: Stage;
  desiredDeadline: string | null;
  promotedAt: string;
  updatedAt: string;
};

const STAGE_LABEL: Record<Stage, string> = {
  PROSPECT: 'Prospect',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CHURNED: 'Churned',
};
const STAGE_CLASS: Record<Stage, string> = {
  PROSPECT: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  ACTIVE:
    'border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]',
  DELIVERED: 'border-white/15 bg-white/5 text-[color:var(--bd-bone)]/80',
  CHURNED:
    'border-[color:var(--bd-signal)]/40 bg-[color:var(--bd-signal)]/10 text-[color:var(--bd-signal)]',
};

type Filter = Stage | 'all';

export default function AdminCustomersTable({
  customers,
  ownerTz,
}: {
  customers: Customer[];
  ownerTz: string;
}) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  const fmtDeadline = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    [ownerTz],
  );
  const fmtPromoted = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        month: 'short',
        day: 'numeric',
      }),
    [ownerTz],
  );

  const filtered = useMemo(() => {
    let list = customers;
    if (filter !== 'all') list = list.filter((c) => c.stage === filter);
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q),
    );
  }, [customers, filter, query]);

  const counts = useMemo(() => {
    const c: Record<Stage, number> = { PROSPECT: 0, ACTIVE: 0, DELIVERED: 0, CHURNED: 0 };
    for (const cust of customers) c[cust.stage]++;
    return c;
  }, [customers]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          All · {customers.length}
        </FilterButton>
        <FilterButton active={filter === 'PROSPECT'} onClick={() => setFilter('PROSPECT')}>
          Prospect · {counts.PROSPECT}
        </FilterButton>
        <FilterButton active={filter === 'ACTIVE'} onClick={() => setFilter('ACTIVE')}>
          Active · {counts.ACTIVE}
        </FilterButton>
        <FilterButton active={filter === 'DELIVERED'} onClick={() => setFilter('DELIVERED')}>
          Delivered · {counts.DELIVERED}
        </FilterButton>
        <FilterButton active={filter === 'CHURNED'} onClick={() => setFilter('CHURNED')}>
          Churned · {counts.CHURNED}
        </FilterButton>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, email, company…"
          className="ml-auto h-10 w-full max-w-xs rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-4 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
        {filtered.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[color:var(--bd-bone)]/65">
            {customers.length === 0
              ? 'No customers yet. Promote a booking from the Bookings tab.'
              : 'No customers match.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8 bg-black/20 text-left font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase">
                <tr>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Deadline</th>
                  <th className="px-4 py-3">Promoted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 align-top last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-widest uppercase ${STAGE_CLASS[c.stage]}`}
                      >
                        {STAGE_LABEL[c.stage]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="hover:text-[color:var(--bd-lime)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${c.email}`} className="hover:text-[color:var(--bd-lime)]">
                        {c.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[color:var(--bd-bone)]/70">{c.company || '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/70">
                      {c.desiredDeadline ? fmtDeadline.format(new Date(c.desiredDeadline)) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[color:var(--bd-bone)]/55">
                      {fmtPromoted.format(new Date(c.promotedAt))}
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
