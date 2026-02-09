import Header from "@/components/Header";
import VideoGallery from "@/components/VideoGallery";
import Image from "next/image";

const WEEKENDER_SOLD_OUT = {
  nowWeekend: false,
  nowNowWeekend: false,
  nowNowDay: false,
  justNowWeekend: false,
  justNowDay: false,
  aiTogWeekend: false,
  aiTogDay: false,
  partyPass: false,
  spotlightCritique: false,
} as const;

function PriceCell({
  price,
  isSoldOut,
}: {
  price: number | null;
  isSoldOut: boolean;
}) {
  if (price === null) {
    return <span className="text-text-dark/40">—</span>;
  }

  if (isSoldOut) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-text-dark/40 line-through">
          R{price.toLocaleString("en-ZA")}
        </span>
        <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
          SOLD OUT
        </span>
      </div>
    );
  }

  return <span className="font-semibold">R{price.toLocaleString("en-ZA")}</span>;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Weekender() {
  const soldOut = WEEKENDER_SOLD_OUT;

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-black text-white">
          <div className="relative w-full pb-[36.33%]">
            <Image
              src="/images/pros/banner_subtext.jpg"
              alt="West Coast Swing Weekender banner"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="px-[5%] py-10 text-center">
            <p className="text-2xl md:text-4xl font-semibold mb-2">March 20–22, 2026</p>
            <p className="text-yellow-accent font-semibold text-lg md:text-xl">
              Bookings open 19 Feb
            </p>
            <p className="text-sm text-white/80 mt-3">
              The first 10 Weekend Pass tickets at the “Now” price are available for 24 hours only.
            </p>
          </div>

        </section>

        <div className="relative">
          <input
            id="weekender-tab-passes"
            type="radio"
            name="weekender-tab"
            className="peer/passes sr-only"
            defaultChecked
          />
          <input
            id="weekender-tab-pros"
            type="radio"
            name="weekender-tab"
            className="peer/pros sr-only"
          />
          <input
            id="weekender-tab-schedule"
            type="radio"
            name="weekender-tab"
            className="peer/schedule sr-only"
          />

          {/* Sticky tab bar */}
          <div
            className="sticky top-[90px] z-[900] bg-black text-white border-b border-white/10
              peer-checked/passes:[&_.tab-passes]:bg-white/15 peer-checked/passes:[&_.tab-passes]:border-yellow-accent peer-checked/passes:[&_.tab-passes]:text-white
              peer-checked/pros:[&_.tab-pros]:bg-white/15 peer-checked/pros:[&_.tab-pros]:border-yellow-accent peer-checked/pros:[&_.tab-pros]:text-white
              peer-checked/schedule:[&_.tab-schedule]:bg-white/15 peer-checked/schedule:[&_.tab-schedule]:border-yellow-accent peer-checked/schedule:[&_.tab-schedule]:text-white"
          >
            <div className="px-[5%] py-3 max-w-[1200px] mx-auto">
              <div className="grid grid-cols-3 gap-2">
                <label
                  htmlFor="weekender-tab-pros"
                  className="tab-pros cursor-pointer select-none inline-flex items-center justify-center rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold border-2 border-pink-accent/80 text-white/90 hover:bg-white/15 hover:border-yellow-accent transition-colors"
                >
                  <span className="sm:hidden">Pros</span>
                  <span className="hidden sm:inline">Meet our pros</span>
                </label>
                <label
                  htmlFor="weekender-tab-schedule"
                  className="tab-schedule cursor-pointer select-none inline-flex items-center justify-center rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold border-2 border-pink-accent/80 text-white/90 hover:bg-white/15 hover:border-yellow-accent transition-colors"
                >
                  <span className="sm:hidden">Schedule</span>
                  <span className="hidden sm:inline">Preliminary schedule</span>
                </label>
                <label
                  htmlFor="weekender-tab-passes"
                  className="tab-passes cursor-pointer select-none inline-flex items-center justify-center rounded-full bg-white/10 px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold border-2 border-pink-accent/80 text-white/90 hover:bg-white/15 hover:border-yellow-accent transition-colors"
                >
                  <span className="sm:hidden">Passes</span>
                  <span className="hidden sm:inline">Pass options</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tab panels */}
          <div
            className="peer-checked/pros:[&_.panel-pros]:block peer-checked/passes:[&_.panel-passes]:block peer-checked/schedule:[&_.panel-schedule]:block"
          >
            <div className="panel-pros hidden">

        {/* Meet Your Pros */}
        <section id="pros" className="px-[5%] py-[60px] bg-white scroll-mt-20">
          <div className="w-full mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Meet Your Pros
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-12">
              Four world-class instructors from around the globe
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Igor & Fernanda */}
              <div className="bg-cloud-dancer rounded-2xl overflow-hidden border-2 border-text-dark/10 lg:flex">
                <div className="relative w-full pb-[125%] lg:pb-0 lg:w-[220px] lg:h-[220px] lg:flex-shrink-0">
                  <Image
                    src="/images/pros/Igor_Fernanda2.jpg"
                    alt="Igor Pitangui & Fernanda Dubiel"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 lg:flex-1">
                  <h3 className="font-spartan font-semibold text-xl text-text-dark mb-1">
                    Igor Pitangui & Fernanda Dubiel
                  </h3>
                  <p className="text-sm text-text-dark/70">🇧🇷 Brazil</p>
                  <a
                    href="https://www.instagram.com/igorandfernanda/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-pink-accent hover:text-yellow-accent underline"
                    aria-label="Instagram: @igorandfernanda"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    @igorandfernanda
                  </a>
                </div>
              </div>

              {/* Harold */}
              <div className="bg-cloud-dancer rounded-2xl overflow-hidden border-2 border-text-dark/10 lg:flex">
                <div className="relative w-full pb-[125%] lg:pb-0 lg:w-[220px] lg:h-[220px] lg:flex-shrink-0">
                  <Image
                    src="/images/pros/harold.jpg"
                    alt="Harold Baker"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 lg:flex-1">
                  <h3 className="font-spartan font-semibold text-xl text-text-dark mb-1">Harold Baker</h3>
                  <p className="text-sm text-text-dark/70">🇬🇧 United Kingdom</p>
                  <a
                    href="https://www.instagram.com/harold_baker_dance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-pink-accent hover:text-yellow-accent underline"
                    aria-label="Instagram: @harold_baker_dance"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    @harold_baker_dance
                  </a>
                </div>
              </div>

              {/* Kristen */}
              <div className="bg-cloud-dancer rounded-2xl overflow-hidden border-2 border-text-dark/10 lg:flex">
                <div className="relative w-full pb-[125%] lg:pb-0 lg:w-[220px] lg:h-[220px] lg:flex-shrink-0">
                  <Image
                    src="/images/pros/kristen.jpg"
                    alt="Kristen Wallace"
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 lg:flex-1">
                  <h3 className="font-spartan font-semibold text-xl text-text-dark mb-1">Kristen Wallace</h3>
                  <p className="text-sm text-text-dark/70">🇺🇸 United States</p>
                  <a
                    href="https://www.instagram.com/kwalla.bear"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-pink-accent hover:text-yellow-accent underline"
                    aria-label="Instagram: @kwalla.bear"
                  >
                    <InstagramIcon className="h-4 w-4" />
                    @kwalla.bear
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Videos */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Watch the Pros
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-12 max-w-[800px] mx-auto">
              Click any video to watch it larger.
            </p>

            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl mb-6 text-pink-accent">
                Jack & Jill / Social rounds
              </h3>
              <VideoGallery
                videos={[
                  {
                    label: "Fernanda: All Star Jack & Jill — UK WCS Championships 2025",
                    note: "Partner: Za Thomaier",
                    url: "https://youtu.be/k7XcWgNrAFc?si=qyJvWy4B8kFz_tx-",
                  },
                  {
                    label: "Harold: All Star Jack & Jill — Swingsation 2025",
                    note: "Partner: Maddy Skinner (start at 00:18)",
                    url: "https://youtu.be/FR6q9AJWKrY?si=G31AAub-PBkgebhO&t=18",
                  },
                  {
                    label: "Kristen: All Star Jack & Jill — Wild Wild Westie (W3) 2025",
                    note: "Partner: Keerigan Rudd (start at 00:16)",
                    url: "https://youtu.be/iqXJ9iz3fg8?si=7e4utqwP6pQUF5G1&t=16",
                  },
                  {
                    label: "Igor (Lead): All Star/Champions Strictly — Bavarian Open 2025",
                    note: "Partner: Savana Barreau",
                    url: "https://youtu.be/M5tz_9ECBTw?si=6XjwDu8TWsoox5-P",
                  },
                  {
                    label: "Igor (Follow): Strictly Open — Budafest 2026",
                    note: "Partner: Léo Lorenzo (start at 00:15)",
                    url: "https://youtu.be/qL9gECRyhgY?si=tAszCLtqfn10ojhx&t=15",
                  },
                ]}
              />
            </div>

            <div>
              <h3 className="font-spartan font-semibold text-2xl mb-6 text-pink-accent">Routines & Showcases</h3>
              <VideoGallery
                videos={[
                  {
                    label: "Kristen Wallace — showcase",
                    url: "https://youtu.be/Z76ybrXpnSw?si=vOjXixCE7BibMKoH",
                    note: "Rising Star showcase winner — US Open 2025",
                  },
                  {
                    label: "Igor & Fernanda — routine",
                    url: "https://youtu.be/40yvzp4IGE8?si=4XD5SpkzjJ3i8ILT",
                  },
                  {
                    label: "Harold Baker — Cardio Cameraman",
                    url: "https://www.instagram.com/p/DIqQi2LBhCp/",
                    note: "A little taste of Harold’s other talents.",
                    thumbnailUrl: "/images/pros/harold5_for_fun.jpg",
                  },
                ]}
              />
            </div>

            <div className="mt-12 bg-cloud-dancer rounded-xl p-6 md:p-8 border-2 border-text-dark/10">
              <h3 className="font-spartan font-semibold text-xl mb-2">
                How do WCS international competitions and levels work — and what do these video titles mean?
              </h3>
              <p className="text-sm text-text-dark/80">
                The “levels” (divisions) you see in competition titles are usually based on World Swing Dance Council (WSDC)
                competition points. The full system is complex, but the idea is simple: place well in a division, earn points in
                that division, and once you&apos;ve earned enough points you can move up. Points reset per division — so someone can
                have lots of All Star points and only a few Champions points.
              </p>
              <p className="text-sm text-text-dark/80 mt-4">
                Typical progression: <span className="font-semibold">Newcomer → Novice → Intermediate → Advanced → All Star → Champions</span>
              </p>
              <p className="text-sm text-text-dark/80 mt-4">
                Common competition types:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-text-dark/80">
                <li>
                  <span className="font-semibold">Jack &amp; Jill</span>: random partner, random song — you enter as a lead or follow in your eligible division.
                </li>
                <li>
                  <span className="font-semibold">Strictly</span>: chosen partner, random song — you enter together (division rules vary per event).
                </li>
                <li>
                  <span className="font-semibold">Open</span>: open to multiple divisions (can be Jack &amp; Jill or Strictly).
                </li>
                <li>
                  <span className="font-semibold">Showcase / Routine</span>: choreographed dances (often Classic vs Showcase), with different rules around lifts.
                </li>
              </ul>
              <p className="text-sm text-text-dark/80 mt-4">
                You can look up any dancer&apos;s points and division eligibility on the WSDC registry:
                {" "}
                <a
                  href="https://www.worldsdc.com/registry-points/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-accent hover:text-yellow-accent underline font-semibold"
                >
                  worldsdc.com/registry-points
                </a>
              </p>
            </div>
          </div>
        </section>
            </div>

            <div className="panel-passes hidden">

        {/* Pass options */}
        <section id="passes" className="px-[5%] py-[60px] bg-cloud-dancer scroll-mt-20">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Pass Options
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-10 max-w-[850px] mx-auto">
              Bookings open <span className="font-semibold">Wednesday 19 February 2026</span>. Book and pay on this website.
            </p>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Weekend Pass */}
              <div className="bg-white rounded-xl border-2 border-text-dark/10 overflow-hidden">
                <div className="p-5 bg-pink-accent/10">
                  <h3 className="font-spartan font-semibold text-xl">Weekend Pass</h3>
                  <p className="text-xs text-text-dark/70 mt-1">Best value for the full weekend experience</p>
                </div>
                <div className="p-5">
                  <ul className="text-sm text-text-dark/80 space-y-2 mb-4">
                    <li>✓ Friday pre-party</li>
                    <li>✓ All workshops (Sat + Sun)</li>
                    <li>✓ Community lunch (Saturday)</li>
                    <li>✓ All evening parties (Fri + Sat + Sun)</li>
                  </ul>

                  <div className="text-sm">
                    <div className="flex items-center justify-between py-1 border-t border-text-dark/10">
                      <span className="font-semibold">Now</span>
                      <PriceCell price={1600} isSoldOut={soldOut.nowWeekend} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">
                      Literally right now, urgent, grab it immediately
                    </p>
                    <p className="text-xs text-text-dark/60">First 10 tickets • 24 hours • opens 19 Feb</p>

                    <div className="flex items-center justify-between py-2 border-t border-text-dark/10 mt-2">
                      <span className="font-semibold">Now-now</span>
                      <PriceCell price={1800} isSoldOut={soldOut.nowNowWeekend} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">Classic SA “soonish but not really now”</p>
                    <p className="text-xs text-text-dark/60">
                      Limited tickets • until sold out or 8 March (whichever comes first)
                    </p>

                    <div className="flex items-center justify-between py-2 border-t border-text-dark/10 mt-2">
                      <span className="font-semibold">Just-now</span>
                      <PriceCell price={2200} isSoldOut={soldOut.justNowWeekend} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">
                      The famous “eventually, maybe later today, who knows”
                    </p>
                    <p className="text-xs text-text-dark/60">Until sold out</p>

                    <div className="flex items-center justify-between py-2 border-t border-text-dark/10 mt-2">
                      <span className="font-semibold">Ai tog</span>
                      <PriceCell price={2400} isSoldOut={soldOut.aiTogWeekend} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">
                      “Ai-tog, I should&apos;ve bought earlier” • on the day
                    </p>
                  </div>
                </div>
              </div>

              {/* Day Pass */}
              <div className="bg-white rounded-xl border-2 border-text-dark/10 overflow-hidden">
                <div className="p-5 bg-purple-accent/10">
                  <h3 className="font-spartan font-semibold text-xl">Day Pass</h3>
                  <p className="text-xs text-text-dark/70 mt-1">Choose Saturday or Sunday</p>
                </div>
                <div className="p-5">
                  <ul className="text-sm text-text-dark/80 space-y-2 mb-4">
                    <li>✓ Workshops (one day)</li>
                    <li>✓ Community lunch (Saturday only)</li>
                    <li>✓ Party for your day</li>
                    <li className="text-text-dark/60">+ Friday pre-party add-on (R200)</li>
                  </ul>

                  <div className="text-sm">
                    <div className="flex items-center justify-between py-2 border-t border-text-dark/10">
                      <span className="font-semibold">Now-now</span>
                      <PriceCell price={1000} isSoldOut={soldOut.nowNowDay} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">Classic SA “soonish but not really now”</p>
                    <p className="text-xs text-text-dark/60">
                      Limited tickets • until sold out or 8 March (whichever comes first)
                    </p>

                    <div className="flex items-center justify-between py-2 border-t border-text-dark/10 mt-2">
                      <span className="font-semibold">Just-now</span>
                      <PriceCell price={1200} isSoldOut={soldOut.justNowDay} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">
                      The famous “eventually, maybe later today, who knows”
                    </p>
                    <p className="text-xs text-text-dark/60">Until sold out</p>

                    <div className="flex items-center justify-between py-2 border-t border-text-dark/10 mt-2">
                      <span className="font-semibold">Ai tog</span>
                      <PriceCell price={1400} isSoldOut={soldOut.aiTogDay} />
                    </div>
                    <p className="text-xs text-text-dark/60 mt-1">
                      “Ai-tog, I should&apos;ve bought earlier” • on the day
                    </p>
                  </div>
                </div>
              </div>

              {/* Party Pass */}
              <div className="bg-white rounded-xl border-2 border-text-dark/10 overflow-hidden">
                <div className="p-5 bg-yellow-accent/10">
                  <h3 className="font-spartan font-semibold text-xl">Party Pass</h3>
                  <p className="text-xs text-text-dark/70 mt-1">Parties only (no workshops)</p>
                </div>
                <div className="p-5">
                  <ul className="text-sm text-text-dark/80 space-y-2 mb-4">
                    <li>✓ Friday pre-party</li>
                    <li>✓ Saturday night party</li>
                    <li>✓ Sunday night party</li>
                  </ul>

                  <div className="flex items-center justify-between py-2 border-t border-text-dark/10">
                    <span className="font-semibold">Price</span>
                    <PriceCell price={800} isSoldOut={soldOut.partyPass} />
                  </div>
                  <p className="text-xs text-text-dark/60 mt-1">Static price (not linked to tiers)</p>
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white rounded-xl p-6 md:p-8 border-2 border-yellow-accent/30">
              <h3 className="font-spartan font-semibold text-2xl mb-2 text-pink-accent">Spotlight Critique (Add-on)</h3>
              <p className="text-text-dark/80">
                R300 per couple • limited to 8 couples • optional add-on (not included in any pass).
              </p>
              <p className="text-sm text-text-dark/70 mt-3">
                Spotlight Critique is a coached “mini performance” where you dance a short round and get direct feedback on what
                to keep, what to adjust, and what to focus on next.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-text-dark/70">
                  Runs during the dedicated Saturday slot (only if at least 6 couples sign up).
                </p>
                <div className="text-lg">
                  <span className="text-text-dark/70 mr-2">Price:</span>
                  <PriceCell price={300} isSoldOut={soldOut.spotlightCritique} />
                </div>
              </div>
            </div>

            <div className="mt-10 bg-white rounded-xl p-6 md:p-8 border-2 border-text-dark/10">
              <h3 className="font-spartan font-semibold text-xl mb-3 text-pink-accent">Before you book</h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-text-dark/80">
                <li>
                  We may balance numbers by <span className="font-semibold">role</span> within each level. If a role fills up,
                  we&apos;ll add a waitlist for that role.
                </li>
                <li>Private lessons are available (limited slots).</li>
                <li>
                  Limited sponsorship / financial assistance may be available. If cost is a barrier, let us know and we&apos;ll do our
                  best to help.
                </li>
              </ul>
              <p className="text-sm text-text-dark/70 mt-4 font-semibold">
                Email weekender@wcscapetown.co.za for any queries
              </p>
            </div>

            <p className="text-sm text-text-dark/60 mt-4 text-center">
              Prices are in ZAR. Availability is limited — if a tier sells out, the next tier applies.
            </p>
          </div>
        </section>
            </div>

            <div className="panel-schedule hidden">

        {/* Schedule */}
        <section id="schedule" className="px-[5%] py-[60px] bg-white scroll-mt-20">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Weekend Schedule
            </h2>
            <p className="text-center text-sm md:text-base text-text-dark/70 mb-12 max-w-[900px] mx-auto">
              Preliminary schedule — exact details may still change.
            </p>

            {/* Friday */}
            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl md:text-3xl mb-6 text-pink-accent">
                Friday, March 20
              </h3>
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="text-lg font-semibold text-text-dark/70 min-w-[100px]">19:30-23:00</div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Pre-party & Meet the Pros</p>
                    <p className="text-text-dark/70">Kick off the weekend, say hi to the pros, and get in some relaxed social dancing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Saturday */}
            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl md:text-3xl mb-2 text-pink-accent">
                Saturday, March 21 — Technique & Connection
              </h3>
              <p className="text-sm md:text-base text-text-dark/70 mb-6">
                Highly recommended to build and solidify technique & connection on Saturday before Sunday&apos;s fun & style focus.
              </p>

              <div className="bg-cloud-dancer rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3 mb-2 font-semibold text-[11px] md:text-sm">
                  <div className="text-text-dark/70">Time</div>
                  <div className="bg-text-dark/5 rounded-t-lg p-2 text-center">Main Hall</div>
                  <div className="bg-text-dark/5 rounded-t-lg p-2 text-center">Side Hall</div>
                </div>

                <div className="space-y-2 text-[11px] md:text-sm">
                  {/* 09:00-10:30 Private Lessons */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">09:00-10:30</div>
                    <div className="bg-text-dark/10 rounded-lg p-2 md:p-3 col-span-2">
                      <p className="font-semibold">Private lessons</p>
                      <p className="text-xs text-text-dark/70 mt-1">All pros (by appointment)</p>
                    </div>
                  </div>

                  {/* 10:30-11:30 Spotlight / Private slots */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">10:30-11:30</div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3 border-2 border-yellow-accent/30">
                      <p className="font-semibold">Spotlight Critique (Add-on)</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-text-dark/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Private lesson slots</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 11:30-12:00 Coffee break */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">11:30-12:00</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">
                      Coffee break / go buy food for community lunch
                    </div>
                  </div>

                  {/* 12:00-13:30 Lunch */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">12:00-13:30</div>
                    <div className="bg-pink-accent/10 rounded-lg p-2 md:p-3 col-span-2 border-2 border-pink-accent/30">
                      <p className="font-semibold">Community Lunch</p>
                      <p className="text-xs text-text-dark/70 mt-1">Bring and share</p>
                    </div>
                  </div>

                  {/* 13:30-14:30 */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">13:30-14:30</div>
                    <div className="bg-purple-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 14:30-14:45 Break */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">14:30-14:45</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Break</div>
                  </div>

                  {/* 14:45-15:45 */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">14:45-15:45</div>
                    <div className="bg-purple-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 15:45-16:00 Break */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">15:45-16:00</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Break</div>
                  </div>

                  {/* 16:00-17:00 */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">16:00-17:00</div>
                    <div className="bg-purple-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 17:00-18:30 Dinner */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">17:00-18:30</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Dinner Break</div>
                  </div>

                  {/* 18:30-19:30 All levels */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">18:30-19:30</div>
                    <div className="bg-pink-accent/5 rounded-lg p-2 md:p-3 col-span-2">
                      <p className="font-semibold">Master Your Social Dance on the Floor</p>
                      <p className="text-xs text-text-dark/70 mt-1">All levels • Igor & Fernanda • main hall</p>
                    </div>
                  </div>

                  {/* 19:30-23:00 Social */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">19:30-23:00</div>
                    <div className="bg-pink-accent/10 rounded-lg p-2 md:p-3 col-span-2 border-2 border-pink-accent/30">
                      <p className="font-semibold">Saturday Night Social + Pro shows</p>
                      <p className="text-xs text-text-dark/70 mt-1">Improv style</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sunday */}
            <div className="mb-12">
              <h3 className="font-spartan font-semibold text-2xl md:text-3xl mb-2 text-pink-accent">
                Sunday, March 22 — Fun & Style
              </h3>
              <p className="text-sm md:text-base text-text-dark/70 mb-6">
                Fun, creativity, and style-building — highly recommended after you&apos;ve solidified technique & connection on Saturday.
              </p>

              <div className="bg-cloud-dancer rounded-xl p-4 md:p-6">
                {/* Header */}
                <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3 mb-2 font-semibold text-[11px] md:text-sm">
                  <div className="text-text-dark/70">Time</div>
                  <div className="bg-text-dark/5 rounded-t-lg p-2 text-center">Main Hall</div>
                  <div className="bg-text-dark/5 rounded-t-lg p-2 text-center">Side Hall</div>
                </div>

                <div className="space-y-2 text-[11px] md:text-sm">
                  {/* 09:00-11:00 Private Lessons */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">09:00-11:00</div>
                    <div className="bg-text-dark/10 rounded-lg p-2 md:p-3 col-span-2">
                      <p className="font-semibold">Private lesson slots</p>
                      <p className="text-xs text-text-dark/70 mt-1">All pros (by appointment)</p>
                    </div>
                  </div>

                  {/* 11:00-12:00 Follower Focus */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">11:00-12:00</div>
                    <div className="bg-pink-accent/5 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Follower Focus</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda • main hall</p>
                    </div>
                    <div className="bg-text-dark/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Private lesson slots</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 12:00-13:00 Leads Focus */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">12:00-13:00</div>
                    <div className="bg-pink-accent/5 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Leads Focus</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen • main hall</p>
                    </div>
                    <div className="bg-text-dark/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Private lesson slots</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 13:00-14:00 Lunch */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">13:00-14:00</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Lunch Break</div>
                  </div>

                  {/* 14:00-15:00 */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">14:00-15:00</div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-purple-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 15:00-15:15 Break */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">15:00-15:15</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Break</div>
                  </div>

                  {/* 15:15-16:15 */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">15:15-16:15</div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                    <div className="bg-purple-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 16:15-16:30 Break */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">16:15-16:30</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Break</div>
                  </div>

                  {/* 16:30-17:30 */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">16:30-17:30</div>
                    <div className="bg-yellow-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                    <div className="bg-purple-accent/10 rounded-lg p-2 md:p-3">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                  </div>

                  {/* 17:30-18:30 Dinner */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">17:30-18:30</div>
                    <div className="bg-text-dark/5 rounded-lg p-2 md:p-3 col-span-2 text-center font-semibold">Dinner Break</div>
                  </div>

                  {/* 18:30-19:30 All levels */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">18:30-19:30</div>
                    <div className="bg-pink-accent/5 rounded-lg p-2 md:p-3 col-span-2">
                      <p className="font-semibold">All Levels Workshop</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen • main hall</p>
                    </div>
                  </div>

                  {/* 19:30-23:00 Social */}
                  <div className="grid grid-cols-[88px_1fr_1fr] md:grid-cols-[120px_1fr_1fr] gap-2 md:gap-3">
                    <div className="font-semibold text-text-dark/70 flex items-center">19:30-23:00</div>
                    <div className="bg-pink-accent/10 rounded-lg p-2 md:p-3 col-span-2 border-2 border-pink-accent/30">
                      <p className="font-semibold">Sunday Night Social</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-text-dark/5 rounded-xl p-6 md:p-8 border-2 border-text-dark/10">
              <p className="font-semibold text-lg mb-2">💡 Pro Tip: Private Lessons</p>
              <p className="text-text-dark/80">
                Private lessons can be shared. Book as a couple and split the time (and cost). Limited slots available — see the schedule for the dedicated private lesson windows.
              </p>
            </div>
          </div>
        </section>
            </div>

            <div className="panel-passes hidden">

        {/* Additional Info */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="max-w-[900px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-12">
              Good to Know
            </h2>

            <div className="space-y-8">
              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <h3 className="font-spartan font-semibold text-2xl mb-4">📍 Venue</h3>
                <p className="text-text-dark/80">Cape Town Southern Suburbs — details TBC.</p>
              </div>

              <div className="bg-cloud-dancer rounded-xl p-6 md:p-8">
                <h3 className="font-spartan font-semibold text-2xl mb-4">🎯 Understanding Levels</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-spartan font-semibold text-lg text-purple-accent mb-2">Level 1</h4>
                    <p className="text-text-dark/80 mb-2">
                      You know the basics of West Coast Swing, but you still don&apos;t feel confident when social dancing. In addition to improving your basics, you want to learn the West Coast Swing fundamentals and be able to dance with any partner.
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
