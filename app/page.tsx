import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PreferencesPoll from "@/components/PreferencesPoll";
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
        <PreferencesPoll />
        <WhatIsWCS />
        <WhoAreWe />
        <MapSection />
        <SkillsTracker />
        <ContactSection />
      </main>
    </>
  );
}
