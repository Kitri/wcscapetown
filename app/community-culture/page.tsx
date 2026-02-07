import Header from "@/components/Header";

export default function CommunityCulture() {
  return (
    <>
      <Header />
      <main>
        {/* Section 1: Key Principles - Cloud Dancer Background */}
        <section className="px-[5%] py-[40px] md:py-[50px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] mb-4">
              Community Culture
            </h1>
            
            <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] mb-4">
              Overview
            </h2>
            
            <p className="text-lg md:text-xl leading-relaxed max-w-[700px] mx-auto mb-8">
              Our community is built on care, consent, and connection.
            </p>
            
            {/* Key Principles - Different Shapes */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Circle accent */}
              <div className="relative bg-white rounded-2xl p-6 shadow-md text-left overflow-hidden">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-accent/30 rounded-full"></div>
                <div className="relative z-10">
                  <h3 className="font-spartan font-semibold text-xl mb-3">
                    Everyone is Welcome
                  </h3>
                  <p className="text-sm md:text-base text-text-dark/80 leading-relaxed">
                    Across identities, bodies, and dance experience. No bigotry or harassment allowed.
                  </p>
                </div>
              </div>
              
              {/* Corner triangle */}
              <div className="relative bg-white rounded-2xl p-6 shadow-md text-left overflow-hidden">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-t-pink-accent/30 border-l-[60px] border-l-transparent"></div>
                <div className="relative z-10">
                  <h3 className="font-spartan font-semibold text-xl mb-3">
                    Consent is Key
                  </h3>
                  <p className="text-sm md:text-base text-text-dark/80 leading-relaxed">
                    Ask before you dance, respect a &quot;no&quot;. Read the room and the person. When in doubt, ask.
                  </p>
                </div>
              </div>
              
              {/* Diagonal stripe */}
              <div className="relative bg-white rounded-2xl p-6 shadow-md text-left overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-pink-accent/20"></div>
                <div className="relative z-10">
                  <h3 className="font-spartan font-semibold text-xl mb-3">
                    Respect Boundaries
                  </h3>
                  <p className="text-sm md:text-base text-text-dark/80 leading-relaxed">
                    Boundaries matter. People matter. Repeated or intentional boundary-crossing will be addressed immediately.
                  </p>
                </div>
              </div>
              
              {/* Rounded square accent */}
              <div className="relative bg-white rounded-2xl p-6 shadow-md text-left overflow-hidden">
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-accent/30 rounded-tr-3xl"></div>
                <div className="relative z-10">
                  <h3 className="font-spartan font-semibold text-xl mb-3">
                    We Look Out for Each Other
                  </h3>
                  <p className="text-sm md:text-base text-text-dark/80 leading-relaxed">
                    See someone looking uncomfortable? Check in. Something feel off? Flag it to the organisers, no drama required.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-accent/30 via-pink-accent/20 to-yellow-accent/30 border-2 border-yellow-accent rounded-lg p-6 shadow-md text-center">
              <p className="text-base md:text-lg font-semibold mb-2">
                We are building this community together
              </p>
              <p className="text-sm md:text-base text-text-dark/80 leading-relaxed">
                Let&apos;s dance, connect, and keep this space joyful for everyone.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Reach Out - Yellow Background */}
        <section 
          className="px-[5%] py-[40px] md:py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
          }}
        >
          <div className="max-w-[900px] mx-auto text-center">
            <h3 className="font-spartan font-semibold text-[24px] md:text-[28px] mb-4">
              We&apos;re Here to Listen
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If something doesn&apos;t feel right, or you experience or witness behaviour that goes against our values:
            </p>
            <p className="text-base md:text-lg font-semibold mb-6">
              Reach out to our community organisers or teaching team in person
            </p>
            <p className="text-text-dark/70 mb-6">Or reach out through:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:community@wcscapetown.co.za" className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-lg hover:bg-yellow-accent transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="fill-pink-accent">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                community@wcscapetown.co.za
              </a>
              <a href="https://www.instagram.com/wcscapetown/?hl=en" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-lg hover:bg-yellow-accent transition-colors shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="fill-pink-accent">
                  <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </section>

        {/* Section 3: Full Policy - Cloud Dancer Background */}
        <section className="px-[5%] py-[40px] md:py-[50px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-2 text-center">
              Our Full Policy
            </h2>
            
            <p className="text-base leading-relaxed mb-2 text-center font-semibold">
              Our Community Culture Is One of Care and Consent
            </p>
            
            <p className="text-base leading-relaxed mb-8 text-center">
              Our dance community is intended to be a fun, welcoming place where everyone can enjoy learning, dancing, and connecting. This shared agreement outlines how we look after one another and what helps keep our spaces safe, respectful, and joyful.
            </p>

            {/* Care Section */}
            <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-md">
              <div className="px-6 pt-6 pb-4">
                <h3 className="font-spartan font-semibold text-xl md:text-2xl border-b-3 border-yellow-accent pb-3 inline-block">
                  Care looks like
                </h3>
              </div>
              <div className="px-6 py-6">
                <ul className="space-y-6 text-base leading-loose">
                  <li className="font-light">
                    <div className="mb-2">We actively welcome differences in race, ethnicity, sexual orientation, gender identity, physical appearance, age, ability, and dance experience.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-yellow-accent/30 pl-4">
                      <li><strong>Inclusion is a core value of our community</strong></li>
                      <li>We <strong>do not tolerate</strong> behaviour rooted in <strong>hate, discrimination, harassment or threats</strong></li>
                      <li><strong>If you harass or threaten someone, you will be asked to leave</strong></li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2">We practice <strong>role freedom and curiosity</strong>.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-yellow-accent/30 pl-4">
                      <li>Lead and follow are choices, <strong>not gendered</strong> roles</li>
                      <li>We <strong>value dancing across experience levels</strong></li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2"><strong>Care</strong> on the dance floor <strong>requires awareness and responsibility</strong>.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-yellow-accent/30 pl-4">
                      <li>Be mindful of those around you</li>
                      <li>Apologise if you bump into or hurt someone</li>
                      <li>Everyone has <strong>different comfort levels</strong> - <strong>boundaries should be respected</strong></li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2">Care includes how we use our words.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-yellow-accent/30 pl-4">
                      <li><strong>Feedback and advice</strong> are part of learning <strong>when they are invited</strong></li>
                      <li><strong>Ask first</strong> if they would like to hear it</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            {/* Consent Section */}
            <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-md">
              <div className="px-6 pt-6 pb-4">
                <h3 className="font-spartan font-semibold text-xl md:text-2xl border-b-3 border-yellow-accent pb-3 inline-block">
                  Consent looks like
                </h3>
              </div>
              <div className="px-6 py-6">
                <ul className="space-y-6 text-base leading-loose">
                  <li className="font-light">
                    <div className="mb-2">Consent means <strong>asking before dancing with anyone</strong>, and <strong>accepting a &quot;no&quot; with grace and without pressure</strong>.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>A refusal is not an invitation to persuade, joke, negotiate, or revisit later</li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2">Consent also means:</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>Listening to <strong>verbal and non-verbal cues</strong></li>
                      <li><strong>Respecting personal boundaries</strong></li>
                      <li>Understanding that <strong>anyone can change their mind</strong> at any time</li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2"><strong>Consent is contextual</strong>.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>Just because someone dances a certain way with one person doesn&apos;t mean they want the same with someone else</li>
                      <li><strong>If you are unsure, ask</strong></li>
                      <li>If someone asks you to stop, <strong>stop</strong></li>
                      <li>Requests for <strong>personal comfort or safety</strong> are part of <strong>consent and mutual care</strong>, not criticism</li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2"><strong>Alcohol</strong> or other substances can make it <strong>harder to read boundaries</strong> accurately.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>Knowing your limits helps you <strong>respect others</strong></li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>

            {/* Looking Out Section */}
            <div className="bg-white rounded-xl overflow-hidden mb-6 shadow-md">
              <div className="px-6 pt-6 pb-4">
                <h3 className="font-spartan font-semibold text-xl md:text-2xl border-b-3 border-yellow-accent pb-3 inline-block">
                  Looking out for each other
                </h3>
              </div>
              <div className="px-6 py-6">
                <ul className="space-y-6 text-base leading-loose">
                  <li className="font-light">
                    <div className="mb-2"><strong>Care and consent are a shared responsibility</strong>.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>If you&apos;re unsure whether someone is okay, <strong>check in</strong></li>
                      <li>Ask if they need help, or invite them to dance to create space</li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2">If you experience or <strong>witness behaviour</strong> that goes <strong>against our principles</strong>:</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li><strong>Reach out to our community organisers or teaching team</strong></li>
                      <li>Contact us privately: <a href="https://www.instagram.com/wcscapetown/?hl=en" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline font-semibold">Instagram</a> or <a href="mailto:community@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline font-semibold">Email</a></li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2"><strong>Concerns</strong> may be addressed <strong>in the moment, or followed up privately</strong>.</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>Our approach is grounded in <strong>conversation and clarity</strong></li>
                      <li>Sometimes <strong>harm</strong> comes from <strong>misunderstanding</strong> - we&apos;re open to <strong>addressing that with care</strong></li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <div className="mb-2">However, if someone <strong>repeatedly or intentionally ignores boundaries or causes discomfort</strong>:</div>
                    <ul className="list-none space-y-2 mt-3 ml-4 border-l-2 border-pink-accent/30 pl-4">
                      <li>They may be <strong>asked to stop</strong> certain behaviours</li>
                      <li><strong>Or to refrain from returning</strong>, to protect the wellbeing of the community</li>
                    </ul>
                  </li>
                  
                  <li className="font-light">
                    <strong>We are grateful for everyone&apos;s care, attention, and commitment to making this a space where all can feel safe, respected, and welcome</strong>.
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-text-dark/70 italic text-center">
              This policy was created by West Coast Swing Cape Town in 2026, informed by the international standards of the <a href="https://www.worldsdc.com/code-of-conduct/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">World Swing Dance Council</a> and adapted from code of conduct policies developed by WCS communities including <a href="https://www.asiawcsopen.com/code-of-conduct/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">Asia West Coast Swing Open</a>, and <a href="https://www.nycswings.net/wcs-code-of-conduct/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">NYC Swings</a>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
