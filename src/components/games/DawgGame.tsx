'use client';

/* eslint-disable react-hooks/set-state-in-effect -- This component is a RAF-driven game loop where ticking state from inside effects is the intended pattern, not a sync side effect. */

import { useCallback, useEffect, useRef, useState } from 'react';
import Mascot from '@/components/brand/Mascot';

/**
 * 404 easter egg — playable mini-game.
 * Mascot chases lime treats. Drag (touch/mouse) to steer, or use arrow keys / WASD.
 * Best score persists in localStorage.
 */

const MAX_BOARD = 320;
const MIN_BOARD = 260;
const DAWG = 48;
const TREAT = 16;
const SPEED = 5;
const STORAGE_KEY = 'bd_dawg_high';

type Vec = { x: number; y: number };

const INITIAL_DAWG: Vec = { x: MAX_BOARD / 2 - DAWG / 2, y: MAX_BOARD / 2 - DAWG / 2 };
const INITIAL_TREAT: Vec = { x: MAX_BOARD - TREAT - 20, y: 20 };

export default function DawgGame() {
  const [board, setBoard] = useState(MAX_BOARD);
  const [pos, setPos] = useState<Vec>(INITIAL_DAWG);
  const [treat, setTreat] = useState<Vec>(INITIAL_TREAT);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [paused, setPaused] = useState(true);
  const [started, setStarted] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);

  const keys = useRef<Record<string, boolean>>({});
  const target = useRef<Vec | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);

  // One-time client setup: high score, randomize first treat, detect coarse pointer.
  useEffect(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
    if (Number.isFinite(stored)) setBest(stored);
    setCoarse(window.matchMedia('(pointer: coarse)').matches);
    setTreat(randomTreat(MAX_BOARD, INITIAL_DAWG));
  }, []);

  // Responsive board sizing.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      const next = Math.max(MIN_BOARD, Math.min(MAX_BOARD, Math.floor(w)));
      setBoard(next);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Clamp positions when board shrinks.
  useEffect(() => {
    setPos((p) => ({
      x: Math.max(0, Math.min(board - DAWG, p.x)),
      y: Math.max(0, Math.min(board - DAWG, p.y)),
    }));
    setTreat((t) => ({
      x: Math.max(0, Math.min(board - TREAT, t.x)),
      y: Math.max(0, Math.min(board - TREAT, t.y)),
    }));
  }, [board]);

  const reset = useCallback(() => {
    const start = { x: board / 2 - DAWG / 2, y: board / 2 - DAWG / 2 };
    setPos(start);
    setTreat(randomTreat(board, start));
    setScore(0);
    setStarted(true);
    setPaused(false);
    target.current = null;
  }, [board]);

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
        let dx = 0;
        let dy = 0;
        if (keys.current['arrowup'] || keys.current['w']) dy -= 1;
        if (keys.current['arrowdown'] || keys.current['s']) dy += 1;
        if (keys.current['arrowleft'] || keys.current['a']) dx -= 1;
        if (keys.current['arrowright'] || keys.current['d']) dx += 1;

        if (dx !== 0 || dy !== 0) {
          const len = Math.hypot(dx, dy);
          x += (dx / len) * SPEED;
          y += (dy / len) * SPEED;
        } else if (target.current) {
          const cx = x + DAWG / 2;
          const cy = y + DAWG / 2;
          const tx = target.current.x - cx;
          const ty = target.current.y - cy;
          const dist = Math.hypot(tx, ty);
          if (dist <= SPEED) {
            x = target.current.x - DAWG / 2;
            y = target.current.y - DAWG / 2;
            target.current = null;
          } else {
            x += (tx / dist) * SPEED;
            y += (ty / dist) * SPEED;
          }
        }

        x = Math.max(0, Math.min(board - DAWG, x));
        y = Math.max(0, Math.min(board - DAWG, y));

        const moveX = x - p.x;
        if (moveX < -0.1) setFacingLeft(true);
        else if (moveX > 0.1) setFacingLeft(false);

        return { x, y };
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, board]);

  // Collision check.
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
    setTreat(randomTreat(board, pos));
    try {
      if ('vibrate' in navigator) navigator.vibrate(15);
    } catch {
      // Safari etc. — ignore
    }
    if (next > best) {
      setBest(next);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // private mode etc. — ignore
      }
    }
  }, [pos, treat, score, best, board]);

  // Pointer (touch/mouse) steering
  const setTargetFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    target.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Some synthetic / inactive pointers throw; safe to ignore.
    }
    if (!started) {
      reset();
    } else if (paused) {
      setPaused(false);
    }
    setTargetFromPointer(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (paused || !started) return;
    // Only steer while a pointer is pressed (hover-move shouldn't grab control).
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    setTargetFromPointer(e);
  };

  const onPointerUp = () => {
    // Let the dawg coast to the last target instead of stopping dead.
  };

  const instructions = coarse
    ? 'Drag to chase treats · Tap pause'
    : 'Drag · Arrow keys / WASD · Esc to pause · R to restart';

  return (
    <div ref={wrapRef} className="mt-12 flex w-full max-w-[320px] flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between font-mono text-[11px] tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
        <span>
          Score ·{' '}
          <span
            key={score}
            className="inline-block text-[color:var(--bd-lime)]"
            style={{ animation: 'bd-score-pop 220ms ease-out' }}
          >
            {score}
          </span>
        </span>
        {started && !paused && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPaused(true);
            }}
            className="rounded-full border border-white/15 px-3 py-1 text-[10px] tracking-widest text-[color:var(--bd-bone)]/80 uppercase hover:border-[color:var(--bd-lime)]/60 hover:text-[color:var(--bd-lime)]"
            aria-label="Pause game"
          >
            Pause
          </button>
        )}
        <span>Best · {best}</span>
      </div>

      <div
        ref={boardRef}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[color:var(--bd-smoke)]"
        style={{ width: board, height: board, touchAction: 'none' }}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
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
          className="pointer-events-none absolute"
          style={{
            left: pos.x,
            top: pos.y,
            width: DAWG,
            height: DAWG,
            transform: facingLeft ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 120ms ease-out',
          }}
        >
          <Mascot pose="running" size={DAWG} />
        </div>

        {/* overlay */}
        {(!started || paused) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55 px-4 text-center backdrop-blur-sm">
            <p className="font-display text-xl font-bold italic">
              {!started ? 'Catch the treats.' : 'Paused.'}
            </p>
            <p className="mt-2 font-mono text-[10px] leading-relaxed tracking-widest text-[color:var(--bd-bone)]/60 uppercase">
              {instructions}
            </p>
            <button
              onPointerDown={(e) => e.stopPropagation()}
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

      <style jsx>{`
        @keyframes bd-score-pop {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.6);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

function randomTreat(board: number, avoid?: Vec): Vec {
  const minDist = DAWG;
  for (let i = 0; i < 12; i++) {
    const t = {
      x: Math.random() * (board - TREAT),
      y: Math.random() * (board - TREAT),
    };
    if (!avoid) return t;
    const dx = t.x + TREAT / 2 - (avoid.x + DAWG / 2);
    const dy = t.y + TREAT / 2 - (avoid.y + DAWG / 2);
    if (Math.hypot(dx, dy) >= minDist) return t;
  }
  return {
    x: Math.random() * (board - TREAT),
    y: Math.random() * (board - TREAT),
  };
}
