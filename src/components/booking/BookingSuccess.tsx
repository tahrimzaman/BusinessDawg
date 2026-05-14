'use client';

/**
 * Inline success card shown when a booking lands. Replaces the booking-flow
 * content rather than overlaying it — calmer UX and avoids the modal-trap.
 */

import Image from 'next/image';
import type { Slot } from './SlotList';

type Props = {
  slot: Slot;
  visitorTz: string;
  email: string;
  onDismiss: () => void;
};

export default function BookingSuccess({ slot, visitorTz, email, onDismiss }: Props) {
  const when = new Intl.DateTimeFormat('en-US', {
    timeZone: visitorTz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(slot.startUtc));

  return (
    <div className="grid items-center gap-6 sm:grid-cols-[140px_1fr] md:gap-10">
      <div className="relative aspect-[3/4] w-full max-w-[140px]">
        <Image
          src="/brand/mascot-pos-4.png"
          alt="BusinessDawg mascot thumbs up"
          fill
          sizes="140px"
          className="object-contain object-bottom"
        />
      </div>
      <div>
        <p className="font-mono text-[11px] tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Confirmed
        </p>
        <h3 className="font-display mt-2 text-3xl leading-[1.05] font-extrabold italic sm:text-4xl">
          <span className="text-[color:var(--bd-lime)]">Booked. See you then.</span>
        </h3>
        <p className="mt-3 text-sm text-[color:var(--bd-bone)]/70 sm:text-base">
          {when} — confirmation + Meet link on the way to{' '}
          <span className="text-[color:var(--bd-bone)]">{email}</span>.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-[color:var(--bd-lime)] px-5 text-sm font-semibold text-[color:var(--bd-ink)] transition-transform hover:scale-[1.02]"
        >
          Book another →
        </button>
      </div>
    </div>
  );
}
