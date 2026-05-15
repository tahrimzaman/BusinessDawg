import nextDynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import DawgRail from '@/components/motion/DawgRail';

// Force SSR per request. Without this, Next prerenders `/` and emits
// `cache-control: s-maxage=31536000`, which makes Hostinger's HCDN cache the
// HTML for up to a year. After a redeploy, the cached HTML still references
// chunk hashes that no longer exist on disk → CSS/JS 404s and unstyled page.
// force-dynamic lets our next.config.ts `no-store` header take effect end-to-end.
export const dynamic = 'force-dynamic';

const MemeReel = nextDynamic(() => import('@/components/sections/MemeReel'));
const SystemsStack = nextDynamic(() => import('@/components/sections/SystemsStack'));
const Chatbot = nextDynamic(() => import('@/components/sections/Chatbot'));
const Recruitment = nextDynamic(() => import('@/components/sections/Recruitment'));
const Newsletter = nextDynamic(() => import('@/components/sections/Newsletter'));
const ClosingCTA = nextDynamic(() => import('@/components/sections/ClosingCTA'));
const TweakPanel = nextDynamic(() => import('@/components/dev/TweakPanel'));

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

      <TweakPanel />
    </>
  );
}
