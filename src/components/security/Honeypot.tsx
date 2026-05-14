'use client';

import { useEffect, useRef } from 'react';
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from '@/lib/security/honeypot';

/**
 * Invisible spam trap. Bots fill every input they see; humans don't see this one.
 * Also stamps the form-render time so submissions < 2s look like bots.
 *
 * Drop inside any <form>. Reads back via FormData / Object.fromEntries.
 */
export default function Honeypot() {
  const tsRef = useRef<HTMLInputElement>(null);

  // Stamp the render-time on the client only — keeps the component pure during
  // render and avoids SSR/CSR hydration drift.
  useEffect(() => {
    if (tsRef.current) tsRef.current.value = String(Date.now());
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      <label>
        Company (leave blank)
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
      <input ref={tsRef} type="hidden" name={TIMESTAMP_FIELD} defaultValue="" />
    </div>
  );
}
