import nextDynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import DawgRail from '@/components/motion/DawgRail';

// Static prerender. The stale-build risk (Next auto-emitting s-maxage=31536000
// on prerendered HTML, which Hostinger's HCDN then caches for ~10h past a
// redeploy) is killed at the cache-header level: next.config.ts headers()
// forces `Cache-Control: no-store, must-revalidate` on every HTML path. HCDN
// won't cache anything no-store, so the disk on the server is always the
// source of truth. Verified with `curl -I` post-deploy — see plan §Verify.
export const dynamic = 'force-static';

// next/dynamic on below-fold sections keeps them in their own JS chunks
// (code-split, lazy-fetched on hydration). Under force-static the SSR work
// is paid once at build time, so ssr:false isn't needed — and isn't allowed
// from a Server Component anyway.
const MemeReel = nextDynamic(() => import('@/components/sections/MemeReel'));
const SystemsStack = nextDynamic(() => import('@/components/sections/SystemsStack'));
const Chatbot = nextDynamic(() => import('@/components/sections/Chatbot'));
const Recruitment = nextDynamic(() => import('@/components/sections/Recruitment'));
const Newsletter = nextDynamic(() => import('@/components/sections/Newsletter'));
const ClosingCTA = nextDynamic(() => import('@/components/sections/ClosingCTA'));

export default function HomePage() {
  return (
    <>
      <DawgRail />

      <div id="hero">
        <Hero />
      </div>
      <div id="reel">
        <MemeReel />
      </div>
      <div id="systems">
        <SystemsStack />
      </div>
      <div id="chatbot">
        <Chatbot />
      </div>
      <div id="join">
        <Recruitment />
        <Newsletter />
      </div>
      <div id="ship">
        <ClosingCTA />
      </div>
    </>
  );
}
