import Header from "@/components/Header";

export default function AboutUs() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section - Cloud Dancer */}
        <section className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] mb-8">
              About Us
            </h1>

            {/* Who We Are */}
            <div className="text-base md:text-lg leading-relaxed">
              <p>
                West Coast Swing Cape Town is a small but growing WCS community aimed at spreading WCS across Cape Town. It is led by a small, passionate group of volunteers completely hooked on WCS, spending hours every week deep-diving into the intricacies of this dance.
              </p>
            </div>
          </div>
        </section>

        {/* Community Organisers - Yellow */}
        <section 
          className="px-[5%] py-[40px] md:py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] text-center mb-6">
              Community Organisers
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-center mb-8">
              The community is led by a team of volunteers covering different portfolios in order to run and grow the community. Read our <a href="/files/WCS CT Community Constitution.pdf" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">constitution</a>.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-[700px] mx-auto text-base md:text-lg leading-relaxed mb-6">
              <div>
                <p className="mb-2"><strong>Mercia</strong> - Chairperson</p>
                <p className="mb-2"><strong>Michael E</strong> - Treasurer / Finance</p>
                <p className="mb-2"><strong>Monique</strong> - Secretary / Admin</p>
              </div>
              <div>
                <p className="mb-2"><strong>Tim</strong> - Teaching</p>
                <p className="mb-2"><strong>Jayne</strong> - Marketing</p>
                <p className="mb-2"><strong>Michael R</strong> - Music</p>
                <p className="mb-2"><strong>Liam</strong> - Events</p>
              </div>
            </div>
            
            <p className="text-center text-sm italic text-text-dark/70 mt-6">
              Website updates in progress, more details coming soon.
            </p>
          </div>
        </section>

        {/* Teachers - Cloud Dancer */}
        <section className="px-[5%] py-[40px] md:py-[50px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] text-center mb-6">
              Teaching Team
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-center mb-8">
              All our teachers lead and follow, and can teach both roles at their level.
            </p>
            
            <div className="text-base md:text-lg leading-relaxed max-w-[700px] mx-auto">
              <h3 className="font-spartan font-semibold text-xl mb-3">Lead Teachers</h3>
              <p className="mb-6">Mercia, Tim</p>
              
              <h3 className="font-spartan font-semibold text-xl mb-3">Level 2 Teachers</h3>
              <p className="text-sm text-text-dark/70 mb-2">(Also teaches Level 1)</p>
              <p className="mb-6">Mercia, Tim, Michael E</p>
              
              <h3 className="font-spartan font-semibold text-xl mb-3">Level 1 Teachers</h3>
              <p>Liam, Michael R, James, Elaine, Monique, Priyanka, Victoria</p>
            </div>
            
            <p className="text-center text-sm italic text-text-dark/70 mt-8">
              Website updates in progress, more details coming soon.
            </p>
          </div>
        </section>
        {/* Our Story - Yellow */}
        <section 
          className="px-[5%] py-[40px] md:py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] text-center mb-8">
              Our Story
            </h2>
            <div className="text-base md:text-lg leading-relaxed space-y-6">
              <p className="italic text-center">
                Ten dancers in a living room, learning a dance we&apos;d only seen online - until the global WCS community helped us find our way.
              </p>
              
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mt-8 mb-4">The Living Room Era</h3>
              <p>
                In 2023, there were about ten of us scattered across Cape Town, each playing with West Coast Swing alone. Some had stumbled across Doug Silton&apos;s videos from a fundraiser workshop he&apos;d done for the Lindy Hop community. Others had caught glimpses of the dance at international festivals. All of us felt the same pull - this dance was different. No rigid syllabus, no choreography, just connection and music and improvisation.
              </p>
              <p>
                We all wanted to learn it. We all wanted others to learn it with.
              </p>
              <p>
                One of those dancers, Marcella, decided to do something about it. She gathered us together in her living room. Ten people who&apos;d been trying to figure this out solo, suddenly in the same space, attempting our first sugar pushes together.
              </p>
              <p>
                Those early months were gloriously chaotic. We were trying to figure out where to even start. We had Doug&apos;s intensive videos as our main reference point, plus knowledge from a few international festivals. Each week, someone would volunteer to find content and bring it back to teach the group. One week we&apos;d work on sugar pushes. The next, someone would find a video on accelerations and decelerations. Then hitch rhythms. Then delayed timing.
              </p>
              <p>
                We had no idea we were skipping foundational technique. We didn&apos;t know concepts like &quot;delayed weight transfer&quot; or &quot;rolling through the feet&quot; or &quot;critical timing&quot; existed yet. We were just dancing, experimenting, trying things, seeing what felt right.
              </p>
              <p>
                The living room sessions became weekly, then twice-weekly. Marcella kept us organised - budgets, schedules, websites, vision-setting, all the unglamorous work that turns a group of enthusiasts into an actual community. She secured us a proper dance space at Havana Nights. Slowly, we were becoming something real.
              </p>
              <p>
                What kept us going through those months of fumbling in the dark? Honestly, it was the shared obsession. When you find people who are just as fascinated by connection quality and musical interpretation as you are, who will spend hours debating whether that felt right, who show up week after week even when progress feels impossibly slow - you keep showing up too.
              </p>
              
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mt-8 mb-4">Safari Swing 2024: Everything Changed</h3>
              <p>
                In September 2024, Safari Swing happened in Johannesburg - South Africa&apos;s first international West Coast Swing event. One of our community leads went to the full weekender. Two others attended the workshops offered to locals the day before.
              </p>
              <p>
                Spending time with the international WCS community was life-changing. Not just for the dancing, but for understanding what this dance could become here. We learned from world-class instructors, danced with people who&apos;d been doing WCS for decades, and - perhaps most importantly - connected with the growing Johannesburg WCS community.
              </p>
              <p>
                That event lit a fire. Both in us and in the JHB dancers. Suddenly we weren&apos;t isolated pockets of people trying to figure this out alone - we were part of something bigger.
              </p>
              
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mt-8 mb-4">Lauren & Daniel in Johannesburg</h3>
              <p>
                Shortly after Safari Swing, the event director Jamie made something else happen: <a href="https://dancestudio.five6seven8.co.za/west-coast-swing-is-finding-its-rhythm-in-south-africa-and-this-is-just-the-beginning/" target="_blank" rel="noopener noreferrer" className="text-pink-accent hover:text-yellow-accent underline">Lauren and Daniel came to Johannesburg</a>.
              </p>
              <p>
                Two of our community leads drove up for the weekend. We had private lessons with both Lauren and Daniel, attended every workshop, absorbed everything we could. For the first time, we got feedback. Someone watching us dance and saying &quot;yes, that&apos;s roughly right&quot; or &quot;try this instead&quot; - you don&apos;t realize how valuable that is until you&apos;ve spent months learning in a vacuum.
              </p>
              <p>
                We came back to Cape Town with notebooks full of concepts, videos on our phones, and finally - finally - some structure for how to teach this dance we loved.
              </p>
              
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mt-8 mb-4">Harold Baker: Two Weeks That Changed Everything</h3>
              <p>
                At Safari Swing, we&apos;d joked with Harold Baker about visiting Cape Town. &quot;You should come teach us!&quot; we said, half-serious.
              </p>
              <p>
                He came.
              </p>
              <p>
                December 2024, Harold spent two weeks with our community. What started as a casual &quot;maybe I&apos;ll visit&quot; turned into an intense, transformative experience. He ran teacher training sessions for our teaching team, taught hours of workshops, gave one-on-one coaching, and poured his heart into helping us understand this dance at a deeper level.
              </p>
              <p>
                Those two weeks set us up for 2025. Not just with techniques and patterns, but with the language of West Coast Swing. How to break down the concepts that seemed ineffable. How different teachers can approach the same principle differently, and that&apos;s okay. How to help students find what works for their bodies.
              </p>
              
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mt-8 mb-4">Where We Are Now</h3>
              <p>
                We&apos;re still learning. We&apos;ll always be learning - that&apos;s part of what makes WCS beautiful.
              </p>
              <p>
                Our small living room group has grown into a community. We teach classes on Monday nights in Plumstead. We hold socials where we dance together, test new concepts, and yes, still pause mid-dance to debate technique. We have a teaching team that spends hours every week studying workshop videos, refining our understanding, figuring out how to share what we&apos;re learning.
              </p>
              <p>
                We&apos;re not professional WCS instructors. We don&apos;t claim to be. We&apos;re a group of people who fell in love with this dance and are doing our best to learn it properly, so we can share it with anyone else in Cape Town who feels that same pull.
              </p>
              <p>
                The journey has been hard. Learning WCS remotely, without local experts, trying to piece together a cohesive understanding from scattered online content - it&apos;s been overwhelming at times. But it&apos;s also been wonderful. Every small breakthrough feels earned. Every new dancer who joins and gets that spark in their eyes reminds us why we started.
              </p>
              
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mt-8 mb-4">What We&apos;re Building</h3>
              <p>
                We&apos;re building what we wished existed when we started: a community in Cape Town where you can learn West Coast Swing, where you don&apos;t have to figure it out alone in your living room, where you can ask &quot;what does elastic mean?&quot; and get answers from people who&apos;ve spent months wrestling with that same question.
              </p>
              <p>
                We&apos;re learning together. Growing together. Sometimes stumbling, often questioning, always dancing.
              </p>
              <p>
                If you&apos;re curious about WCS, come find us. We&apos;re still a small community, still figuring things out, still spending way too much time analyzing connection quality and debating rolling counts. But we&apos;d love to have you along for the journey.
              </p>
              
              <p className="text-sm text-text-dark/70 italic mt-8">
                West Coast Swing Cape Town is led by volunteers who are passionate about learning and sharing this dance. We&apos;re grateful to Safari Swing, Jamie, Lauren, Daniel, Harold, the Johannesburg community, and the countless international WCS dancers who&apos;ve encouraged us, shared advice, and cheered us on from afar over these past two years. You&apos;ve shown us what this dance community is all about.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
