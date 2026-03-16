import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Link from "next/link";
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
        <section className="px-[5%] py-4 bg-gradient-to-r from-pink-accent to-pink-accent/80">
          <div className="max-w-[900px] mx-auto text-center">
            <Link href="/weekender" className="block text-white hover:opacity-90 transition-opacity">
              <p className="text-xl md:text-2xl font-spartan font-semibold">
                🌟 Weekender This Weekend! 🌟
              </p>
              <p className="text-sm md:text-base text-white/90 mt-1">
                March 20–22 — Book your pass now →
              </p>
              <p className="text-xs md:text-sm text-white/75 mt-1">
                Friday social: Scout Hall, Claremont • Saturday & Sunday: Hellenic, Greenpoint
              </p>
            </Link>
          </div>
        </section>
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
