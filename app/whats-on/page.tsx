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
            <div className="grid md:grid-cols-2 gap-6">
              {/* Monday Classes */}
              <a href="#monday-classes" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-yellow-accent text-text-dark px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  EVERY MONDAY
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Levelled Classes & Social</h3>
                <p className="text-text-dark/70">7-10 PM | Havana Nights, Plumstead</p>
                <p className="text-sm italic font-semibold mt-1">* Newbie January promo</p>
              </a>
              
              {/* Strictly Social */}
              <a href="#strictly-social" className="text-center hover:scale-105 transition-transform">
                <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full font-semibold text-sm mb-2">
                  SAT 24 JAN
                </div>
                <h3 className="font-spartan font-semibold text-xl mb-1">Strictly Social</h3>
                <p className="text-text-dark/70">8 PM | Scout Hall, Claremont</p>
                <p className="text-sm italic font-semibold mt-1">West Coast Swing Taster & Social</p>
              </a>
            </div>
          </div>
        </section>

        {/* January Monday Classes - Full Details */}
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
            
            {/* Special January Offer */}
            <div className="bg-yellow-accent/30 border-2 border-yellow-accent rounded-xl p-6 md:p-8 mb-8 text-center">
              <p className="text-lg md:text-xl font-semibold mb-2">
                Let's grow West Coast Swing in Cape Town! 🎉
              </p>
              <p className="text-base md:text-lg">
                <strong>This January</strong>, bring a newbie* and their first taste of West Coast Swing is on us.
              </p>
              <p className="text-sm text-text-dark/70 mt-4 italic">
                *Newbie can be a friend, foe, lover, partner, situationship - we don't judge. The only criteria is they must not have attended a class before.
              </p>
            </div>

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
                    <p>R100 per person (class & social)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strictly Social - Full Details */}
        <section 
          id="strictly-social"
          className="px-[5%] py-[50px] bg-cloud-dancer"
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] text-center mb-6">
              Strictly Social
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
                8:00 PM - Perfect for absolute beginners!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Event Details */}
              <div>
                <h3 className="font-spartan font-semibold text-xl mb-4">Event Details</h3>
                <div className="space-y-4 text-base md:text-lg">
                  <div>
                    <p className="font-semibold mb-1">📅 When</p>
                    <p>Saturday, 24 January 2026</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">🕗 Time</p>
                    <p>8:00 – 11:00 PM</p>
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

        {/* Coming Soon */}
        <section className="px-[5%] py-[50px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="text-lg text-text-dark/70">📅 Event calendar coming soon...</p>
          </div>
        </section>
      </main>
    </>
  );
}
