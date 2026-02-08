import Header from "@/components/Header";
import VideoGallery from "@/components/VideoGallery";
import Image from "next/image";
import Link from "next/link";

const WEEKENDER_SOLD_OUT = {
  blizzardWeekend: false,
  earlyWeekend: false,
  earlyDay: false,
  normalWeekend: false,
  normalDay: false,
  weekendOfWeekend: false,
  weekendOfDay: false,
  partyPass: false,
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
              src="/images/pros/banner-2026-02-08.jpg"
              alt="West Coast Swing Weekender banner"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="px-[5%] py-10 text-center">
            <p className="text-lg md:text-xl font-semibold mb-2">March 20–22, 2026</p>
            <p className="text-base md:text-lg text-white/90 max-w-[900px] mx-auto mb-6">
              Experience world-class WCS festival vibes right here in Cape Town!
            </p>
            <Link
              href="#booking"
              className="inline-block bg-pink-accent text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-pink-accent/90 hover:shadow-xl transition-all"
            >
              Book Now
            </Link>
          </div>
        </section>

        {/* Meet Your Pros */}
        <section className="px-[5%] py-[60px] bg-white">
          <div className="w-full mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Meet Your Pros
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-12">
              Four world-class instructors from around the globe
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Igor & Fernanda */}
              <div className="bg-cloud-dancer rounded-2xl overflow-hidden border-2 border-text-dark/10">
                <div className="relative w-full pb-[125%]">
                  <Image
                    src="/images/pros/Igor_Fernanda.jpg"
                    alt="Igor Pitangui & Fernanda Dubiel"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-spartan font-semibold text-xl text-pink-accent mb-1">
                    Igor Pitangui & Fernanda Dubiel
                  </h3>
                  <p className="text-sm text-text-dark/70 mb-2">🇧🇷 Brazil</p>
                  <a
                    href="https://www.instagram.com/igorandfernanda/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-accent hover:text-yellow-accent underline"
                  >
                    @igorandfernanda
                  </a>
                  <p className="text-sm text-text-dark/80 mt-4">
                    Dynamic movement, clear technique, musicality, and playful improvisation.
                  </p>
                </div>
              </div>

              {/* Harold */}
              <div className="bg-cloud-dancer rounded-2xl overflow-hidden border-2 border-text-dark/10">
                <div className="relative w-full pb-[125%]">
                  <Image
                    src="/images/pros/harold_baker.jpg"
                    alt="Harold Baker"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-spartan font-semibold text-xl text-pink-accent mb-1">
                    Harold Baker
                  </h3>
                  <p className="text-sm text-text-dark/70 mb-2">🇬🇧 United Kingdom</p>
                  <a
                    href="https://www.instagram.com/harold_baker_dance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-accent hover:text-yellow-accent underline"
                  >
                    @harold_baker_dance
                  </a>
                  <p className="text-sm text-text-dark/80 mt-4">
                    Musical, grounded, and seriously fun.
                  </p>
                </div>
              </div>

              {/* Kristen */}
              <div className="bg-cloud-dancer rounded-2xl overflow-hidden border-2 border-text-dark/10">
                <div className="relative w-full pb-[125%]">
                  <Image
                    src="/images/pros/kristen_wallace.png"
                    alt="Kristen Wallace"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-spartan font-semibold text-xl text-pink-accent mb-1">
                    Kristen Wallace
                  </h3>
                  <p className="text-sm text-text-dark/70 mb-2">🇺🇸 United States</p>
                  <a
                    href="https://www.instagram.com/kwalla.bear"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-accent hover:text-yellow-accent underline"
                  >
                    @kwalla.bear
                  </a>
                  <p className="text-sm text-text-dark/80 mt-4">
                    Style, performance quality, and plenty of play.
                  </p>
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
              <h3 className="font-spartan font-semibold text-2xl mb-6 text-pink-accent">Improv</h3>
              <VideoGallery
                videos={[
                  {
                    label: "Fernanda — Improv",
                    url: "https://youtu.be/yNcBBiN-REc?si=BD9hYQkP9_6Wd8-_",
                  },
                  {
                    label: "Harold — Improv",
                    url: "https://youtu.be/FR6q9AJWKrY?si=tH8rRv8DIDghEsiv",
                  },
                  {
                    label: "Kristen — Improv",
                    url: "https://youtu.be/iqXJ9iz3fg8?si=3kOClm-9XyAhG5ol",
                  },
                  {
                    label: "Igor — Improv (Lead)",
                    url: "https://youtu.be/M5tz_9ECBTw?si=6XjwDu8TWsoox5-P",
                  },
                  {
                    label: "Igor — Improv (Follower)",
                    url: "https://youtu.be/qL9gECRyhgY?si=KUxj2ab3VkjNdKnm",
                  },
                ]}
              />
            </div>

            <div>
              <h3 className="font-spartan font-semibold text-2xl mb-6 text-pink-accent">Routines & Showcases</h3>
              <VideoGallery
                videos={[
                  {
                    label: "Kristen — Routine",
                    url: "https://youtu.be/Z76ybrXpnSw?si=vOjXixCE7BibMKoH",
                    note: "Rising Star showcase winner — US Open 2025",
                  },
                  {
                    label: "Igor & Fernanda — Routine",
                    url: "https://youtu.be/40yvzp4IGE8?si=4XD5SpkzjJ3i8ILT",
                  },
                  {
                    label: "Harold — Cardio Cameraman",
                    url: "https://www.instagram.com/p/DIqQi2LBhCp/",
                    note: "A little taste of Harold’s other talents.",
                  },
                ]}
              />
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
              
              <div className="sm:hidden text-xs text-text-dark/60 mb-2 text-center">
                Swipe left/right to see both halls →
              </div>
              <div className="relative">
                <div className="overflow-x-auto pb-2">
                  <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-3 font-semibold text-sm">
                    <div className="text-text-dark/70">Time</div>
                    <div className="bg-purple-accent/20 rounded-t-lg p-2 text-center">Main Hall</div>
                    <div className="bg-yellow-accent/20 rounded-t-lg p-2 text-center">Side Hall</div>
                  </div>

                  {/* 09:00-10:00 Private Lessons */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">09:00-10:00</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Private Lesson Slot</p>
                      <p className="text-xs text-text-dark/70 mt-1">All pros (by appointment)</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Private Lessons</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda only (Side Hall)</p>
                    </div>
                  </div>

                  {/* 10:00-11:00 Spotlight Critique */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">10:00-11:00</div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm border-2 border-yellow-accent/30">
                      <p className="font-semibold">Spotlight Critique</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen (Optional add-on, limited to 10 couples)</p>
                    </div>
                    <div className="bg-text-dark/5 rounded-lg p-3 flex items-center justify-center text-xs text-text-dark/50">Warm-up / practice</div>
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
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 15:00-16:00 Workshops */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">15:00-16:00</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 1</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                    </div>
                  </div>

                  {/* 16:00-16:15 Break */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">16:00-16:15</div>
                    <div className="bg-text-dark/5 rounded-lg p-3 text-sm col-span-2 text-center font-semibold">Break</div>
                  </div>

                  {/* 16:15-17:15 Level 2 + Private Lessons */}
                  <div className="grid grid-cols-[120px_1fr_1fr] gap-3 mb-2">
                    <div className="font-semibold text-sm text-text-dark/70 flex items-center">16:15-17:15</div>
                    <div className="bg-purple-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Level 2</p>
                      <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen (Main Hall)</p>
                    </div>
                    <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                      <p className="font-semibold">Private Lessons</p>
                      <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda only (Side Hall)</p>
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
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
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
              
              <div className="sm:hidden text-xs text-text-dark/60 mb-2 text-center">
                Swipe left/right to see both halls →
              </div>
              <div className="relative">
                <div className="overflow-x-auto pb-2">
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
                        <p className="font-semibold">Level 2</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                      <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 1</p>
                        <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
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
                        <p className="font-semibold">Level 2</p>
                        <p className="text-xs text-text-dark/70 mt-1">Igor & Fernanda</p>
                      </div>
                      <div className="bg-yellow-accent/10 rounded-lg p-3 text-sm">
                        <p className="font-semibold">Level 1</p>
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
                        <p className="font-semibold">All Levels Workshop</p>
                        <p className="text-xs text-text-dark/70 mt-1">Harold & Kristen</p>
                      </div>
                    </div>

                    {/* 19:30-23:00 Social */}
                    <div className="grid grid-cols-[120px_1fr_1fr] gap-3">
                      <div className="font-semibold text-sm text-text-dark/70 flex items-center">19:30-23:00</div>
                      <div className="bg-pink-accent/10 rounded-lg p-3 text-sm col-span-2 border-2 border-pink-accent/30">
                        <p className="font-semibold">Sunday Night Social</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-purple-accent/10 rounded-xl p-6 md:p-8 border-2 border-purple-accent">
              <p className="font-semibold text-lg mb-2">💡 Pro Tip: Private Lessons</p>
              <p className="text-text-dark/80">
                Private lessons can be shared. Book as a couple and split the time (and cost). Limited slots available — see the schedule for the dedicated private lesson windows.
              </p>
            </div>
          </div>
        </section>

        {/* Booking & Pricing */}
        <section id="booking" className="px-[5%] py-[60px] bg-cloud-dancer">
          <div className="max-w-[1100px] mx-auto">
            <h2 className="font-spartan font-semibold text-[32px] md:text-[40px] text-center mb-4">
              Book Your Pass
            </h2>
            <p className="text-center text-lg text-text-dark/70 mb-10 max-w-[700px] mx-auto">
              To book, email us or message us via the WhatsApp community. We&apos;ll confirm availability and how to secure your spot.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <a
                href="mailto:hello@wcscapetown.co.za?subject=WCS%20Weekender%20Booking"
                className="inline-block bg-pink-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-accent/90 hover:shadow-xl transition-all"
              >
                Email to Book
              </a>
              <Link
                href="/contact"
                className="inline-block bg-white text-text-dark px-6 py-3 rounded-lg font-semibold border-2 border-text-dark/10 hover:border-text-dark/20 hover:shadow-lg transition-all"
              >
                Other contact options
              </Link>
            </div>

            {/* Pass summary */}
            <div className="sm:hidden text-xs text-text-dark/60 mb-2 text-center">
              Swipe left/right to compare passes →
            </div>
            <div className="relative bg-white rounded-xl border-2 border-text-dark/10 overflow-hidden mb-12">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[760px] grid grid-cols-[180px_1fr_1fr_1fr]">
                  <div className="p-4 bg-text-dark/5 font-semibold">Includes</div>
                  <div className="p-4 bg-pink-accent/10 font-semibold text-center">Full Weekend Pass</div>
                  <div className="p-4 bg-purple-accent/10 font-semibold text-center">Day Pass</div>
                  <div className="p-4 bg-yellow-accent/10 font-semibold text-center">Party Pass</div>
                  <div className="p-4 border-t text-sm text-text-dark/70">Friday pre-party</div>
                  <div className="p-4 border-t text-center">Included</div>
                  <div className="p-4 border-t text-center">Add-on (R200)</div>
                  <div className="p-4 border-t text-center">Included</div>
                  <div className="p-4 border-t text-sm text-text-dark/70">Evening parties</div>
                  <div className="p-4 border-t text-center">Saturday + Sunday</div>
                  <div className="p-4 border-t text-center">One night (your day)</div>
                  <div className="p-4 border-t text-center">Friday + Saturday + Sunday</div>
                  <div className="p-4 border-t text-sm text-text-dark/70">Workshops</div>
                  <div className="p-4 border-t text-center">Saturday + Sunday (8 hours)</div>
                  <div className="p-4 border-t text-center">One day (4 hours)</div>
                  <div className="p-4 border-t text-center text-text-dark/40">—</div>
                  <div className="p-4 border-t text-sm text-text-dark/70">Community lunch with pros (Saturday)</div>
                  <div className="p-4 border-t text-center">Included</div>
                  <div className="p-4 border-t text-center">Included (Saturday only)</div>
                  <div className="p-4 border-t text-center text-text-dark/40">—</div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
            </div>

            {/* Price tiers */}
            <div className="sm:hidden text-xs text-text-dark/60 mb-2 text-center">
              Swipe left/right to see all pricing columns →
            </div>
            <div className="relative">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[760px] bg-white rounded-xl border-2 border-text-dark/10 overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-4 bg-text-dark/5 font-semibold text-left">Pricing tier</th>
                        <th className="p-4 bg-pink-accent/10 font-semibold text-center">Full Weekend Pass</th>
                        <th className="p-4 bg-purple-accent/10 font-semibold text-center">Day Pass</th>
                        <th className="p-4 bg-yellow-accent/10 font-semibold text-center">Party Pass</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-text-dark/10">
                        <td className="p-4">
                          <p className="font-semibold">Blizzard Bird</p>
                          <p className="text-xs text-text-dark/60">24 hours • limited to 10</p>
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={1600} isSoldOut={soldOut.blizzardWeekend} />
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={null} isSoldOut={false} />
                        </td>
                        <td className="p-4 text-center align-top" rowSpan={4}>
                          <div className="flex flex-col items-center gap-2">
                            <PriceCell price={600} isSoldOut={soldOut.partyPass} />
                            <p className="text-xs text-text-dark/60">Single price</p>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-t border-text-dark/10">
                        <td className="p-4">
                          <p className="font-semibold">Early Bird</p>
                          <p className="text-xs text-text-dark/60">Limited to 30 full passes and 10 day passes</p>
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={1800} isSoldOut={soldOut.earlyWeekend} />
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={1000} isSoldOut={soldOut.earlyDay} />
                        </td>
                      </tr>
                      <tr className="border-t border-text-dark/10">
                        <td className="p-4">
                          <p className="font-semibold">Normal</p>
                          <p className="text-xs text-text-dark/60">Until sold out</p>
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={2000} isSoldOut={soldOut.normalWeekend} />
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={1100} isSoldOut={soldOut.normalDay} />
                        </td>
                      </tr>
                      <tr className="border-t border-text-dark/10">
                        <td className="p-4">
                          <p className="font-semibold">Weekend of (March 20–22)</p>
                          <p className="text-xs text-text-dark/60">Weekend pass available on March 20 only</p>
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={2200} isSoldOut={soldOut.weekendOfWeekend} />
                        </td>
                        <td className="p-4 text-center">
                          <PriceCell price={1300} isSoldOut={soldOut.weekendOfDay} />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent sm:hidden" />
            </div>

            <p className="text-sm text-text-dark/60 mt-4 text-center">
              Prices are in ZAR. Availability is limited — if a tier sells out, the next tier applies.
            </p>
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
      </main>
    </>
  );
}
