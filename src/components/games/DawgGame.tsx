'use client';

/* eslint-disable react-hooks/set-state-in-effect -- This component is a RAF-driven game loop where ticking state from inside effects is the intended pattern, not a sync side effect. */

import { useCallback, useEffect, useRef, useState } from 'react';
import Mascot from '@/components/brand/Mascot';

/**
 * 404 easter egg — playable mini-game.
 * Mascot chases lime treats. Arrow keys (or WASD) to move. Esc to pause.
 * Best score persists in localStorage.
 */

const BOARD = 320; // px (square)
const DAWG = 48;
const TREAT = 16;
const SPEED = 5;
const STORAGE_KEY = 'bd_dawg_high';

type Vec = { x: number; y: number };

// Deterministic starting positions — random placement happens on the client
// after mount to avoid SSR/CSR hydration mismatch.
const INITIAL_DAWG: Vec = { x: BOARD / 2 - DAWG / 2, y: BOARD / 2 - DAWG / 2 };
const INITIAL_TREAT: Vec = { x: BOARD - TREAT - 20, y: 20 };

export default function DawgGame() {
  const [pos, setPos] = useState<Vec>(INITIAL_DAWG);
  const [treat, setTreat] = useState<Vec>(INITIAL_TREAT);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    if (Number.isFinite(stored)) setBest(stored);
    // Move first treat to a random spot once we're on the client.
    setTreat(randomTreat());
  }, []);

  const reset = useCallback(() => {
    setPos({ x: BOARD / 2 - DAWG / 2, y: BOARD / 2 - DAWG / 2 });
    setTreat(randomTreat());
    setScore(0);
    setStarted(true);
    setPaused(false);
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaused((p) => !p);
        if (!started) setStarted(true);
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        reset();
        return;
      }
      keys.current[e.key.toLowerCase()] = true;
      if (!started) {
        setStarted(true);
        setPaused(false);
      }
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [reset, started]);

  // Game loop
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    const tick = () => {
      setPos((p) => {
        let { x, y } = p;
        if (keys.current['arrowup'] || keys.current['w']) y -= SPEED;
        if (keys.current['arrowdown'] || keys.current['s']) y += SPEED;
        if (keys.current['arrowleft'] || keys.current['a']) x -= SPEED;
        if (keys.current['arrowright'] || keys.current['d']) x += SPEED;
        x = Math.max(0, Math.min(BOARD - DAWG, x));
        y = Math.max(0, Math.min(BOARD - DAWG, y));
        return { x, y };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  // Collision check. setState-in-effect disabled at file level — see top comment.
  useEffect(() => {
    const dawgCx = pos.x + DAWG / 2;
    const dawgCy = pos.y + DAWG / 2;
    const treatCx = treat.x + TREAT / 2;
    const treatCy = treat.y + TREAT / 2;
    const dx = dawgCx - treatCx;
    const dy = dawgCy - treatCy;
    if (Math.hypot(dx, dy) >= DAWG / 2 + TREAT / 2 - 2) return;

    const next = score + 1;
    setScore(next);
    setTreat(randomTreat());
    if (next > best) {
      setBest(next);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // private mode etc. — ignore
      }
    }
  }, [pos, treat, score, best]);

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <div className="flex w-[320px] items-center justify-between font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
        <span>
          Score · <span className="text-[color:var(--bd-lime)]">{score}</span>
        </span>
        <span>Best · {best}</span>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]"
        style={{ width: BOARD, height: BOARD }}
        tabIndex={0}
        onClick={() => {
          if (!started) reset();
          else setPaused(false);
        }}
        role="application"
        aria-label="404 mini-game"
      >
        {/* subtle grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(200,255,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* treat */}
        <div
          aria-hidden
          className="absolute"
          style={{
            left: treat.x,
            top: treat.y,
            width: TREAT,
            height: TREAT,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #e2ff66, #c8ff00 60%, #a4d900 100%)',
            boxShadow: '0 0 18px rgba(200,255,0,0.7)',
          }}
        />

        {/* mascot */}
        <div
          className="absolute"
          style={{
            left: pos.x,
            top: pos.y,
            width: DAWG,
            height: DAWG,
            transition: 'transform 50ms linear',
          }}
        >
          <Mascot pose="running" size={DAWG} />
        </div>

        {/* overlay */}
        {(!started || paused) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 text-center backdrop-blur-sm">
            <p className="font-display text-xl font-bold italic">
              {!started ? 'Catch the treats.' : 'Paused.'}
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
              Arrow keys / WASD · Esc to pause · R to restart
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!started) reset();
                else setPaused(false);
              }}
              className="mt-4 inline-flex h-9 items-center rounded-full bg-[color:var(--bd-lime)] px-4 text-xs font-semibold text-[color:var(--bd-ink)]"
            >
              {!started ? 'Start' : 'Resume'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function randomTreat(): Vec {
  return {
    x: Math.random() * (BOARD - TREAT),
    y: Math.random() * (BOARD - TREAT),
  };
}
