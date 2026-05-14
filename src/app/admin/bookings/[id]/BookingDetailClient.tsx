'use client';

/**
 * Interactive booking detail. Lays out: top bar with status + quick actions
 * (mark no-show, mark completed, cancel + notify, hard delete), a "Pre-call
 * context" card with the visitor's intent / contact / source / UTM /
 * referrer / location, a repeat-visitor card if the email matches anything
 * else in the DB, the chronological activity log, and a danger zone for the
 * type-to-confirm hard delete.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Status = 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
type CustomerStage = 'PROSPECT' | 'ACTIVE' | 'DELIVERED' | 'CHURNED';

type Event = {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

type Booking = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  phone: string | null;
  intent: string;
  source: string | null;
  startUtc: string;
  endUtc: string;
  visitorTz: string;
  status: Status;
  meetUrl: string | null;
  needsMeetLink: boolean;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  landingPage: string | null;
  approxLocation: string | null;
  createdAt: string;
  events: Event[];
};

type PriorBooking = {
  id: string;
  startUtc: string;
  status: Status;
  intent: string;
};

type Subscriber = { source: string; createdAt: string } | null;

type Application = {
  role: string | null;
  portfolio: string | null;
  note: string | null;
  createdAt: string;
} | null;

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

const CUSTOMER_STAGE_LABEL: Record<CustomerStage, string> = {
  PROSPECT: 'Prospect',
  ACTIVE: 'Active',
  DELIVERED: 'Delivered',
  CHURNED: 'Churned',
};

export default function BookingDetailClient({
  booking,
  customer,
  ownerTz,
  meetingTitle,
  priorBookings,
  subscriber,
  application,
}: {
  booking: Booking;
  customer: { id: string; stage: CustomerStage } | null;
  ownerTz: string;
  meetingTitle: string;
  priorBookings: PriorBooking[];
  subscriber: Subscriber;
  application: Application;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const visitorWhen = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: booking.visitorTz,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date(booking.startUtc)),
    [booking.startUtc, booking.visitorTz],
  );
  const ownerWhen = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date(booking.startUtc)),
    [booking.startUtc, ownerTz],
  );
  const bookedAt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: ownerTz,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(booking.createdAt)),
    [booking.createdAt, ownerTz],
  );

  async function setStatus(status: 'COMPLETED' | 'NO_SHOW' | 'CONFIRMED') {
    if (busy) return;
    setBusy(status);
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/status`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('status update failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setBusy(null);
    }
  }

  async function cancel() {
    if (busy) return;
    if (!confirm('Cancel this booking and email the visitor?')) return;
    setBusy('cancel');
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, { method: 'POST' });
      if (!res.ok) throw new Error('cancel failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
    } finally {
      setBusy(null);
    }
  }

  async function hardDelete() {
    if (busy) return;
    if (deleteConfirm.trim().toLowerCase() !== 'delete') {
      setError('Type "delete" to confirm.');
      return;
    }
    setBusy('delete');
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}?confirm=delete`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('delete failed');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
      setBusy(null);
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(booking.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 1500);
    } catch {}
  }

  async function promote() {
    if (busy) return;
    if (!confirm('Promote this booking to a customer?')) return;
    setBusy('promote');
    setError(null);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}/promote`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { customerId?: string; error?: string };
      if (!res.ok || !json.customerId) throw new Error(json.error || 'promote failed');
      router.push(`/admin/customers/${json.customerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'failed');
      setBusy(null);
    }
  }

  const draftHref = `mailto:${booking.email}?subject=${encodeURIComponent(
    `Re: ${meetingTitle} — ${new Intl.DateTimeFormat('en-US', {
      timeZone: booking.visitorTz,
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(booking.startUtc))}`,
  )}`;

  return (
    <div className="mx-auto mt-24 max-w-3xl px-6 pb-24">
      <Link
        href="/admin"
        className="inline-flex items-center font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase hover:text-[color:var(--bd-lime)]"
      >
        ← Back to admin
      </Link>

      {/* Top bar with status + actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase ${STATUS_CLASS[booking.status]}`}
        >
          {STATUS_LABEL[booking.status]}
        </span>
        {customer && (
          <Link
            href={`/admin/customers/${customer.id}`}
            className="inline-flex items-center rounded-full border border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 px-3 py-1.5 font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase hover:bg-[color:var(--bd-lime)]/20"
          >
            Customer · {CUSTOMER_STAGE_LABEL[customer.stage]} →
          </Link>
        )}
        {booking.meetUrl &&
          (booking.status === 'CONFIRMED' || booking.status === 'RESCHEDULED') && (
            <a
              href={booking.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-[color:var(--bd-lime)] bg-[color:var(--bd-lime)] px-3 py-1.5 font-mono text-[10px] tracking-widest text-[color:var(--bd-ink)] uppercase hover:bg-[color:var(--bd-bone)]"
            >
              Join Meet →
            </a>
          )}
        {booking.needsMeetLink &&
          (booking.status === 'CONFIRMED' || booking.status === 'RESCHEDULED') && (
            <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] tracking-widest text-amber-300 uppercase">
              Needs Meet link
            </span>
          )}
        <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
          Booked {bookedAt}
        </span>
      </div>

      <h1 className="font-display mt-4 text-3xl leading-[1.1] font-extrabold tracking-tight italic sm:text-4xl">
        15-min call with <span className="text-[color:var(--bd-lime)]">{booking.name}</span>
      </h1>
      <p className="mt-2 text-[color:var(--bd-bone)]/70">
        {visitorWhen}
        <span className="text-[color:var(--bd-bone)]/40"> · their tz</span>
      </p>
      <p className="mt-1 text-sm text-[color:var(--bd-bone)]/55">
        {ownerWhen} <span className="text-[color:var(--bd-bone)]/35">· your tz</span>
      </p>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
          <ActionButton onClick={() => setStatus('COMPLETED')} disabled={busy === 'COMPLETED'}>
            {busy === 'COMPLETED' ? '…' : 'Mark completed'}
          </ActionButton>
        )}
        {booking.status !== 'NO_SHOW' && booking.status !== 'CANCELLED' && (
          <ActionButton onClick={() => setStatus('NO_SHOW')} disabled={busy === 'NO_SHOW'}>
            {busy === 'NO_SHOW' ? '…' : 'Mark no-show'}
          </ActionButton>
        )}
        {(booking.status === 'COMPLETED' || booking.status === 'NO_SHOW') && (
          <ActionButton onClick={() => setStatus('CONFIRMED')} disabled={busy === 'CONFIRMED'}>
            {busy === 'CONFIRMED' ? '…' : 'Reopen → Confirmed'}
          </ActionButton>
        )}
        {booking.status !== 'CANCELLED' && (
          <ActionButton onClick={cancel} disabled={busy === 'cancel'} variant="warn">
            {busy === 'cancel' ? '…' : 'Cancel + notify visitor'}
          </ActionButton>
        )}
        {!customer && booking.status !== 'CANCELLED' && (
          <ActionButton onClick={promote} disabled={busy === 'promote'} variant="accent">
            {busy === 'promote' ? '…' : 'Promote to customer →'}
          </ActionButton>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-[color:var(--bd-signal)]">{error}</p>}

      {/* Pre-call context */}
      <Section title="Pre-call context">
        <Field label="Intent">
          <p className="whitespace-pre-wrap text-[color:var(--bd-bone)]">{booking.intent}</p>
        </Field>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${booking.email}`}
                className="text-[color:var(--bd-bone)] hover:text-[color:var(--bd-lime)]"
              >
                {booking.email}
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex h-7 items-center rounded-full border border-white/10 px-3 font-mono text-[9px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
              >
                {emailCopied ? 'Copied ✓' : 'Copy'}
              </button>
              <a
                href={draftHref}
                className="inline-flex h-7 items-center rounded-full border border-white/10 px-3 font-mono text-[9px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]"
              >
                Draft email →
              </a>
            </div>
          </Field>
          {booking.phone && (
            <Field label="Phone">
              <a
                href={`tel:${booking.phone}`}
                className="text-[color:var(--bd-bone)] hover:text-[color:var(--bd-lime)]"
              >
                {booking.phone}
              </a>
            </Field>
          )}
          {(booking.company || booking.role) && (
            <Field label="Company / role">
              <p className="text-[color:var(--bd-bone)]">
                {[booking.company, booking.role].filter(Boolean).join(' · ')}
              </p>
            </Field>
          )}
          {booking.source && (
            <Field label="How they found us (self-report)">
              <p className="text-[color:var(--bd-bone)]">{booking.source}</p>
            </Field>
          )}
          {booking.approxLocation && (
            <Field label="Approx location">
              <p className="text-[color:var(--bd-bone)]">{booking.approxLocation}</p>
            </Field>
          )}
          <Field label="Visitor timezone">
            <p className="text-[color:var(--bd-bone)]">{booking.visitorTz.replace(/_/g, ' ')}</p>
          </Field>
        </div>

        {(booking.utmSource ||
          booking.utmMedium ||
          booking.utmCampaign ||
          booking.referrer ||
          booking.landingPage) && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] p-4">
            <p className="mb-2 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
              Attribution
            </p>
            <dl className="grid grid-cols-1 gap-1.5 text-sm">
              {booking.utmSource && <Row k="utm_source" v={booking.utmSource} />}
              {booking.utmMedium && <Row k="utm_medium" v={booking.utmMedium} />}
              {booking.utmCampaign && <Row k="utm_campaign" v={booking.utmCampaign} />}
              {booking.utmTerm && <Row k="utm_term" v={booking.utmTerm} />}
              {booking.utmContent && <Row k="utm_content" v={booking.utmContent} />}
              {booking.referrer && <Row k="referrer" v={booking.referrer} />}
              {booking.landingPage && <Row k="landing" v={booking.landingPage} />}
            </dl>
          </div>
        )}
      </Section>

      {/* Repeat visitor */}
      {(priorBookings.length > 0 || subscriber || application) && (
        <Section title="Repeat visitor" eyebrowAccent>
          {priorBookings.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-semibold text-[color:var(--bd-bone)]">
                {priorBookings.length} prior booking
                {priorBookings.length === 1 ? '' : 's'}
              </p>
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
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-widest uppercase ${STATUS_CLASS[p.status]}`}
                    >
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
            </div>
          )}
          {subscriber && (
            <p className="text-sm text-[color:var(--bd-bone)]/75">
              Newsletter:{' '}
              <span className="text-[color:var(--bd-bone)]">signed up via {subscriber.source}</span>{' '}
              on{' '}
              {new Intl.DateTimeFormat('en-US', {
                timeZone: ownerTz,
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date(subscriber.createdAt))}
            </p>
          )}
          {application && (
            <p className="mt-1 text-sm text-[color:var(--bd-bone)]/75">
              Application:{' '}
              <span className="text-[color:var(--bd-bone)]">
                applied{application.role ? ` for ${application.role}` : ''}
              </span>{' '}
              on{' '}
              {new Intl.DateTimeFormat('en-US', {
                timeZone: ownerTz,
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }).format(new Date(application.createdAt))}
              {application.portfolio && (
                <>
                  {' · '}
                  <a
                    href={application.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--bd-lime)] hover:underline"
                  >
                    Portfolio ↗
                  </a>
                </>
              )}
            </p>
          )}
        </Section>
      )}

      {/* Activity log */}
      <Section title="Activity log">
        {booking.events.length === 0 ? (
          <p className="text-sm text-[color:var(--bd-bone)]/55">No activity yet.</p>
        ) : (
          <ul className="space-y-2">
            {booking.events.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-baseline gap-3 rounded-xl border border-white/10 bg-[color:var(--bd-ink)] p-3"
              >
                <span className="font-mono text-[10px] tracking-widest whitespace-nowrap text-[color:var(--bd-bone)]/55 uppercase">
                  {new Intl.DateTimeFormat('en-US', {
                    timeZone: ownerTz,
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  }).format(new Date(e.createdAt))}
                </span>
                <span className="font-mono text-xs font-semibold tracking-wide text-[color:var(--bd-lime)] uppercase">
                  {e.type}
                </span>
                {e.payload && (
                  <code className="flex-1 truncate text-xs text-[color:var(--bd-bone)]/60">
                    {JSON.stringify(e.payload)}
                  </code>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Danger zone */}
      <Section title="Danger zone" eyebrowDanger>
        <p className="text-sm text-[color:var(--bd-bone)]/65">
          Permanently removes the booking row + its activity log. Email + calendar history stays in
          your inbox. Use only for spam or test bookings.
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
            disabled={busy === 'delete' || deleteConfirm.trim().toLowerCase() !== 'delete'}
            className="inline-flex h-10 items-center rounded-full border border-[color:var(--bd-signal)]/60 bg-[color:var(--bd-signal)]/10 px-4 font-mono text-[10px] tracking-widest text-[color:var(--bd-signal)] uppercase transition-colors hover:bg-[color:var(--bd-signal)]/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy === 'delete' ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
      </Section>
    </div>
  );
}

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
    <section className="mt-8 rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6">
      <p className={`font-mono text-[10px] tracking-widest uppercase ${tone}`}>/ {title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-32 shrink-0 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/55 uppercase">
        {k}
      </dt>
      <dd className="min-w-0 truncate text-[color:var(--bd-bone)]/85">{v}</dd>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  children,
  variant,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: 'warn' | 'accent';
}) {
  const cls =
    variant === 'warn'
      ? 'border-[color:var(--bd-signal)]/40 bg-[color:var(--bd-signal)]/10 text-[color:var(--bd-signal)] hover:bg-[color:var(--bd-signal)]/20'
      : variant === 'accent'
        ? 'border-[color:var(--bd-lime)]/40 bg-[color:var(--bd-lime)]/10 text-[color:var(--bd-lime)] hover:bg-[color:var(--bd-lime)]/20'
        : 'border-white/10 bg-white/5 text-[color:var(--bd-bone)] hover:border-[color:var(--bd-lime)] hover:text-[color:var(--bd-lime)]';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center rounded-full border px-4 font-mono text-[10px] tracking-widest uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
    >
      {children}
    </button>
  );
}
