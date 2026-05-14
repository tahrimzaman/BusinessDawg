'use client';

type Props = { quotes: string[]; durationSec?: number };

export default function PullQuoteMarquee({ quotes, durationSec = 40 }: Props) {
  const doubled = [...quotes, ...quotes];
  return (
    <div className="group relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(to right, var(--bd-ink) 0%, transparent 12%, transparent 88%, var(--bd-ink) 100%)',
        }}
      />
      <div
        className="flex w-max items-center gap-12 whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]"
        style={{ animation: `bd-marquee ${durationSec}s linear infinite` }}
      >
        {doubled.map((q, i) => (
          <span key={i} className="flex items-center gap-12">
            <span className="font-display text-3xl leading-tight font-bold tracking-tight text-[color:var(--bd-bone)]/85 italic sm:text-4xl md:text-5xl">
              {q}
            </span>
            <span aria-hidden className="text-2xl text-[color:var(--bd-lime)]">
              ∗
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
