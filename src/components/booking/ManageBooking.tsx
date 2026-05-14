'use client';

/**
 * Visitor-facing manage UI. Two modes — "reschedule" (reuses Calendar +
 * SlotList + DatePreview + ClockPreview from the new-booking flow) and
 * "cancel" (one big red button with a confirm step). Falls through to a
 * success card on either action.
 */

import { useMemo, useState } from 'react';
import Calendar from './Calendar';
import SlotList, { type Slot } from './SlotList';
import DatePreview from './DatePreview';
import ClockPreview from './ClockPreview';

type Status = 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

type Booking = {
  id: string;
  startUtc: string;
  endUtc: string;
  status: Status;
  visitorTz: string;
  meetUrl: string | null;
};

type Step =
  | 'choose'
  | 'pick-date'
  | 'pick-time'
  | 'confirm-cancel'
  | 'done-rescheduled'
  | 'done-cancelled'
  | 'done-already-cancelled';

function ymdInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function friendlyError(status: number, code?: string): string {
  if (status === 409 || code === 'slot_taken') {
    return 'That slot was just taken. Pick another and try again.';
  }
  if (status === 410) return 'This link has been superseded — check your inbox for a newer email.';
  if (status === 404) return 'This link is invalid or expired.';
  if (status === 429) return 'Slow down — try again in a moment.';
  return 'Something went sideways. Try again in a sec.';
}

export default function ManageBooking({
  token,
  booking,
  slots,
}: {
  token: string;
  booking: Booking;
  slots: Slot[];
}) {
  const initialStep: Step = booking.status === 'CANCELLED' ? 'done-already-cancelled' : 'choose';
  const [step, setStep] = useState<Step>(initialStep);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newSlotIso, setNewSlotIso] = useState<string | null>(null);

  const visitorTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || booking.visitorTz,
    [booking.visitorTz],
  );

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const d = ymdInTz(new Date(s.startUtc), visitorTz);
      const arr = map.get(d) ?? [];
      arr.push(s);
      map.set(d, arr);
    }
    map.forEach((arr) => arr.sort((a, b) => a.startUtc.localeCompare(b.startUtc)));
    return map;
  }, [slots, visitorTz]);

  const availableDates = useMemo(() => new Set(slotsByDate.keys()), [slotsByDate]);
  const slotsForSelected = useMemo(
    () => (selectedDate ? (slotsByDate.get(selectedDate) ?? []) : []),
    [selectedDate, slotsByDate],
  );

  const currentWhen = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        timeZone: visitorTz,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      }).format(new Date(booking.startUtc)),
    [booking.startUtc, visitorTz],
  );

  async function submitReschedule(slot: Slot) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/${token}/reschedule`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startUtc: slot.startUtc }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok) {
        setError(friendlyError(res.status, json.code));
        return;
      }
      setNewSlotIso(slot.startUtc);
      setStep('done-rescheduled');
    } catch {
      setError('Something went sideways. Try again in a sec.');
    } finally {
      setBusy(false);
    }
  }

  async function submitCancel() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/booking/${token}/cancel`, { method: 'POST' });
      const json = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
      if (!res.ok) {
        setError(friendlyError(res.status, json.code));
        return;
      }
      setStep('done-cancelled');
    } catch {
      setError('Something went sideways. Try again in a sec.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6 md:p-8">
      <header className="mb-6">
        <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Currently booked
        </p>
        <p className="font-display mt-1 text-lg font-bold text-[color:var(--bd-bone)] sm:text-xl">
          {currentWhen}
        </p>
      </header>

      {step === 'choose' && (
        <div className="space-y-4">
          <p className="text-[color:var(--bd-bone)]/70">What do you want to do?</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setStep('pick-date')}
              className="inline-flex h-12 items-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)]"
            >
              Reschedule →
            </button>
            <button
              type="button"
              onClick={() => setStep('confirm-cancel')}
              className="inline-flex h-12 items-center rounded-full border border-[color:var(--bd-signal)]/40 bg-[color:var(--bd-signal)]/10 px-6 text-sm font-semibold text-[color:var(--bd-signal)] transition-colors hover:bg-[color:var(--bd-signal)]/20"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {step === 'pick-date' && (
        <>
          <Calendar
            availableDates={availableDates}
            selectedDate={selectedDate}
            onSelect={(d) => {
              setSelectedDate(d);
              setSelectedSlot(null);
              setStep('pick-time');
            }}
            onHover={setHoveredDate}
            visitorTz={visitorTz}
          />
          <div className="mt-6">
            <DatePreview date={hoveredDate ?? selectedDate} />
          </div>
          <BackButton onClick={() => setStep('choose')} />
        </>
      )}

      {step === 'pick-time' && (
        <>
          <SlotList
            slots={slotsForSelected}
            selectedSlot={selectedSlot}
            onSelect={(s) => {
              setSelectedSlot(s);
              submitReschedule(s);
            }}
            onHover={setHoveredSlot}
            visitorTz={visitorTz}
          />
          <div className="mt-6">
            <ClockPreview slot={hoveredSlot ?? selectedSlot} visitorTz={visitorTz} />
          </div>
          {error && (
            <p className="mt-3 text-sm text-[color:var(--bd-signal)]" role="alert">
              {error}
            </p>
          )}
          <BackButton onClick={() => setStep('pick-date')} disabled={busy} />
        </>
      )}

      {step === 'confirm-cancel' && (
        <div className="space-y-4">
          <p className="text-[color:var(--bd-bone)]/80">
            Cancel your {currentWhen} call? You can rebook any time at /contact.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitCancel}
              disabled={busy}
              className="inline-flex h-12 items-center rounded-full border border-[color:var(--bd-signal)] bg-[color:var(--bd-signal)]/15 px-6 text-sm font-semibold text-[color:var(--bd-signal)] disabled:opacity-50"
            >
              {busy ? 'Cancelling…' : 'Yes, cancel the call'}
            </button>
            <button
              type="button"
              onClick={() => setStep('choose')}
              disabled={busy}
              className="inline-flex h-12 items-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-[color:var(--bd-bone)] hover:border-[color:var(--bd-lime)] disabled:opacity-50"
            >
              Keep booking
            </button>
          </div>
          {error && (
            <p className="text-sm text-[color:var(--bd-signal)]" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {step === 'done-rescheduled' && newSlotIso && (
        <Done
          headline="Rescheduled. New time locked in."
          sub={`We've moved your call to ${new Intl.DateTimeFormat('en-US', {
            timeZone: visitorTz,
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZoneName: 'short',
          }).format(new Date(newSlotIso))}. A fresh confirmation email is on the way.`}
        />
      )}

      {step === 'done-cancelled' && (
        <Done
          headline="Cancelled. Sorry to miss you."
          sub="The booking is off the calendar. Rebook any time at /contact when it works for you."
        />
      )}

      {step === 'done-already-cancelled' && (
        <Done
          headline="Already cancelled."
          sub="This booking was previously cancelled. Visit /contact to book a new slot."
        />
      )}
    </div>
  );
}

function BackButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-6 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase transition-colors hover:text-[color:var(--bd-lime)] disabled:opacity-50"
    >
      ← Back
    </button>
  );
}

function Done({ headline, sub }: { headline: string; sub: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase">
        / Done
      </p>
      <h2 className="font-display mt-2 text-3xl leading-[1.05] font-extrabold italic">
        <span className="text-[color:var(--bd-lime)]">{headline}</span>
      </h2>
      <p className="mt-3 text-[color:var(--bd-bone)]/70">{sub}</p>
      <a
        href="/contact"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-[color:var(--bd-lime)] px-5 text-sm font-semibold text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)]"
      >
        Back to /contact →
      </a>
    </div>
  );
}
