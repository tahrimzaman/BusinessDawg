'use client';

/**
 * Final step of the booking flow — collects name, email, company/role, phone,
 * intent, and how-found. Renders a summary card with the chosen slot in both
 * visitor and owner timezones. Includes honeypot for anti-spam.
 */

import { useState } from 'react';
import Honeypot from '@/components/security/Honeypot';
import type { Slot } from './SlotList';

export type BookingFormData = {
  name: string;
  email: string;
  company: string;
  phone: string;
  intent: string;
  source: string;
};

const SOURCES = [
  { v: 'instagram', label: 'Instagram' },
  { v: 'linkedin', label: 'LinkedIn' },
  { v: 'google', label: 'Google' },
  { v: 'friend', label: 'Friend' },
  { v: 'other', label: 'Other' },
];

type Props = {
  slot: Slot;
  visitorTz: string;
  ownerTz: string;
  onSubmit: (data: BookingFormData) => void;
  isSubmitting: boolean;
  error?: string | null;
};

const INPUT_BASE =
  'w-full rounded-2xl border border-white/10 bg-[color:var(--bd-ink)] px-4 text-sm text-[color:var(--bd-bone)] placeholder:text-[color:var(--bd-bone)]/65 focus:border-[color:var(--bd-lime)] focus:outline-none';
const INPUT = `${INPUT_BASE} h-12`;

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1.5 block font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/70 uppercase">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}

export default function BookingForm({
  slot,
  visitorTz,
  ownerTz,
  onSubmit,
  isSubmitting,
  error,
}: Props) {
  const [data, setData] = useState<BookingFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    intent: '',
    source: '',
  });

  const date = new Date(slot.startUtc);
  const visitorWhen = new Intl.DateTimeFormat('en-US', {
    timeZone: visitorTz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
  const ownerWhen = new Intl.DateTimeFormat('en-US', {
    timeZone: ownerTz,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  function update<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Honeypot />

      <div className="mb-6 rounded-2xl border border-[color:var(--bd-lime)]/30 bg-[color:var(--bd-lime)]/5 p-4">
        <p className="font-mono text-[10px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Your booking
        </p>
        <p className="font-display mt-1 text-lg font-bold text-[color:var(--bd-bone)]">
          15-min call · {visitorWhen}
        </p>
        <p className="mt-1 text-xs text-[color:var(--bd-bone)]/65">
          {ownerTz.replace(/_/g, ' ')}: {ownerWhen}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Name" required>
          <input
            type="text"
            required
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Jane Founder"
            className={INPUT}
            autoComplete="name"
          />
        </Field>
        <Field label="Email" required>
          <input
            type="email"
            required
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@company.com"
            className={INPUT}
            autoComplete="email"
          />
        </Field>
        <Field label="Company / role">
          <input
            type="text"
            value={data.company}
            onChange={(e) => update('company', e.target.value)}
            placeholder="Acme / Founder"
            className={INPUT}
            autoComplete="organization"
          />
        </Field>
        <Field label="Phone (optional)">
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+1 555 0100"
            className={INPUT}
            autoComplete="tel"
          />
        </Field>
      </div>

      <Field label="What do you want to build?" required className="mt-3">
        <textarea
          required
          rows={4}
          value={data.intent}
          onChange={(e) => update('intent', e.target.value)}
          placeholder="A few sentences. The clearer the better."
          className={`${INPUT_BASE} min-h-[120px] resize-y py-4`}
          maxLength={2000}
        />
      </Field>

      <Field label="How did you find us?" required className="mt-3">
        <select
          required
          value={data.source}
          onChange={(e) => update('source', e.target.value)}
          className={INPUT}
        >
          <option value="" disabled>
            Pick one
          </option>
          {SOURCES.map((s) => (
            <option
              key={s.v}
              value={s.v}
              className="bg-[color:var(--bd-ink)] text-[color:var(--bd-bone)]"
            >
              {s.label}
            </option>
          ))}
        </select>
      </Field>

      {error ? (
        <p className="mt-4 text-sm text-[color:var(--bd-signal)]" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] transition-colors hover:bg-[color:var(--bd-bone)] disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
      >
        {isSubmitting ? 'Confirming…' : 'Confirm booking →'}
      </button>

      <p className="mt-4 text-xs text-[color:var(--bd-bone)]/50">
        Confirmation email + Meet link arrive instantly. Cancel any time via the link.
      </p>
    </form>
  );
}
