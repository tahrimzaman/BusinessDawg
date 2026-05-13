'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Ambient lime constellation — nodes drift, lines connect nearby pairs,
 * cursor softly attracts nearby nodes. Mounted once globally behind content.
 */
export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      if (!canvas || !ctx) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const scale = Math.min(width, 1600) / 1600;
    const nodeCount = Math.max(28, Math.floor(60 * scale));
    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      });
    }

    // Fireflies — brighter, slower, more reactive
    const fireflyCount = Math.max(12, Math.floor(20 * scale));
    type Firefly = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      phase: number;
      phaseSpeed: number;
      baseAlpha: number;
    };
    const fireflies: Firefly[] = [];
    for (let i = 0; i < fireflyCount; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.015 + Math.random() * 0.015,
        baseAlpha: 0.75 + Math.random() * 0.2,
      });
    }

    const cursor = { x: -9999, y: -9999, active: false };
    function onMove(e: PointerEvent) {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.active = true;
    }
    function onLeave() {
      cursor.active = false;
      cursor.x = -9999;
      cursor.y = -9999;
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);

    let rafId = 0;
    let running = true;

    function onVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        loop();
      }
    }
    document.addEventListener('visibilitychange', onVisibility);

    const LINK_DIST = 120;
    const CURSOR_DIST = 180;
    const FIREFLY_CURSOR_DIST = 220;

    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(200, 255, 0, 0.75)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      // static fireflies
      for (const f of fireflies) {
        ctx.fillStyle = `rgba(220, 255, 60, ${f.baseAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // wrap
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;

        // cursor attraction
        if (cursor.active) {
          const dx = cursor.x - n.x;
          const dy = cursor.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_DIST * CURSOR_DIST) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / CURSOR_DIST) * 0.04;
            n.vx += (dx / d) * force;
            n.vy += (dy / d) * force;
          }
        }

        // gentle damping
        n.vx *= 0.98;
        n.vy *= 0.98;
        // floor velocity so motion never fully dies
        const speed = Math.hypot(n.vx, n.vy);
        if (speed < 0.08) {
          n.vx += (Math.random() - 0.5) * 0.04;
          n.vy += (Math.random() - 0.5) * 0.04;
        }
      }

      // lines
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.5;
            ctx.strokeStyle = `rgba(200, 255, 0, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      ctx.fillStyle = 'rgba(200, 255, 0, 0.75)';
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // fireflies — slower drift, stronger cursor force, pulsing alpha, glow
      ctx.shadowColor = 'rgba(220, 255, 60, 0.85)';
      ctx.shadowBlur = 10;
      for (const f of fireflies) {
        f.x += f.vx;
        f.y += f.vy;
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        if (f.y > height + 10) f.y = -10;

        if (cursor.active) {
          const dx = cursor.x - f.x;
          const dy = cursor.y - f.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < FIREFLY_CURSOR_DIST * FIREFLY_CURSOR_DIST) {
            const d = Math.sqrt(d2) || 1;
            const force = (1 - d / FIREFLY_CURSOR_DIST) * 0.08;
            f.vx += (dx / d) * force;
            f.vy += (dy / d) * force;
          }
        }
        // damping + floor
        f.vx *= 0.97;
        f.vy *= 0.97;
        const speed = Math.hypot(f.vx, f.vy);
        if (speed < 0.04) {
          f.vx += (Math.random() - 0.5) * 0.02;
          f.vy += (Math.random() - 0.5) * 0.02;
        }

        f.phase += f.phaseSpeed;
        const alpha = f.baseAlpha * (0.7 + 0.3 * Math.sin(f.phase));
        ctx.fillStyle = `rgba(220, 255, 60, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      rafId = requestAnimationFrame(loop);
    }

    function onResize() {
      resize();
    }
    window.addEventListener('resize', onResize);

    if (reduced) {
      drawStatic();
    } else {
      loop();
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full opacity-[0.7]" />
    </div>
  );
}
