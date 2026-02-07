import Header from "@/components/Header";
import Image from "next/image";

export default function Weekender() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="px-[5%] py-[60px] bg-gradient-to-br from-pink-accent/20 via-pink-accent/10 to-transparent">
          <div className="max-w-[1100px] mx-auto text-center">
            <h1 className="font-spartan font-semibold text-[36px] md:text-[56px] mb-4">
              West Coast Swing Weekender
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-pink-accent mb-6">
              March 20-22, 2026
            </p>
            <p className="text-xl md:text-2xl text-text-dark/80 max-w-[800px] mx-auto mb-8">
              Experience world-class WCS festival vibes right here in Cape Town
            </p>
            <p className="text-lg text-text-dark/70 max-w-[700px] mx-auto mb-10">
              Two full days of workshops with international pros, three evenings of social dancing — bringing the international festival experience to your doorstep
            </p>

            <a 
              href="/#weekender" 
              className="inline-block bg-pink-accent text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-pink-accent/90 hover:shadow-xl transition-all"
            >
              Register Your Interest
            </a>
          </div>
        </section>

        {/* Meet Your Pros */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Meet Your Pros
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-12">
              Four world-class instructors from around the globe
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[900px] mx-auto">
              {/* Igor & Fernanda */}
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-pink-accent flex-shrink-0 relative">
                    <Image
                      src="/images/igor_fernanda1.jpg"
                      alt="Igor & Fernanda"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-spartan font-semibold text-xl text-pink-accent mb-1">
                      Igor Pitangui & Fernanda Dubiel
                    </h3>
                    <p className="text-sm text-text-dark/70 mb-2">🇧🇷 Brazil</p>
                    <a href="https://www.instagram.com/igorandfernanda/" target="_blank" rel="noopener noreferrer" className="text-sm text-pink-accent hover:text-yellow-accent underline">
                      @igorandfernanda
                    </a>
                  </div>
                </div>
                <p className="text-sm text-text-dark/80 mb-3">
                  Bio coming soon. Videos to be embedded.
                </p>
              </div>

              {/* Harold */}
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-pink-accent flex-shrink-0 relative">
                    <Image
                      src="/images/harold1.jpg"
                      alt="Harold Baker"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-spartan font-semibold text-xl text-pink-accent mb-1">
                      Harold Baker
                    </h3>
                    <p className="text-sm text-text-dark/70 mb-2">🇬🇧 United Kingdom</p>
                    <a href="https://www.instagram.com/harold_baker_dance" target="_blank" rel="noopener noreferrer" className="text-sm text-pink-accent hover:text-yellow-accent underline">
                      @harold_baker_dance
                    </a>
                  </div>
                </div>
                <p className="text-sm text-text-dark/80 mb-3">
                  Bio coming soon. Videos to be embedded.
                </p>
              </div>

              {/* Kristen */}
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-pink-accent flex-shrink-0 relative">
                    <Image
                      src="/images/kristen1.jpg"
                      alt="Kristen Wallace"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-spartan font-semibold text-xl text-pink-accent mb-1">
                      Kristen Wallace
                    </h3>
                    <p className="text-sm text-text-dark/70 mb-2">🇺🇸 United States</p>
                    <a href="https://www.instagram.com/kwalla.bear" target="_blank" rel="noopener noreferrer" className="text-sm text-pink-accent hover:text-yellow-accent underline">
                      @kwalla.bear
                    </a>
                  </div>
                </div>
                <p className="text-sm text-text-dark/80 mb-3">
                  Bio coming soon. Videos to be embedded.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-12">
              Weekend Schedule
            </h2>

            {/* Friday */}
            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl md:text-3xl mb-6 text-pink-accent">
                Friday, March 20
              </h3>
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="text-lg font-semibold text-text-dark/70 min-w-[100px]">19:30-23:00</div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Pre-Weekend Social</p>
                    <p className="text-text-dark/70">Kick off the weekend with an evening of social dancing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Saturday */}
            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl md:text-3xl mb-6 text-pink-accent">
                Saturday, March 21
              </h3>
              
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-3 font-semibold text-sm">
                    <div className="text-text-dark/70">Time</div>
                    <div className="bg-purple-accent/20 rounded-t-lg p-2 text-center">Main Hall</div>
                    <div className="bg-yellow-accent/20 rounded-t-lg p-2 text-center">Side Hall</div>
                  </div>

                  {/* 09:00-11:30 Private Lessons & Spotlight Critique */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">09:00-11:30</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm col-span-2">
                      <p className="font-semibold">Private Lesson Slots Available</p>
                      <p className="text-xs text-text-dark/70 mt-1">45-min sessions with all pros (by appointment)</p>
                    </div>
                  </div>

                  {/* 10:00-11:00 Spotlight Critique (overlaps with private lessons) */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">10:00-11:00</div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm border-2 border-yellow-accent/30">
                      <p className="font-semibold">Spotlight Critique</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen (Optional add-on, limited to 10 couples)</p>
                    </div>
                    <div className="bg-text-dark/5 rounded-lg p-3 flex items-center justify-center text-xs text-text-dark/50">Private lessons</div>
                  </div>

                  {/* 11:30-12:30 Workshops */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">11:30-12:30</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 12:30-14:00 Lunch */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">12:30-14:00</div>
                    <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                      <p className="font-semibold">Community Lunch</p>
                      <p className="text-xs text-text-dark/70 mt-1">Bring and share - included with Weekend & Day Pass</p>
                    </div>
                  </div>

                  {/* 14:00-15:00 Workshops */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">14:00-15:00</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 15:00-16:00 Workshops */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">15:00-16:00</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 16:00-16:15 Break */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">16:00-16:15</div>
                    <div className="bg-text-dark/5 rounded-lg p-3 text-sm col-span-2 text-center font-semibold">Break</div>
                  </div>

                  {/* 16:15-17:15 Level 2 Only */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">16:15-17:15</div>
                    <div className="bg-text-dark/5 rounded-lg p-3 flex items-center justify-center text-xs text-text-dark/50"></div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 17:15-18:30 Dinner */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">17:15-18:30</div>
                    <div className="bg-text-dark/5 rounded-lg p-3 text-sm col-span-2 text-center font-semibold">Dinner Break</div>
                  </div>

                  {/* 18:30-19:30 All Levels */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">18:30-19:30</div>
                    <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                      <p className="font-semibold">Master Your Social Dance on the Floor</p>
                      <p className="text-xs text-text-dark/70 mt-1">All levels - Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 19:30-23:00 Social */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">19:30-23:00</div>
                    <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                      <p className="font-semibold">Saturday Night Social</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sunday */}
            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl md:text-3xl mb-6 text-pink-accent">
                Sunday, March 22
              </h3>
              
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-3 font-semibold text-sm">
                    <div className="text-text-dark/70">Time</div>
                    <div className="bg-purple-accent/20 rounded-t-lg p-2 text-center">Main Hall</div>
                    <div className="bg-yellow-accent/20 rounded-t-lg p-2 text-center">Side Hall</div>
                  </div>

                    {/* 09:00-11:00 Private Lessons */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">09:00-11:00</div>
                      <div className="bg-purple-accent/10 rounded-lg p-3 text-sm col-span-2">
                        <p className="font-semibold">Private Lesson Slots Available</p>
                        <p className="text-xs text-text-dark/70 mt-1">45-min sessions with all pros (by appointment)</p>
                      </div>
                    </div>

                    {/* 11:00-12:00 Follower Focus */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">11:00-12:00</div>
                      <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                        <p className="font-semibold">Follower Focus</p>
                        <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                      </div>
                    </div>

                    {/* 12:00-13:00 Leads Focus */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">12:00-13:00</div>
                      <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                        <p className="font-semibold">Leads Focus</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                    </div>

                    {/* 13:00-14:00 Lunch */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">13:00-14:00</div>
                      <div className="bg-text-dark/5 rounded-lg p-3 text-sm col-span-2 text-center font-semibold">Lunch Break</div>
                    </div>

                    {/* 14:00-15:00 Workshops */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">14:00-15:00</div>
                      <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 1</p>
                        <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                      </div>
                      <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 2</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                    </div>

                    {/* 15:00-16:00 Workshops */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">15:00-16:00</div>
                      <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 1</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                      <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 2</p>
                        <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                      </div>
                    </div>

                    {/* 16:00-16:15 Break */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">16:00-16:15</div>
                      <div className="bg-text-dark/5 rounded-lg p-3 text-sm col-span-2 text-center font-semibold">Break</div>
                    </div>

                    {/* 16:15-17:15 Workshops */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">16:15-17:15</div>
                      <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 1</p>
                        <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                      </div>
                      <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 2</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                    </div>

                    {/* 17:15-18:30 Dinner */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">17:15-18:30</div>
                      <div className="bg-text-dark/5 rounded-lg p-3 text-sm col-span-2 text-center font-semibold">Dinner Break</div>
                    </div>

                    {/* 18:30-19:30 All Levels */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">18:30-19:30</div>
                      <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                        <p className="font-semibold">All Levels Workshop</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-purple-accent/10 rounded-xl p-6 md:p-8 border-2 border-purple-accent">
              <p className="font-semibold text-lg mb-2">💡 Pro Tip: Private Lessons</p>
              <p className="text-text-dark/80">
                Private lessons can be shared! Book as a couple and split the time (and cost) — 20 minutes each, plus 5 minutes for a video recap. Limited slots available. Reach out for pricing and booking.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Pass Options
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-12 max-w-[600px] mx-auto">
              Choose the pass that fits your weekend plans
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Weekend Pass */}
              <div className="bg-white rounded-xl p-6 border-2 border-pink-accent shadow-lg">
                <div className="text-center mb-4">
                  <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-3">
                    MOST POPULAR
                  </div>
                  <h3 className="font-spartan font-semibold text-2xl mb-2">Weekend Pass</h3>
                  <p className="text-sm text-text-dark/70 mb-4">The full experience</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>All workshops (Sat & Sun)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>All socials (Fri, Sat, Sun)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>Community lunch (Sat)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-dark/60">
                    <span>+</span>
                    <span>Spotlight critique (optional)</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-text-dark/70 mb-2">Early Bird (until May 31)</p>
                  <p className="text-3xl font-bold text-pink-accent mb-1">R1,800</p>
                  <p className="text-xs text-text-dark/60">Normal: R2,000 | Late: R2,200</p>
                </div>
              </div>

              {/* Day Pass */}
              <div className="bg-white rounded-xl p-6 border-2 border-purple-accent/30">
                <div className="text-center mb-4">
                  <h3 className="font-spartan font-semibold text-2xl mb-2">Day Pass</h3>
                  <p className="text-sm text-text-dark/70 mb-4">One full day</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>Workshops (Sat OR Sun)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>Socials (Fri + your day)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>Community lunch (if Sat)</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm text-text-dark/70 mb-2">Early Bird (until May 31)</p>
                  <p className="text-3xl font-bold text-purple-accent mb-1">R900</p>
                  <p className="text-xs text-text-dark/60">Normal: R1,000 | Late: R1,100</p>
                </div>
              </div>

              {/* Party Pass */}
              <div className="bg-white rounded-xl p-6 border-2 border-yellow-accent/30">
                <div className="text-center mb-4">
                  <h3 className="font-spartan font-semibold text-2xl mb-2">Party Pass</h3>
                  <p className="text-sm text-text-dark/70 mb-4">Just here to dance</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>All socials (Fri, Sat, Sun)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-dark/40">
                    <span className="text-red-500">✗</span>
                    <span>Workshops</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-dark/40">
                    <span className="text-red-500">✗</span>
                    <span>Community lunch</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-3xl font-bold text-yellow-accent mb-1">R400</p>
                  <p className="text-xs text-text-dark/60">All weekend</p>
                </div>
              </div>

              {/* Spotlight Critique Add-on */}
              <div className="bg-white rounded-xl p-6 border-2 border-text-dark/20">
                <div className="text-center mb-4">
                  <h3 className="font-spartan font-semibold text-2xl mb-2">Spotlight Critique</h3>
                  <p className="text-sm text-text-dark/70 mb-4">Optional add-on</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>30sec dance → feedback</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>30sec dance → feedback</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600">✓</span>
                    <span>Harold & Kristen</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-dark/60">
                    <span>⚠️</span>
                    <span>Limited to 10 couples</span>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-3xl font-bold text-text-dark mb-1">R100</p>
                  <p className="text-xs text-text-dark/60">Per entry (5 min total)</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <a 
                href="/#weekender" 
                className="inline-block bg-pink-accent text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-pink-accent/90 hover:shadow-xl transition-all"
              >
                Register Your Interest
              </a>
              <p className="text-sm text-text-dark/60 mt-4">
                Booking opens soon. Add your name to the list to be notified first.
              </p>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-12">
              Good to Know
            </h2>

            <div className="space-y-8">
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <h3 className="font-spartan font-semibold text-2xl mb-4">📍 Venue</h3>
                <p className="text-text-dark/80">
                  Details coming soon. Cape Town venue with two halls for simultaneous workshops.
                </p>
              </div>

              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <h3 className="font-spartan font-semibold text-2xl mb-4">🎯 Understanding Levels</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-spartan font-semibold text-lg text-purple-accent mb-2">Level 1</h4>
                    <p className="text-text-dark/80 mb-2">
                      You know the basics of West Coast Swing, but you still don't feel confident when social dancing. In addition to improving your basics, you want to learn the West Coast Swing fundamentals and be able to dance with any partner.
                    </p>
                    <p className="text-sm text-text-dark/70 italic">
                      All welcome — from never danced to busy learning the dance
                    </p>
                  </div>

                  <div>
                    <h4 className="font-spartan font-semibold text-lg text-yellow-accent mb-2">Level 2</h4>
                    <p className="text-text-dark/80 mb-2">
                      You are not afraid of any tempos. You can social dance with partners of different levels (beginners to advanced) without any problem. Your interest is in trying to find your own style, as well as to start being more musical, not only using the beat of the music, but every bit of its accents. You want to learn new variations, as well as new moves.
                    </p>
                    <div className="bg-yellow-accent/20 rounded-lg p-4 mt-3">
                      <p className="font-semibold text-sm mb-2">✓ Teacher Approval Required for regular classes</p>
                      <p className="text-sm text-text-dark/80">
                        For the weekender, you should be comfortable dancing the 5 basics (sugar push, left side pass, underarm turn, sugar tuck, basic whip) and understand concepts like redirections, elasticity, and body-leads.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
