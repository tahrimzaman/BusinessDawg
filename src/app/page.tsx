import Hero from '@/components/sections/Hero';
import PullQuote from '@/components/sections/PullQuote';
import SystemsStack from '@/components/sections/SystemsStack';
import BuiltTeaser from '@/components/sections/BuiltTeaser';
import Chatbot from '@/components/sections/Chatbot';
import Recruitment from '@/components/sections/Recruitment';
import Newsletter from '@/components/sections/Newsletter';
import ClosingCTA from '@/components/sections/ClosingCTA';
import TweakPanel from '@/components/dev/TweakPanel';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PullQuote />
      <SystemsStack />
      <BuiltTeaser />
      <Chatbot />
      <Recruitment />
      <Newsletter />
      <ClosingCTA />
      <TweakPanel />
    </>
  );
}
