'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('sending');
    setError(null);
    try {
      const r = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (r.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await r.json().catch(() => ({}));
        setError(data.error || 'login failed');
        setState('error');
      }
    } catch {
      setError('network error');
      setState('error');
    }
  }

  return (
    <div className="mx-auto mt-32 max-w-md px-6">
      <p className="font-mono text-xs tracking-widest text-[color:var(--bd-lime)] uppercase">
        / Admin
      </p>
      <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight italic">Locked.</h1>
      <p className="mt-3 text-sm text-[color:var(--bd-bone)]/60">
        This corner of the site is for the dawg only.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-4">
        <input
          type="email"
          required
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-12 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-12 rounded-full border border-white/10 bg-[color:var(--bd-smoke)] px-5 text-sm focus:border-[color:var(--bd-lime)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--bd-lime)] px-6 text-sm font-semibold text-[color:var(--bd-ink)] hover:bg-[color:var(--bd-bone)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'sending' ? 'Checking…' : 'Enter'}
        </button>
        {error && <p className="text-sm text-[color:var(--bd-signal)]">{error}</p>}
      </form>
    </div>
  );
}
