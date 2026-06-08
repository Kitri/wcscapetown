import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WhatIsWCS from "@/components/WhatIsWCS";
import WhoAreWe from "@/components/WhoAreWe";
import SkillsTracker from "@/components/SkillsTracker";
import MapSection from "@/components/MapSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <>
      <Header />
      {/* Temporary notice banner */}
      <div className="bg-pink-accent text-white text-center px-4 py-3 text-sm font-medium">
        📢 No class or social Monday 15 June — but join us for social on Saturday 13 June!{" "}
        <a href="/whats-on#monthly-social" className="underline hover:opacity-80 font-semibold">More info →</a>
      </div>
      <main>
        <Hero />
        <WhatIsWCS />
        <WhoAreWe />
        <MapSection />
        <SkillsTracker />
        <ContactSection />
      </main>
    </>
  );
}
