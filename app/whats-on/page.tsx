import Header from "@/components/Header";

export default function WhatsOn() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="px-[5%] py-[40px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] mb-4">
              What&apos;s On
            </h1>
            <p className="text-lg md:text-xl text-text-dark/80">
              West Coast Swing classes and socials
            </p>
            <div className="flex items-center justify-center gap-3 mt-3 text-sm text-text-dark/60">
              <span>Contact us for more info:</span>
              <a href="https://www.facebook.com/wcscapetown" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:opacity-70 transition-opacity" aria-label="Facebook">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-pink-accent">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
              </a>
              <a href="https://www.instagram.com/wcscapetown" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:opacity-70 transition-opacity" aria-label="Instagram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-pink-accent">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
              </a>
              <a href="mailto:hello@wcscapetown.co.za" className="text-pink-accent hover:underline text-sm">hello@wcscapetown.co.za</a>
            </div>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="px-[5%] py-[40px] bg-white">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-2xl text-center mb-8">Regular Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Monday Classes */}
              <a href="#monday-classes" className="group border-2 border-yellow-accent/30 hover:border-yellow-accent rounded-xl p-6 text-center transition-all hover:shadow-lg">
                <div className="inline-block bg-yellow-accent text-text-dark px-4 py-2 rounded-full font-semibold text-xs mb-3">
                  EVERY MONDAY
                </div>
                <h3 className="font-spartan font-semibold text-lg mb-2">Level 1 & 2 Classes & Social</h3>
                <p className="text-sm text-text-dark/70 mb-1">7-10 PM</p>
                <p className="text-sm text-text-dark/70">Havana Nights, Plumstead</p>
                <p className="text-xs mt-2 font-semibold text-yellow-accent">Next class: 6 April</p>
                <p className="text-xs mt-1 text-text-dark/60">
                  See level descriptions below
                </p>
              </a>
              
              {/* Tuesday Classes */}
              <a href="#tuesday-classes" className="group border-2 border-purple-accent/30 hover:border-purple-accent rounded-xl p-6 text-center transition-all hover:shadow-lg">
                <div className="inline-block bg-purple-accent text-white px-4 py-2 rounded-full font-semibold text-xs mb-3">
                  EVERY TUESDAY
                </div>
                <h3 className="font-spartan font-semibold text-lg mb-2">Level 1 Class & Social</h3>
                <p className="text-sm text-text-dark/70 mb-1">7:30-10 PM</p>
                <p className="text-sm text-text-dark/70">Pinelands Bowling Club</p>
                <p className="text-xs mt-2 font-semibold text-purple-accent">Next class: 7 April</p>
              </a>

              {/* Wednesday Down to Earth Market */}
              <a href="#down-to-earth" className="group border-2 border-text-dark/20 hover:border-text-dark/40 rounded-xl p-6 text-center transition-all hover:shadow-lg">
                <div className="inline-block bg-text-dark/10 text-text-dark px-4 py-2 rounded-full font-semibold text-xs mb-3">
                  EVERY WEDNESDAY
                </div>
                <h3 className="font-spartan font-semibold text-lg mb-2">Casual Dancing</h3>
                <p className="text-sm text-text-dark/70 mb-1">6-8 PM</p>
                <p className="text-sm text-text-dark/70">Down to Earth Market</p>
                <p className="text-xs mt-2 font-semibold text-text-dark/50">Next: 1 April</p>
                <p className="text-xs italic mt-1 text-text-dark/60">Informal hangout</p>
              </a>
            </div>

            <h2 className="font-spartan font-semibold text-2xl text-center mb-8">Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {/* Monthly Social */}
              <a href="#monthly-social" className="group border-2 border-pink-accent/30 hover:border-pink-accent rounded-xl p-6 text-center transition-all hover:shadow-lg">
                <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-xs mb-3">
                  SATURDAY • 25 APRIL
                </div>
                <h3 className="font-spartan font-semibold text-lg mb-2">WCS + Blues Social</h3>
                <p className="text-sm text-text-dark/70 mb-1">Scout Hall, Claremont</p>
                <p className="text-xs italic mt-2 text-text-dark/60">WCS taster class 8pm; social 8:30pm</p>
              </a>
            </div>

          </div>
        </section>

        {/* Monday Classes - Full Details */}
        <section 
          id="monday-classes"
          className="px-[5%] py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-6">
              Monday Classes & Social
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Class Flow */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Class Flow</h3>
                <div className="space-y-3">
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Level 2 Class</p>
                    <p className="text-sm text-text-dark/70">7:00 – 7:45 PM (teacher approval)</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Level 1 Class</p>
                    <p className="text-sm text-text-dark/70">7:45 – 8:30 PM (all welcome)</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Level 2 Practice</p>
                    <p className="text-sm text-text-dark/70">7:45 – 8:30 PM</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Social Dance</p>
                    <p className="text-sm text-text-dark/70">8:30 – 10:00 PM (all welcome)</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Details</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📅 When</p>
                    <p>Every Monday</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🕖 Time</p>
                    <p>7:00 – 10:00 PM</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">📍 Where</p>
                    <p>
                      <a href="https://maps.app.goo.gl/oApU2JvkK5qfYbCi7" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">
                        Havana Nights
                      </a>
                      <br />Plumstead, Cape Town
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">💰 Cost</p>
                    <div className="text-sm md:text-base space-y-1">
                      <p>R100 per person (class & social)</p>
                      <p className="text-purple-accent font-semibold">R150 for Monday + Tuesday (both classes & socials)</p>
                      <p className="text-text-dark/70 italic">R300 for the month (Mondays only) </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tuesday Classes - Full Details */}
        <section 
          id="tuesday-classes"
          className="px-[5%] py-[50px] bg-cloud-dancer"
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-6">
              Tuesday Classes & Social
            </h2>
            
            {/* Tuesday class announcement */}
            <div className="bg-purple-accent/20 border-2 border-purple-accent rounded-xl p-6 md:p-8 mb-8 text-center">
              <p className="text-lg md:text-xl font-semibold mb-2">
                ✨ Tuesday Level 1 Class
              </p>
              <p className="text-base md:text-lg">
                Join us every Tuesday at Pinelands Bowling Club
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Class Flow */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Class Flow</h3>
                <div className="space-y-3">
                  <div className="bg-white/60 rounded-lg p-4 border-l-4 border-purple-accent">
                    <p className="font-semibold">Level 1 Class</p>
                    <p className="text-sm text-text-dark/70">7:30 – 8:30 PM</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4 border-l-4 border-purple-accent">
                    <p className="font-semibold">Social Dance</p>
                    <p className="text-sm text-text-dark/70">8:30 – 10:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Details</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📅 When</p>
                    <p>Every Tuesday</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🕗 Time</p>
                    <p>7:30 – 10:00 PM</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">📍 Where</p>
                    <p>
                      <a href="https://maps.app.goo.gl/XcDwvvbCxAjjJSXA6" target="_blank" rel="noopener noreferrer" className="text-purple-accent hover:text-pink-accent underline">
                        Pinelands Bowling Club
                      </a>
                      <br />Pinelands, Cape Town
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">💰 Cost</p>
                    <div className="text-sm md:text-base space-y-1">
                      <p>R100 per person (class & social)</p>
                      <p>R50 for social only</p>
                      <p className="text-purple-accent font-semibold">R150 for Monday + Tuesday (both classes & socials)</p>
                      <p className="text-text-dark/70 italic">R300 for 4 classes (Tuesdays only)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Down to Earth Market - Full Details */}
        <section 
          id="down-to-earth"
          className="px-[5%] py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(40, 39, 35, 0.08), rgba(40, 39, 35, 0.03))",
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-6">
              Down to Earth Market
            </h2>
            
            <p className="text-lg md:text-xl text-center mb-8 max-w-[700px] mx-auto">
              Join local westies for a casual evening of dancing to live music. Not an official WCS event, but a WCS-friendly space where we gather to dance.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - About */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">What to Expect</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold mb-2">🎵 Live Music</p>
                    <p className="text-sm text-text-dark/70">Enjoy local musicians performing from 6-8 PM</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold mb-2">💃 Small Dance Floor</p>
                    <p className="text-sm text-text-dark/70">Dance WCS to the live music when suitable</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold mb-2">🎶 WCS Playlist</p>
                    <p className="text-sm text-text-dark/70">We plug in our playlist during breaks between sets</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold mb-2">🍽️ Market Vibe</p>
                    <p className="text-sm text-text-dark/70">Casual atmosphere with food and drinks available</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Details</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📅 When</p>
                    <p>Every Wednesday</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🕕 Time</p>
                    <p>6:00 – 8:00 PM</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">📍 Where</p>
                    <p>
                      <a href="https://maps.app.goo.gl/nWBS1Xv6wgKoFF5G9" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">
                        Down to Earth Market
                      </a>
                      <br />Timour Hall, Constantia<br />Cape Town
                    </p>
                    <p className="text-sm text-text-dark/70 mt-2">
                      <a href="https://www.facebook.com/p/Down-to-EARTH-market-61566541304925/" target="_blank" rel="noopener noreferrer" className="text-text-dark/60 hover:text-pink-accent underline">
                        Facebook Page
                      </a>
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">💰 Cost</p>
                    <p>Free entry to market</p>
                    <p className="text-sm text-text-dark/70 italic">Support the market by purchasing from vendors</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-text-dark/5 rounded-lg">
                  <p className="text-sm text-text-dark/80 italic">
                    💡 This is a community market with live music, not a dedicated WCS event. Come hang out, enjoy the vibe, and dance when the music allows!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Monthly Social - Full Details */}
        <section 
          id="monthly-social"
          className="px-[5%] py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(219, 64, 156, 0.15), rgba(219, 64, 156, 0.05))",
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-6">
              WCS + Blues Social
            </h2>
            
            <p className="text-lg md:text-xl text-center mb-8 max-w-[600px] mx-auto">
              WCS + Blues social.
            </p>
            
            {/* Bonus Taster Class Highlight */}
            <div className="bg-pink-accent/20 border-2 border-pink-accent rounded-xl p-6 md:p-8 mb-8 text-center">
              <p className="text-lg md:text-xl font-semibold mb-2">
                🎓 Bonus: Taster Class
              </p>
              <p className="text-base md:text-lg">
                Perfect for absolute beginners!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Event Details */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Event Details</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📅 When</p>
                    <p>Saturday, 25 April</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🕗 Time</p>
                     <p><b>WCS taster class:</b> 8pm</p>
                    <p><b>Social:</b> 8:30pm</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">💰 Cost</p>
                    <p>R50 per person</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Venue & Parking */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Venue & Parking</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📍 Venue</p>
                    <p>
                      <a href="https://maps.app.goo.gl/JVyfLAohdRTqQvcg8" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">
                        Scout Hall
                      </a>
                      <br />17 Bowwood Rd, Claremont<br />Cape Town
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🏎️ Parking</p>
                    <p className="text-sm text-text-dark/80">
                      Scout Hall is on the corner of Bowwood and Thelma. 
                      <a href="https://maps.app.goo.gl/dW2qw4e79TymZuzU9" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline"> Parking</a> is in Thelma, just after the building before the tennis courts. Look for a wired gate with a small purple sign: &quot;SCOUTS - Scout Hall Parking only&quot;.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Class Levels Explanation */}
        <section id="class-levels" className="px-[5%] py-[50px] bg-white">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-8">
              Understanding Class Levels
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Level 1 */}
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <h3 className="font-spartan font-semibold text-2xl mb-4 text-purple-accent">Level 1</h3>
                <p className="text-base md:text-lg mb-4">
                      You know the basics of West Coast Swing, but you still don&apos;t feel confident when social dancing. In addition to improving your basics, you want to learn the West Coast Swing fundamentals and be able to dance with any partner.
                </p>
                <p className="text-sm text-text-dark/70 italic">
                  All welcome — from never danced to busy learning the dance
                </p>
              </div>

              {/* Level 2 */}
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <h3 className="font-spartan font-semibold text-2xl mb-4 text-yellow-accent">Level 2</h3>
                <p className="text-base md:text-lg mb-4">
                  You are not afraid of any tempos. You can social dance with partners of different levels (beginners to advanced) without any problem. Your interest is in trying to find your own style, as well as to start being more musical, not only using the beat of the music, but every bit of its accents. You want to learn new variations, as well as new moves.
                </p>
                <div className="bg-yellow-accent/20 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-sm mb-2">✓ Teacher Approval Required</p>
                  <p className="text-sm text-text-dark/80">
                    You must be comfortable dancing the 5 basics and understand key concepts below.
                  </p>
                </div>
                <details className="text-sm">
                  <summary className="font-semibold cursor-pointer hover:text-yellow-accent transition-colors mb-2">
                    Level 2 Entry Requirements
                  </summary>
                  <div className="mt-3 space-y-3 text-text-dark/80">
                    <div>
                      <p className="font-semibold mb-1">Core Basics (comfortable execution):</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Sugar push</li>
                        <li>Left side pass</li>
                        <li>Underarm turn</li>
                        <li>Sugar tuck</li>
                        <li>Basic whip</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Fundamental Concepts (understanding & practicing):</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Linear redirections through push, tuck or cut-off</li>
                        <li>Rotational redirect through roll-in-roll-out type patterns</li>
                        <li>Technique to prep for a travelling turn (e.g. inside roll)</li>
                        <li>Dancing in closed position</li>
                        <li>Elasticity</li>
                        <li>Leading with body-leads, not forceful arm leads</li>
                        <li>Followers don&apos;t anticipate the lead, and find resistance away before moving</li>
                        <li>Followers keep linear and rotational momentum while leads &quot;direct, guide and catch&quot;</li>
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
