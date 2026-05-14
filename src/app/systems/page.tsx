import Link from 'next/link';
import Reveal from '@/components/motion/Reveal';
import { SYSTEMS, type System } from '@/lib/copy';
import { sanityFetch } from '@/lib/sanity/client';
import { systemsQuery } from '@/lib/sanity/queries';

export const metadata = { title: 'Systems' };

// Sanity row shape — partial, since CMS docs may be incomplete.
type SanitySystem = {
  _id: string;
  name?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  deliverables?: string[];
  order?: number;
};

// Reshape a Sanity doc into our System type, filling missing fields from the
// matching hardcoded entry where possible. If we don't have a matching fallback
// and the doc is too thin, we drop it.
function shapeSystem(doc: SanitySystem): System | null {
  const slug = doc.slug;
  if (!slug || !doc.name) return null;
  const base = SYSTEMS.find((s) => s.slug === slug);
  return {
    slug,
    name: doc.name,
    shortName: base?.shortName ?? doc.name,
    tagline: doc.tagline ?? base?.tagline ?? '',
    description: doc.description ?? base?.description ?? '',
    deliverables: doc.deliverables?.length ? doc.deliverables : (base?.deliverables ?? []),
    pricing: { kind: 'custom' },
    accent: base?.accent ?? '#c8ff00',
    glyph: base?.glyph ?? '◆',
  };
}

export default async function SystemsIndex() {
  const cmsDocs = await sanityFetch<SanitySystem[]>(systemsQuery, {}, []);
  const fromCms = cmsDocs.map(shapeSystem).filter((x): x is System => x !== null);
  const systems: System[] = fromCms.length ? fromCms : SYSTEMS;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-40 pb-24">
      <Reveal>
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / The Systems Stack
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display mt-3 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-tight italic sm:text-6xl md:text-7xl">
          Five systems. Stack the ones you need.
        </h1>
      </Reveal>
      <div className="mt-16 grid gap-5">
        {systems.map((s, i) => (
          <Reveal key={s.slug} delay={i * 0.04}>
            <Link
              href={`/systems/${s.slug}`}
              className="group flex items-start justify-between gap-8 rounded-3xl border border-white/8 bg-[color:var(--bd-smoke)] p-8 transition-colors hover:border-[color:var(--bd-lime)]/40 md:p-10"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl text-[color:var(--bd-lime)]">{s.glyph}</span>
                  <h2 className="font-display text-3xl font-bold italic md:text-4xl">{s.name}</h2>
                </div>
                <p className="mt-3 max-w-xl text-[color:var(--bd-bone)]/70">{s.tagline}</p>
              </div>
              <span className="hidden text-sm font-semibold text-[color:var(--bd-bone)]/70 group-hover:text-[color:var(--bd-lime)] md:inline">
                Explore →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
