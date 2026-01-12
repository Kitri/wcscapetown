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
            <p className="text-lg md:text-xl leading-relaxed max-w-[700px] mx-auto mb-10">
              Our community is built on care, consent, and connection.
            </p>
            
            {/* Key Principles - White Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-sm text-left">
                <h3 className="font-spartan font-semibold text-lg mb-2">Everyone is welcome here</h3>
                <p className="text-sm text-text-dark/80">
                  Across identities, bodies, and dance experience. No bigotry or harassment allowed.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm text-left">
                <h3 className="font-spartan font-semibold text-lg mb-2">Consent is key</h3>
                <p className="text-sm text-text-dark/80">
                  Ask before you dance, accept a "no" graciously. Read the room and the person. When in doubt, ask. If someone pulls back, stop.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm text-left">
                <h3 className="font-spartan font-semibold text-lg mb-2">We look out for each other</h3>
                <p className="text-sm text-text-dark/80">
                  See someone looking uncomfortable? Check in. Something feel off? Flag it to the organisers, no drama required.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm text-left">
                <h3 className="font-spartan font-semibold text-lg mb-2">Respect boundaries</h3>
                <p className="text-sm text-text-dark/80">
                  Mistakes can happen and we are open to conversation and clarity. However, repeated or intentional boundary-crossing will be addressed immediately, and you will be asked to leave in order to protect the community.
                </p>
              </div>
            </div>
            
            <p className="text-base md:text-lg leading-relaxed italic">
              Most of all, dance, connect, and have fun. <b>We are building this community together.</b>
            </p>
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
            <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-4">
              We're Here to Listen
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If something doesn't feel right, or you experience or witness behaviour that goes against our values:
            </p>
            <p className="text-base md:text-lg font-semibold mb-6">
              Speak with a member of the core team or teaching team in person
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
              Our policy
            </h2>
            
            <p className="text-base leading-relaxed mb-2 text-center font-semibold">
              Our Community Culture Is One of Care and Consent
            </p>
            
            <p className="text-base leading-relaxed mb-8 text-center">
              Our dance community is intended to be a fun, welcoming place where everyone can enjoy learning, dancing, and connecting. This shared agreement outlines how we look after one another and what helps keep our spaces safe, respectful, and joyful.
            </p>

            {/* Care Dropdown */}
            <details className="bg-white rounded-xl p-4 md:p-6 mb-4 shadow-sm group [&>summary::-webkit-details-marker]:hidden [&>summary::marker]:hidden">
              <summary className="font-spartan font-semibold text-lg md:text-xl cursor-pointer hover:text-pink-accent transition-colors list-none flex items-center gap-2">
                <svg className="w-5 h-5 fill-pink-accent transition-transform group-open:rotate-90" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
                Care looks like
              </summary>
                
                <div className="mt-4 space-y-4 text-base leading-relaxed">
                  <p>
                    We actively welcome differences in race, ethnicity, sexual orientation, gender identity, physical appearance, age, ability, and dance experience. Inclusion is a core value of our community. We do not tolerate behaviour rooted in hate, discrimination, harassment or threats of any kind. Any situation which makes another person feel unsafe or uncomfortable to the point of being unable to enjoy the class/event is unacceptable and can be considered harassment. Persistent and unwelcome attention is also considered harassment and will be treated as such. If you harass or threaten someone, you will be asked to leave.
                  </p>
                  
                  <p>
                    We practice role freedom and curiosity. Lead and follow are choices, not gendered roles, and dancers are welcome to explore across roles with mutual respect. We value dancing across experience levels, seeing it as part of learning, sharing, and growing a connected community.
                  </p>
                  
                  <p>
                    Care on the dance floor requires awareness and responsibility. This includes being mindful of those around you, apologising if you bump into or hurt someone, and adjusting your behaviour when needed. It also means recognising that everyone has different comfort levels, and that those boundaries should be respected at all times.
                  </p>
                  
                  <p>
                    Care also includes how we use our words. Feedback and advice are part of learning when they are invited. If you have something to share about someone&apos;s dancing, ask first if they would like to hear it. Our teachers are there to offer guidance and supported learning, and we trust that process.
                  </p>
                </div>
              </details>

              {/* Consent Dropdown */}
              <details className="bg-white rounded-xl p-4 md:p-6 mb-4 shadow-sm group [&>summary::-webkit-details-marker]:hidden [&>summary::marker]:hidden">
                <summary className="font-spartan font-semibold text-lg md:text-xl cursor-pointer hover:text-pink-accent transition-colors list-none flex items-center gap-2">
                  <svg className="w-5 h-5 fill-pink-accent transition-transform group-open:rotate-90" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                  Consent looks like
                </summary>
                
                <div className="mt-4 space-y-4 text-base leading-relaxed">
                  <p>
                    Consent means asking before dancing with anyone, and accepting a "no" with grace and without pressure. A refusal is not an invitation to persuade, joke, negotiate, or revisit later.
                  </p>
                  
                  <p>
                    Consent also means listening to verbal and non-verbal cues, respecting personal boundaries, and understanding that anyone can change their mind at any time.
                  </p>
                  
                  <p>
                    Consent is contextual. Just because someone dances a certain way with one person does not mean they want the same with someone else. If you are unsure, ask. If someone asks you to stop, whether verbally or through body language, stop. If you are uncomfortable with someone&apos;s behaviour, then politely inform them if it feels safe enough to do so. Requests made for personal comfort or safety are part of consent and mutual care, not criticism.
                  </p>
                  
                  <p>
                    Please also be mindful that alcohol or other substances can make it harder to read boundaries accurately. Knowing your limits helps you respect others.
                  </p>
                </div>
              </details>

              {/* Looking Out Dropdown */}
              <details className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm group [&>summary::-webkit-details-marker]:hidden [&>summary::marker]:hidden">
                <summary className="font-spartan font-semibold text-lg md:text-xl cursor-pointer hover:text-pink-accent transition-colors list-none flex items-center gap-2">
                  <svg className="w-5 h-5 fill-pink-accent transition-transform group-open:rotate-90" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                  </svg>
                  Looking out for each other
                </summary>
                
                <div className="mt-4 space-y-4 text-base leading-relaxed">
                  <p>
                    Care and consent are a shared responsibility. If you are unsure whether someone is okay, check in. This might look like asking them if they need help, or inviting them to dance to create space.
                  </p>
                  
                  <p>
                    If you experience or witness behaviour that goes against our principles of care or consent, whether on or off the dance floor, you are encouraged to reach out to a member of the core team or teaching team, or contact us privately through our official channels (<a href="https://westcoastswing.co.za/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">website</a>, <a href="https://www.instagram.com/wcscapetown/?hl=en" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">instagram</a> or <a href="mailto:community@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline">community@wcscapetown.co.za</a>).
                  </p>
                  
                  <p>
                    Concerns may be addressed in the moment, or followed up privately, depending on what feels most appropriate and safe. Our approach is grounded in conversation and clarity. Sometimes harm comes from misunderstanding, and we are open to addressing that with care.
                  </p>
                  
                  <p>
                    However, if someone repeatedly or intentionally ignores boundaries or causes discomfort, they may be asked to stop certain behaviours or to refrain from returning, in order to protect the wellbeing of the community.
                  </p>
                    <p>
                    We are grateful for everyone&apos;s care, attention, and commitment to making this a space where all can feel safe, respected, and welcome.
                  </p>
                  
                </div>
              </details>
            <p className="text-sm text-text-dark/70 italic text-center">
              This policy was created by West Coast Swing Cape Town in 2026, informed by the international standards of the <a href="https://www.worldsdc.com/code-of-conduct/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">World Swing Dance Council</a> and adapted from code of conduct policies developed by WCS communities including <a href="https://www.asiawcsopen.com/code-of-conduct/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">Asia West Coast Swing Open</a>, and <a href="https://www.nycswings.net/wcs-code-of-conduct/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">NYC Swings</a>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
