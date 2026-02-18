import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WeekenderBanner from "@/components/WeekenderBanner";
import WeekenderPoll from "@/components/WeekenderPoll";
import WhatIsWCS from "@/components/WhatIsWCS";
import WhoAreWe from "@/components/WhoAreWe";
import SkillsTracker from "@/components/SkillsTracker";
import MapSection from "@/components/MapSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WeekenderBanner />
        <WeekenderPoll />
        <WhatIsWCS />
        <WhoAreWe />
        <MapSection />
        <SkillsTracker />
        <ContactSection />
      </main>
    </>
  );
}
