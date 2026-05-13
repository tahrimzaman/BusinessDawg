import Hero from '@/components/sections/Hero';
import SystemsStack from '@/components/sections/SystemsStack';
import BuiltTeaser from '@/components/sections/BuiltTeaser';
import WorkTeaser from '@/components/sections/WorkTeaser';
import Chatbot from '@/components/sections/Chatbot';
import Recruitment from '@/components/sections/Recruitment';
import Newsletter from '@/components/sections/Newsletter';

export default function HomePage() {
  return (
    <>
      <Hero />
      <SystemsStack />
      <BuiltTeaser />
      <WorkTeaser />
      <Chatbot />
      <Recruitment />
      <Newsletter />
    </>
  );
}
