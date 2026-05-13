'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import MascotReward from '@/components/brand/MascotReward';

/**
 * Cal.com iframe wrapper that listens for the `bookingSuccessful` event
 * and reveals the Pos 4 mascot overlay on success.
 */
export default function CalEmbed({ src, title = 'Book a call' }: { src: string; title?: string }) {
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Cal posts events as either a string ("CAL:booking-successful")
      // or a structured payload { type: 'bookingSuccessful' | '__bookingSuccessful' }.
      const d = e.data;
      const matches =
        (typeof d === 'string' && /booking[-_]?successful/i.test(d)) ||
        (typeof d === 'object' &&
          d &&
          typeof (d as { type?: string }).type === 'string' &&
          /booking[-_]?successful/i.test((d as { type: string }).type));
      if (matches) setBooked(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]">
        <iframe
          src={src}
          title={title}
          className="h-[640px] w-full"
          loading="lazy"
          allow="payment; camera; microphone; clipboard-read; clipboard-write"
        />
      </div>
      <AnimatePresence>
        {booked ? (
          <MascotReward
            variant="overlay"
            headline="Booked. See you then."
            sub="Calendar invite is on its way. Pre-call: send anything we should look at before the slot."
            onDismiss={() => setBooked(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
