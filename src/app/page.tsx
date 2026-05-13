import Hero from '@/components/sections/Hero';
import MemeReel from '@/components/sections/MemeReel';
import SystemsStack from '@/components/sections/SystemsStack';
import Chatbot from '@/components/sections/Chatbot';
import Recruitment from '@/components/sections/Recruitment';
import Newsletter from '@/components/sections/Newsletter';
import ClosingCTA from '@/components/sections/ClosingCTA';
import TweakPanel from '@/components/dev/TweakPanel';

export default function HomePage() {
  return (
    <>
      <Hero />
      <MemeReel />
      <SystemsStack />
      <Chatbot />
      <Recruitment />
      <Newsletter />
      <ClosingCTA />
      <TweakPanel />
    </>
  );
}
