import Header from "@/components/Header";
import Image from "next/image";

export default function Weekender() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="px-[5%] py-[50px] bg-gradient-to-br from-pink-accent/20 via-pink-accent/10 to-transparent">
          <div className="max-w-[1100px] mx-auto text-center">
            <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-4">
              🌟 MARCH 20-22, 2026
            </div>
            <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] mb-4">
              WCS Weekender
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Cape Town's Premier West Coast Swing Weekend
            </p>
            <p className="text-lg md:text-xl text-text-dark/80 max-w-[700px] mx-auto mb-8">
              Three days of world-class instruction, evening socials, and unforgettable dancing
            </p>

            {/* Instructors */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-[800px] mx-auto mb-8">
              <a href="https://www.instagram.com/igorandfernanda/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-full max-w-[200px] md:max-w-none aspect-square rounded-xl mb-3 overflow-hidden border-2 border-text-dark/10 group-hover:border-pink-accent transition-all shadow-md relative">
                  <Image
                    src="/images/igor_fernanda1.jpg"
                    alt="Igor Pitangui and Fernanda Dubiel"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-base md:text-lg font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors">
                  Igor Pitangui &<br />Fernanda Dubiel
                </p>
              </a>
              
              <a href="https://www.instagram.com/kwalla.bear" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl mb-3 overflow-hidden border-2 border-text-dark/10 group-hover:border-pink-accent transition-all shadow-md relative">
                  <Image
                    src="/images/kristen1.jpg"
                    alt="Kristen Wallace"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-base md:text-lg font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors">
                  Kristen Wallace
                </p>
              </a>
              
              <a href="https://www.instagram.com/harold_baker_dance" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl mb-3 overflow-hidden border-2 border-text-dark/10 group-hover:border-pink-accent transition-all shadow-md relative">
                  <Image
                    src="/images/harold1.jpg"
                    alt="Harold Baker"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-base md:text-lg font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors">
                  Harold Baker
                </p>
              </a>
            </div>

            <a 
              href="/#weekender" 
              className="inline-block bg-pink-accent text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pink-accent/90 hover:shadow-xl transition-all"
            >
              Register Your Interest
            </a>
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
              <div className="space-y-3">
                <div className="bg-purple-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-purple-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">09:00-11:30</div>
                    <div>
                      <p className="font-semibold mb-1">Private Lesson Slots Available</p>
                      <p className="text-sm text-text-dark/70">45-minute sessions with the pros (by appointment)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-yellow-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">10:00-11:00</div>
                    <div>
                      <p className="font-semibold mb-1">Spotlight Critique</p>
                      <p className="text-sm text-text-dark/70">Harold & Kristen (Optional add-on, limited to 10 couples)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">11:30-12:30</div>
                    <div>
                      <p className="font-semibold mb-1">Workshops</p>
                      <p className="text-sm text-text-dark/70">Level 1: Harold & Kristen | Level 2: Igor & Fernanda</p>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-pink-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">12:30-14:00</div>
                    <div>
                      <p className="font-semibold mb-1">Community Lunch</p>
                      <p className="text-sm text-text-dark/70">Bring and share - included with Weekend & Day Pass</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">14:00-15:00</div>
                    <div>
                      <p className="font-semibold mb-1">Workshops</p>
                      <p className="text-sm text-text-dark/70">Level 1: Igor & Fernanda | Level 2: Harold & Kristen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">15:00-16:00</div>
                    <div>
                      <p className="font-semibold mb-1">Workshops</p>
                      <p className="text-sm text-text-dark/70">Level 1: Harold & Kristen | Level 2: Igor & Fernanda</p>
                    </div>
                  </div>
                </div>

                <div className="bg-text-dark/5 rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">16:00-16:15</div>
                    <div>
                      <p className="font-semibold mb-1">Break</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">16:15-17:15</div>
                    <div>
                      <p className="font-semibold mb-1">Level 2 Workshop</p>
                      <p className="text-sm text-text-dark/70">Harold & Kristen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-text-dark/5 rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">17:15-18:30</div>
                    <div>
                      <p className="font-semibold mb-1">Dinner Break</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-yellow-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">18:30-19:30</div>
                    <div>
                      <p className="font-semibold mb-1">Master Your Social Dance on the Floor</p>
                      <p className="text-sm text-text-dark/70">All levels - Igor & Fernanda</p>
                    </div>
                  </div>
                </div>

                <div className="bg-pink-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-pink-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">19:30-23:00</div>
                    <div>
                      <p className="font-semibold mb-1">Saturday Night Social</p>
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
              <div className="space-y-3">
                <div className="bg-purple-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-purple-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">09:00-11:00</div>
                    <div>
                      <p className="font-semibold mb-1">Private Lesson Slots Available</p>
                      <p className="text-sm text-text-dark/70">45-minute sessions with the pros (by appointment)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-yellow-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">11:00-12:00</div>
                    <div>
                      <p className="font-semibold mb-1">Follower Focus</p>
                      <p className="text-sm text-text-dark/70">Igor & Fernanda</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-yellow-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">12:00-13:00</div>
                    <div>
                      <p className="font-semibold mb-1">Leads Focus</p>
                      <p className="text-sm text-text-dark/70">Harold & Kristen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-text-dark/5 rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">13:00-14:00</div>
                    <div>
                      <p className="font-semibold mb-1">Lunch Break</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">14:00-15:00</div>
                    <div>
                      <p className="font-semibold mb-1">Workshops</p>
                      <p className="text-sm text-text-dark/70">Level 1: Igor & Fernanda | Level 2: Harold & Kristen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">15:00-16:00</div>
                    <div>
                      <p className="font-semibold mb-1">Workshops</p>
                      <p className="text-sm text-text-dark/70">Level 1: Harold & Kristen | Level 2: Igor & Fernanda</p>
                    </div>
                  </div>
                </div>

                <div className="bg-text-dark/5 rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">16:00-16:15</div>
                    <div>
                      <p className="font-semibold mb-1">Break</p>
                    </div>
                  </div>
                </div>

                <div className="bg-cloud-dancer rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">16:15-17:15</div>
                    <div>
                      <p className="font-semibold mb-1">Workshops</p>
                      <p className="text-sm text-text-dark/70">Level 1: Igor & Fernanda | Level 2: Harold & Kristen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-text-dark/5 rounded-lg p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">17:15-18:30</div>
                    <div>
                      <p className="font-semibold mb-1">Dinner Break</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-accent/10 rounded-lg p-4 md:p-6 border-l-4 border-yellow-accent">
                  <div className="flex items-start gap-4">
                    <div className="text-base font-semibold text-text-dark/70 min-w-[100px]">18:30-19:30</div>
                    <div>
                      <p className="font-semibold mb-1">All Levels Workshop</p>
                      <p className="text-sm text-text-dark/70">Harold & Kristen</p>
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

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-cloud-dancer rounded-xl p-6">
                <h3 className="font-spartan font-semibold text-xl mb-3">📍 Venue</h3>
                <p className="text-text-dark/80">
                  Details coming soon. Located in Cape Town with ample space for workshops and socials.
                </p>
              </div>

              <div className="bg-cloud-dancer rounded-xl p-6">
                <h3 className="font-spartan font-semibold text-xl mb-3">🏨 Accommodation</h3>
                <p className="text-text-dark/80">
                  Recommendations for nearby accommodation will be shared with registered participants.
                </p>
              </div>

              <div className="bg-cloud-dancer rounded-xl p-6">
                <h3 className="font-spartan font-semibold text-xl mb-3">🎯 Levels</h3>
                <p className="text-text-dark/80 mb-2">
                  <strong>Level 1:</strong> Comfortable with basics, building confidence and fundamentals.
                </p>
                <p className="text-text-dark/80">
                  <strong>Level 2:</strong> Social dancing confidently at various tempos, exploring style and musicality.
                </p>
              </div>

              <div className="bg-cloud-dancer rounded-xl p-6">
                <h3 className="font-spartan font-semibold text-xl mb-3">🍽️ Food</h3>
                <p className="text-text-dark/80">
                  Saturday community lunch is bring-and-share (included with Weekend & Day Pass). Dinner breaks built into schedule.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
