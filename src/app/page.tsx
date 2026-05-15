import Hero from '@/components/sections/Hero';
import MemeReel from '@/components/sections/MemeReel';
import SystemsStack from '@/components/sections/SystemsStack';
import Chatbot from '@/components/sections/Chatbot';
import Recruitment from '@/components/sections/Recruitment';
import Newsletter from '@/components/sections/Newsletter';
import ClosingCTA from '@/components/sections/ClosingCTA';
import TweakPanel from '@/components/dev/TweakPanel';
import DawgRail from '@/components/motion/DawgRail';
import DriftingBlobs from '@/components/motion/DriftingBlobs';

export default function HomePage() {
  return (
    <>
      <DriftingBlobs />
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
