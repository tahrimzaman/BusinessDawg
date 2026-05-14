'use client';

/**
 * Customer detail editor. Top bar with stage selector. Editable fields:
 * service description (large textarea), desired deadline (date picker),
 * pricing notes, internal notes (Tahrim's private journal). Contact info
 * is editable too — denormalized fields can drift from the source booking
 * over time. Single "Save changes" button at the bottom; type-to-confirm
 * hard delete in the danger zone.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Stage = 'PROSPECT' | 'ACTIVE' | 'DELIVERED' | 'CHURNED';
type BookingStatus = 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

type Customer = {
  id: string;
  bookingId: string | null;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  serviceDescription: string;
  desiredDeadline: string | null;
  pricingNotes: string | null;
  internalNotes: string | null;
  stage: Stage;
  promotedAt: string;
  updatedAt: string;
};

type SourceBooking = {
  id: string;
  startUtc: string;
  visitorTz: string;
  intent: string;
  status: BookingStatus;
} | null;

type PriorBooking = {
  id: string;
  startUtc: string;
  status: BookingStatus;
  intent: string;
};

const STAGE_LABEL: Record<Stage, string> = {
  PROSPECT: 'Prospect',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CHURNED: 'Churned',
};
const STAGE_OPTIONS: Stage[] = ['PROSPECT', 'ACTIVE', 'DELIVERED', 'CHURNED'];

const STATUS_LABEL: Record<BookingStatus, string> = {
  CONFIRMED: 'Confirmed',
  RESCHEDULED: 'Rescheduled',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
  NO_SHOW: 'No-show',
};

export default function CustomerDetailClient({
  customer,
  sourceBooking,
  priorBookings,
  ownerTz,
}: {
  customer: Customer;
  sourceBooking: SourceBooking;
  priorBookings: PriorBooking[];
  ownerTz: string;
}) {
  const router = useRouter();

  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email);
  const [company, setCompany] = useState(customer.company ?? '');
  const [phone, setPhone] = useState(customer.phone ?? '');
  const [serviceDescription, setServiceDescription] = useState(customer.serviceDescription);
  const [desiredDeadline, setDesiredDeadline] = useState(
    customer.desiredDeadline ? customer.desiredDeadline.slice(0, 10) : '',
  );
  const [pricingNotes, setPricingNotes] = useState(customer.pricingNotes ?? '');
  const [internalNotes, setInternalNotes] = useState(customer.internalNotes ?? '');
  const [stage, setStage] = useState<Stage>(customer.stage);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const promotedAtLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(customer.promotedAt)),
    [customer.promotedAt, ownerTz],
  );

  const updatedLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(customer.updatedAt)),
    [customer.updatedAt, ownerTz],
  );

  async function save() {
    if (saveState === 'saving') return;
    setSaveState('saving');
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company: company.trim() || null,
          phone: phone.trim() || null,
          serviceDescription,
          desiredDeadline: desiredDeadline ? `${desiredDeadline}T00:00:00.000Z` : null,
          pricingNotes: pricingNotes.trim() || null,
          internalNotes: internalNotes.trim() || null,
          stage,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || 'save failed');
      }
      setSaveState('done');
      router.refresh();
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'save failed');
      setSaveState('error');
    }
  }

  async function hardDelete() {
    if (deleting) return;
    if (deleteConfirm.trim().toLowerCase() !== 'delete') {
      setError('Type "delete" to confirm.');
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}?confirm=delete`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('delete failed');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-3xl px-6 pb-24">
      <Link
        href="/admin"
        className="inline-flex items-center font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase hover:text-[color:var(--bd-lime)]"
      >
        ← Back to admin
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
          / Customer
        </span>
        <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
          Promoted {promotedAtLabel}
        </span>
        <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
          Updated {updatedLabel}
        </span>
      </div>

      <h1 className="font-display mt-3 text-3xl leading-[1.1] font-extrabold tracking-tight italic sm:text-4xl">
        <span className="text-[color:var(--bd-lime)]">{customer.name}</span>
      </h1>

      {sourceBooking && (
        <p className="mt-2 text-sm text-[color:var(--bd-bone)]/70">
          Promoted from{' '}
          <Link
            href={`/admin/bookings/${sourceBooking.id}`}
            className="text-[color:var(--bd-lime)] hover:underline"
          >
            booking on{' '}
            {new Intl.DateTimeFormat('en-US', {
              timeZone: ownerTz,
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(sourceBooking.startUtc))}{' '}
            ({STATUS_LABEL[sourceBooking.status]})
          </Link>
        </p>
      )}
      {!sourceBooking && customer.bookingId === null && (
        <p className="mt-2 text-sm text-[color:var(--bd-bone)]/55">
          Source booking was deleted — customer record kept.
        </p>
      )}

      {/* Stage */}
      <section className="mt-6 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6">
        <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Stage
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STAGE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStage(s)}
              className={`inline-flex h-9 items-center rounded-full border px-4 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                stage === s
                  ? 'border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)]'
                  : 'border-white/10 text-[color:var(--bd-bone)]/65 hover:border-[color:var(--bd-lime)]/40'
              }`}
            >
              {STAGE_LABEL[s]}
            </button>
          ))}
        </div>
      </section>

      {/* Contact */}
      <Section title="Contact">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Company">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      {/* Service description */}
      <Section title="Service description">
        <textarea
          value={serviceDescription}
          onChange={(e) => setServiceDescription(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="What we're building for them. e.g. 'Shopify site + 3 automation flows + brand refresh.'"
          className={`${INPUT_BASE} min-h-[160px] resize-y py-4`}
        />
      </Section>

      {/* Deadline + pricing */}
      <Section title="Deadline + pricing">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[180px_1fr]">
          <Field label="Desired deadline">
            <input
              type="date"
              value={desiredDeadline}
              onChange={(e) => setDesiredDeadline(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Pricing notes">
            <input
              type="text"
              value={pricingNotes}
              onChange={(e) => setPricingNotes(e.target.value)}
              placeholder="e.g. 'Quoted $8k flat — 50% on signoff'"
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      {/* Internal notes */}
      <Section title="Internal notes (private)">
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={8}
          maxLength={10000}
          placeholder="Your private journal — call summaries, decisions, follow-ups. Visitor never sees this."
          className={`${INPUT_BASE} min-h-[200px] resize-y py-4`}
        />
      </Section>

      {/* Cross context */}
      {(priorBookings.length > 0 || sourceBooking) && (
        <Section title="Booking history" eyebrowAccent>
          {sourceBooking && (
            <div className="mb-3 rounded-2xl border border-[color:var(--bd-lime)]/20 bg-[color:var(--bd-ink)] p-3">
              <p className="mb-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
                Source booking
              </p>
              <Link
                href={`/admin/bookings/${sourceBooking.id}`}
                className="text-sm text-[color:var(--bd-bone)] hover:text-[color:var(--bd-lime)]"
              >
                <span className="line-clamp-2">{sourceBooking.intent}</span>
              </Link>
            </div>
          )}
          {priorBookings.length > 0 && (
            <ul className="space-y-2">
              {priorBookings.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[color:var(--bd-ink)] p-3"
                >
                  <span className="font-mono text-xs whitespace-nowrap text-[color:var(--bd-bone)]/70">
                    {new Intl.DateTimeFormat('en-US', {
                      timeZone: ownerTz,
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    }).format(new Date(p.startUtc))}
                  </span>
                  <span className="font-mono text-[9px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
                    {STATUS_LABEL[p.status]}
                  </span>
                  <span className="line-clamp-1 flex-1 text-xs text-[color:var(--bd-bone)]/65">
                    {p.intent}
                  </span>
                  <Link
                    href={`/admin/bookings/${p.id}`}
                    className="font-mono text-[9px] tracking-widest text-[color:var(--bd-lime)] uppercase hover:underline"
                  >
                    View →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Danger zone */}
      <Section title="Danger zone" eyebrowDanger>
        <p className="text-sm text-[color:var(--bd-bone)]/65">
          Permanently removes the customer record. The source booking stays in the DB so the
          original lead history isn&apos;t lost.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder='Type "delete" to confirm'
            className="h-10 w-full max-w-xs rounded-full border border-white/10 bg-[color:var(--bd-ink)] px-4 text-sm focus:border-[color:var(--bd-signal)] focus:outline-none"
          />
          <button
            type="button"
            onClick={hardDelete}
            disabled={deleting || deleteConfirm.trim().toLowerCase() !== 'delete'}
            className="inline-flex h-10 items-center rounded-full border border-[color:var(--bd-signal)]/60 bg-[color:var(--bd-signal)]/10 px-4 font-mono text-[10px] tracking-widest text-[color:var(--bd-signal)] uppercase transition-colors hover:bg-[color:var(--bd-signal)]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
      </Section>

      {/* Sticky save */}
      <div className="sticky bottom-4 mt-8 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[color:var(--bd-smoke)]/95 p-3 backdrop-blur">
        <p
          className={
            'font-mono text-[10px] tracking-widest uppercase ' +
            (saveState === 'done'
              ? 'text-[color:var(--bd-lime)]'
              : saveState === 'error' || error
                ? 'text-[color:var(--bd-signal)]'
                : 'text-[color:var(--bd-bone)]/60')
          }
        >
          {saveState === 'saving'
            ? 'Saving…'
            : saveState === 'done'
              ? '✓ Saved'
              : error
                ? `Error: ${error}`
                : 'Edit fields above, then save.'}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saveState === 'saving'}
          className="inline-flex h-11 items-center rounded-full bg-[color:var(--bd-lime)] px-5 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:opacity-60"
        >
          {saveState === 'saving' ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

const INPUT_BASE =
  'w-full rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] px-4 text-sm text-[color:var(--bd-bone)] placeholder:text-[color:var(--bd-bone)]/55 focus:border-[color:var(--bd-lime)] focus:outline-none';
const INPUT = `${INPUT_BASE} h-11`;

function Section({
  title,
  eyebrowAccent,
  eyebrowDanger,
  children,
}: {
  title: string;
  eyebrowAccent?: boolean;
  eyebrowDanger?: boolean;
  children: React.ReactNode;
}) {
  const tone = eyebrowDanger
    ? 'text-[color:var(--bd-signal)]'
    : eyebrowAccent
      ? 'text-amber-300'
      : 'text-[color:var(--bd-lime)]';
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6">
      <p className={`font-mono text-[10px] tracking-widest uppercase ${tone}`}>/ {title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
