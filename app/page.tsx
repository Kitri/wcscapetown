import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WeeklyHighlights from "@/components/WeeklyHighlights";
import WhatIsWCS from "@/components/WhatIsWCS";
import WhoAreWe from "@/components/WhoAreWe";
import SkillsTracker from "@/components/SkillsTracker";
import MapSection from "@/components/MapSection";
import ContactSection from "@/components/ContactSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WeeklyHighlights />
        <WhatIsWCS />
        <WhoAreWe />
        <MapSection />
        <SkillsTracker />
        <ContactSection />
      </main>
    </>
  );
}
