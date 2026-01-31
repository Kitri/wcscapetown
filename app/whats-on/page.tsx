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
              What's On
            </h1>
            <p className="text-lg md:text-xl text-text-dark/80">
              West Coast Swing classes & socials
            </p>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="px-[5%] py-[30px] bg-white border-b border-text-dark/10">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-2xl text-center mb-6">Regular Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Monday Classes */}
              <a href="#monday-classes" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-yellow-accent text-text-dark px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  EVERY MONDAY
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Level 1 & 2 Classes & Social</h3>
                <p className="text-text-dark/70">7-10 PM | Havana Nights, Plumstead</p>
                <p className="text-sm italic mt-1">
                  <a href="#class-levels" className="text-text-dark/60 hover:text-pink-accent underline">
                    See level descriptions
                  </a>
                </p>
              </a>
              
              {/* Tuesday Classes */}
              <a href="#tuesday-classes" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-purple-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  EVERY TUESDAY
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Level 1 Class & Social</h3>
                <p className="text-text-dark/70">7:30-10 PM | Pinelands Bowling Club</p>
                <p className="text-sm italic font-semibold mt-1 text-purple-accent">✨ Launching February 2026</p>
              </a>

              {/* Wednesday Down to Earth Market */}
              <a href="#down-to-earth" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-text-dark text-cloud-dancer px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  EVERY WEDNESDAY
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Casual Dancing</h3>
                <p className="text-text-dark/70">6-8 PM | Down to Earth Market</p>
                <p className="text-sm italic font-semibold mt-1">Where we hang out on Wednesdays</p>
              </a>
            </div>

            <h2 className="font-spartan font-semibold text-2xl text-center mb-6">Special Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* WCS Weekender */}
              <a href="/#weekender" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  MAR 20-22
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">WCS Weekender</h3>
                <p className="text-text-dark/70">International Pros</p>
                <p className="text-sm italic font-semibold mt-1 text-pink-accent">Cape Town</p>
              </a>

              {/* Monthly Social */}
              <a href="#monthly-social" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  FEBRUARY
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Monthly Social</h3>
                <p className="text-text-dark/70">Scout Hall, Claremont</p>
                <p className="text-sm italic font-semibold mt-1">Date TBA</p>
              </a>

              {/* Beginner Bootcamp */}
              <a href="#beginner-bootcamp" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  FEBRUARY
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Beginner Bootcamp</h3>
                <p className="text-text-dark/70">3-hour WCS fundamentals</p>
                <p className="text-sm italic font-semibold mt-1">Date & Venue TBA</p>
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
                      <p className="text-text-dark/70 italic">R300 for 4 classes (Mondays only)</p>
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
            
            {/* Special February Launch Announcement */}
            <div className="bg-purple-accent/20 border-2 border-purple-accent rounded-xl p-6 md:p-8 mb-8 text-center">
              <p className="text-lg md:text-xl font-semibold mb-2">
                ✨ Launching New Class this February!
              </p>
              <p className="text-base md:text-lg">
                Join us for our new Tuesday Level 1 class at Pinelands Bowling Club
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
              Monthly Social
            </h2>
            
            <p className="text-lg md:text-xl text-center mb-8 max-w-[600px] mx-auto">
              Pure WCS. All night.
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
                    <p>February 2026</p>
                    <p className="text-sm text-text-dark/70 italic">Exact date to be announced</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🕗 Time</p>
                    <p>TBA</p>
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
                      <a href="https://maps.app.goo.gl/dW2qw4e79TymZuzU9" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline"> Parking</a> is in Thelma, just after the building before the tennis courts. Look for a wired gate with a small purple sign: "SCOUTS - Scout Hall Parking only".
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beginner Bootcamp - Full Details */}
        <section 
          id="beginner-bootcamp"
          className="px-[5%] py-[50px] bg-cloud-dancer"
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-6">
              Beginner Bootcamp
            </h2>
            
            <p className="text-lg md:text-xl text-center mb-8 max-w-[600px] mx-auto">
              3 hours of West Coast Swing fundamentals. Everything you need to start social dancing with confidence.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - What You'll Learn */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">What You'll Learn</h3>
                <div className="space-y-3">
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Core Basics</p>
                    <p className="text-sm text-text-dark/70">Sugar push, side pass, underarm turn & more</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Connection & Technique</p>
                    <p className="text-sm text-text-dark/70">Frame, elasticity, and partner connection</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-4">
                    <p className="font-semibold">Social Dancing</p>
                    <p className="text-sm text-text-dark/70">Floor craft and dance floor etiquette</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Details</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📅 When</p>
                    <p>Weekend in February 2026</p>
                    <p className="text-sm text-text-dark/70 italic">Exact date to be announced</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">⏱️ Duration</p>
                    <p>3 hours</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">📍 Where</p>
                    <p className="text-sm text-text-dark/70 italic">Venue to be announced</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">💰 Cost</p>
                    <p>TBA</p>
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
                  You know the basics of West Coast Swing, but you still don't feel confident when social dancing. In addition to improving your basics, you want to learn the West Coast Swing fundamentals and be able to dance with any partner.
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
                        <li>Followers don't anticipate the lead, and find resistance away before moving</li>
                        <li>Followers keep linear and rotational momentum while leads "direct, guide and catch"</li>
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
