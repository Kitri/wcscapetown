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
                    Ask before you dance, respect a "no". Read the room and the person. When in doubt, ask.
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
                Let's dance, connect, and keep this space joyful for everyone.
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
              We're Here to Listen
            </h3>
            <p className="text-base md:text-lg leading-relaxed mb-4">
              If something doesn't feel right, or you experience or witness behaviour that goes against our values:
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
            <div className="bg-white rounded-xl p-4 md:p-6 mb-4 shadow-sm">
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mb-4">
                Care looks like
              </h3>
                
              <ul className="space-y-3 text-base leading-relaxed list-disc pl-6">
                  <li>
                    We actively welcome differences in race, ethnicity, sexual orientation, gender identity, physical appearance, age, ability, and dance experience. <strong>Inclusion is a core value of our community</strong>. We <strong> do not tolerate </strong> behaviour rooted in <strong> hate, discrimination, harassment or threats </strong> of any kind. Any situation which makes another person feel unsafe or uncomfortable to the point of being unable to enjoy the class/event is unacceptable and can be considered harassment. Persistent and unwelcome attention is also considered harassment and will be treated as such. <strong> If you harass or threaten someone, you will be asked to leave.</strong>
                  </li>
                  
                  <li>
                    We practice <strong> role freedom and curiosity</strong>. Lead and follow are choices, <strong>not gendered</strong> roles, and dancers are welcome to explore across roles with mutual respect. We <strong> value dancing across experience levels </strong>, seeing it as part of learning, sharing, and growing a connected community.
                  </li>
                  
                  <li>
                    <strong> Care</strong> on the dance floor <strong>requires awareness and responsibility</strong>. This includes being mindful of those around you, apologising if you bump into or hurt someone, and adjusting your behaviour when needed. It also means <strong>recognising</strong> that everyone has <strong>different comfort levels</strong>, and that those <strong>boundaries should be respected </strong> at all times.
                  </li>
                  
                  <li>
                    Care also includes how we use our words. <strong> Feedback and advice </strong> are part of learning <strong> when they are invited</strong> . If you have something to share about someone&apos;s dancing, <strong>ask first </strong> if they would like to hear it. Our teachers are there to offer guidance and supported learning, and we trust that process.
                  </li>
              </ul>
            </div>

            {/* Consent Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 mb-4 shadow-sm">
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mb-4">
                Consent looks like
              </h3>
                
              <ul className="space-y-3 text-base leading-relaxed list-disc pl-6">
                  <li>
                    Consent means <strong>asking before dancing with anyone </strong>, and <strong> accepting a "no" with grace and without pressure</strong>. A refusal is not an invitation to persuade, joke, negotiate, or revisit later.
                  </li>
                  
                  <li>
                    Consent also means listening to <strong>verbal and non-verbal cues</strong>, <strong>respecting personal boundaries </strong>, and understanding that <strong>anyone can change their mind</strong> at any time.
                  </li>
                  
                  <li>
                    <strong>Consent is contextual</strong>. Just because someone dances a certain way with one person does not mean they want the same with someone else. <strong>If you are unsure, ask</strong>. If someone asks you to stop, whether verbally or through body language, stop. If you are uncomfortable with someone&apos;s behaviour, then politely inform them if it feels safe enough to do so. Requests made for <strong>personal comfort or safety</strong> are part of <strong>consent and mutual care</strong>, not criticism.
                  </li>
                  
                  <li>
                    Please also be mindful that <strong>alcohol</strong> or other substances can make it <strong>harder to read boundaries</strong> accurately. Knowing your limits helps you <strong>respect others</strong>.
                  </li>
              </ul>
            </div>

            {/* Looking Out Section */}
            <div className="bg-white rounded-xl p-4 md:p-6 mb-6 shadow-sm">
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mb-4">
                Looking out for each other
              </h3>
                
              <ul className="space-y-3 text-base leading-relaxed list-disc pl-6">
                  <li>
                    <strong>Care and consent are a shared responsibility</strong>. If you are unsure whether someone is okay, <strong>check in</strong>. This might look like asking them if they need help, or inviting them to dance to create space.
                  </li>
                  
                  <li>
                    If you experience or <strong>witness behaviour </strong> that goes <strong>against our principles</strong> of care or consent, whether on or off the dance floor, you are encouraged to <strong>reach out to our community organisers or teaching team</strong>, or contact us privately through our official channels (<a href="https://www.instagram.com/wcscapetown/?hl=en" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">instagram</a> or <a href="mailto:community@wcscapetown.co.za" className="text-pink-accent hover:text-yellow-accent underline">community@wcscapetown.co.za</a>).
                  </li>
                  
                  <li>
                    <strong>Concerns</strong> may be addressed <strong>in the moment, or followed up privately</strong>, depending on what feels most appropriate and safe. Our approach is grounded in <strong>conversation and clarity</strong>. Sometimes <strong>harm</strong> comes from <strong>misunderstanding</strong>, and we are open to <strong>addressing that with care</strong>.
                  </li>
                  
                  <li>
                    However, if someone <strong>repeatedly or intentionally ignores boundaries or causes discomfort</strong>, they may be <strong>asked to stop</strong> certain behaviours <strong>or to refrain from returning</strong>, in order to protect the wellbeing of the community.
                  </li>
                  
                  <li>
                    <strong>We are grateful for everyone&apos;s care, attention, and commitment to making this a space where all can feel safe, respected, and welcome</strong>.
                  </li>
              </ul>
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
