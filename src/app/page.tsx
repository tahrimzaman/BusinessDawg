import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import DawgRail from '@/components/motion/DawgRail';

const MemeReel = dynamic(() => import('@/components/sections/MemeReel'));
const SystemsStack = dynamic(() => import('@/components/sections/SystemsStack'));
const Chatbot = dynamic(() => import('@/components/sections/Chatbot'));
const Recruitment = dynamic(() => import('@/components/sections/Recruitment'));
const Newsletter = dynamic(() => import('@/components/sections/Newsletter'));
const ClosingCTA = dynamic(() => import('@/components/sections/ClosingCTA'));
const TweakPanel = dynamic(() => import('@/components/dev/TweakPanel'));

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
