'use client';

/**
 * Booking state machine — pick-date → pick-time → form → done. Auto-detects
 * the visitor's timezone, groups slots by visitor-local date, claims a
 * 5-min hold on the chosen slot while the form is open, captures UTM /
 * referrer / first-touch context from the browser, and POSTs the booking
 * to /api/booking on submit. Renders the success card inline on completion.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
function clearHovers(
  setHoveredDate: (v: string | null) => void,
  setHoveredSlot: (v: import('./SlotList').Slot | null) => void,
) {
  setHoveredDate(null);
  setHoveredSlot(null);
}
import Calendar from './Calendar';
import SlotList, { type Slot } from './SlotList';
import BookingForm, { type BookingFormData } from './BookingForm';
import BookingSuccess from './BookingSuccess';
import DatePreview from './DatePreview';
import ClockPreview from './ClockPreview';

type Step = 'pick-date' | 'pick-time' | 'form' | 'done';

type Props = {
  slots: Slot[];
  ownerTz?: string;
};

type BrowserContext = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  landingPage: string | null;
};

function ymdInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function readBrowserContext(): BrowserContext {
  if (typeof window === 'undefined') {
    return {
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      referrer: null,
      landingPage: null,
    };
  }
  const params = new URLSearchParams(window.location.search);
  const ref = document.referrer || null;
  // Don't store self-referrer (came from another page on our own domain).
  const referrer = ref && !ref.startsWith(window.location.origin) ? ref.slice(0, 500) : null;
  let landingPage: string | null = null;
  try {
    landingPage = sessionStorage.getItem('bd:first-touch');
  } catch {}
  if (!landingPage) landingPage = window.location.pathname;
  return {
    utmSource: params.get('utm_source')?.slice(0, 120) || null,
    utmMedium: params.get('utm_medium')?.slice(0, 120) || null,
    utmCampaign: params.get('utm_campaign')?.slice(0, 120) || null,
    utmTerm: params.get('utm_term')?.slice(0, 120) || null,
    utmContent: params.get('utm_content')?.slice(0, 120) || null,
    referrer,
    landingPage: landingPage?.slice(0, 500) || null,
  };
}

function friendlyError(status: number, code?: string): string {
  if (status === 409 || code === 'slot_taken') {
    return 'That slot was just taken. Pick another and try again.';
  }
  if (status === 429) return 'Slow down — try again in a moment.';
  if (status === 400) return 'Something looked off with your submission. Double-check and retry.';
  return 'Something went sideways. Try again in a sec.';
}

export default function BookingFlow({ slots, ownerTz = 'Asia/Dhaka' }: Props) {
  const [step, setStep] = useState<Step>('pick-date');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<Slot | null>(null);
  const [submittedData, setSubmittedData] = useState<BookingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const holdIdRef = useRef<string | null>(null);

  const previewDate = hoveredDate ?? selectedDate;
  const previewSlot = hoveredSlot ?? selectedSlot;

  // Hover state is reset inside the navigation handlers below instead of via
  // an effect, so we don't trigger React 19's setState-in-effect warning.

  const visitorTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const slot of slots) {
      const d = ymdInTz(new Date(slot.startUtc), visitorTz);
      const arr = map.get(d) ?? [];
      arr.push(slot);
      map.set(d, arr);
    }
    map.forEach((arr) => arr.sort((a, b) => a.startUtc.localeCompare(b.startUtc)));
    return map;
  }, [slots, visitorTz]);

  const availableDates = useMemo(() => new Set(slotsByDate.keys()), [slotsByDate]);
  const slotsForSelectedDate = useMemo(
    () => (selectedDate ? (slotsByDate.get(selectedDate) ?? []) : []),
    [selectedDate, slotsByDate],
  );

  const releaseHold = useCallback(() => {
    const id = holdIdRef.current;
    if (!id) return;
    holdIdRef.current = null;
    fetch(`/api/booking/hold/${id}`, { method: 'DELETE', keepalive: true }).catch(() => {});
  }, []);

  // Release the hold if the visitor navigates away while the form is open.
  useEffect(() => {
    if (step !== 'form' && step !== 'done') {
      releaseHold();
    }
    return () => {
      if (step === 'form') releaseHold();
    };
  }, [step, releaseHold]);

  useEffect(() => {
    const onUnload = () => releaseHold();
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [releaseHold]);

  function pickDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    clearHovers(setHoveredDate, setHoveredSlot);
    setStep('pick-time');
  }

  async function pickSlot(slot: Slot) {
    setSelectedSlot(slot);
    setError(null);
    clearHovers(setHoveredDate, setHoveredSlot);
    setStep('form');
    // Fire-and-forget claim a 5-min hold so other visitors can't race us.
    try {
      const res = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ startUtc: slot.startUtc }),
      });
      if (res.ok) {
        const { holdId } = (await res.json()) as { holdId?: string };
        if (holdId) holdIdRef.current = holdId;
      }
    } catch {
      // Hold is a best-effort — booking will still race-check at POST time.
    }
  }

  function back() {
    setError(null);
    clearHovers(setHoveredDate, setHoveredSlot);
    if (step === 'form') setStep('pick-time');
    else if (step === 'pick-time') setStep('pick-date');
  }

  async function handleSubmit(data: BookingFormData) {
    if (!selectedSlot || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const ctx = readBrowserContext();
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startUtc: selectedSlot.startUtc,
          visitorTz,
          holdId: holdIdRef.current,
          ...ctx,
        }),
      });
      const json = await res.json().catch(() => ({}) as { error?: string; code?: string });
      if (!res.ok) {
        setError(friendlyError(res.status, json.code));
        return;
      }
      holdIdRef.current = null;
      setSubmittedData(data);
      setStep('done');
    } catch {
      setError('Something went sideways. Try again in a sec.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setStep('pick-date');
    setSelectedDate(null);
    setSelectedSlot(null);
    setSubmittedData(null);
    setError(null);
    clearHovers(setHoveredDate, setHoveredSlot);
    holdIdRef.current = null;
  }

  const HEADERS: Record<Step, { label: string; index: number }> = {
    'pick-date': { label: 'Pick a day', index: 1 },
    'pick-time': { label: 'Pick a time', index: 2 },
    form: { label: 'Your details', index: 3 },
    done: { label: 'Done', index: 3 },
  };

  const showBack = step === 'pick-time' || step === 'form';

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)] p-6 md:p-8">
      <header className="mb-6 flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          Step {HEADERS[step].index} / 3 — {HEADERS[step].label}
        </p>
        {showBack ? (
          <button
            type="button"
            onClick={back}
            className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/65 uppercase transition-colors hover:text-[color:var(--bd-lime)]"
          >
            ← Back
          </button>
        ) : (
          <span className="font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/40 uppercase">
            15 min · free
          </span>
        )}
      </header>

      <div className="relative min-h-[420px]">
        {step === 'pick-date' && (
          <>
            <Calendar
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelect={pickDate}
              onHover={setHoveredDate}
              visitorTz={visitorTz}
            />
            <div className="mt-6">
              <DatePreview date={previewDate} />
            </div>
          </>
        )}
        {step === 'pick-time' && (
          <>
            <SlotList
              slots={slotsForSelectedDate}
              selectedSlot={selectedSlot}
              onSelect={pickSlot}
              onHover={setHoveredSlot}
              visitorTz={visitorTz}
            />
            <div className="mt-6">
              <ClockPreview slot={previewSlot} visitorTz={visitorTz} />
            </div>
          </>
        )}
        {step === 'form' && selectedSlot && (
          <BookingForm
            slot={selectedSlot}
            visitorTz={visitorTz}
            ownerTz={ownerTz}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}
        {step === 'done' && selectedSlot && submittedData && (
          <BookingSuccess
            slot={selectedSlot}
            visitorTz={visitorTz}
            email={submittedData.email}
            onDismiss={reset}
          />
        )}
      </div>
    </div>
  );
}
