/**
 * Sanity Studio mount. Loads when NEXT_PUBLIC_SANITY_PROJECT_ID is set in .env.local.
 * Until then, /studio renders a setup note.
 */
'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export const dynamic = 'force-static';

export default function StudioPage() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-40 text-center">
        <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
          / Sanity Studio
        </p>
        <h1 className="font-display mt-4 text-4xl font-extrabold italic">
          Studio is unconfigured.
        </h1>
        <p className="mt-4 text-[color:var(--bd-bone)]/70">
          Create a project at <code className="font-mono">sanity.io/manage</code>, paste the project
          ID into <code className="font-mono">.env.local</code>, and reload.
        </p>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
