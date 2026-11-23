import Link from "next/link";
import Image from "next/image";

// End-of-year break: last Monday class 14 Dec 2026, classes restart Mon 11 Jan 2027.
const BREAK_START = new Date(2026, 11, 15);
const BREAK_END = new Date(2027, 0, 11);
const BEFORE_BREAK = new Date() < new Date(2026, 11, 18);

function getNextLabel(targetDay: number, skipBreak = false): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysUntil = (targetDay - dayOfWeek + 7) % 7;
  let next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(0, 0, 0, 0);
  if (skipBreak && next >= BREAK_START && next < BREAK_END) {
    next = new Date(BREAK_END);
    next.setDate(next.getDate() + ((targetDay - next.getDay() + 7) % 7));
  } else if (dayOfWeek === targetDay) {
    return "Tonight";
  }
  return next.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function WeeklyHighlights() {
  const mondayLabel = getNextLabel(1, true);
  const wednesdayLabel = getNextLabel(3);

  return (
    <section className="px-[5%] py-[28px] bg-white border-t border-text-dark/10">
      <div className="max-w-[1100px] mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dark/40 text-center mb-5">
          What&apos;s On
        </p>
        <div className="flex flex-col gap-3">

          {/* Featured: Kristen Wallace Intensive */}
          <Link
            href="/kristen-intensive"
            className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg flex flex-col md:flex-row md:items-center gap-4"
            style={{ borderColor: 'rgba(28,138,209,0.45)', backgroundColor: 'rgba(28,138,209,0.07)' }}
          >
            <div className="relative shrink-0 h-[180px] md:h-auto md:w-[200px] self-stretch md:min-h-[150px]">
              <Image
                src="/images/kristen_intensive.JPEG"
                alt="Kristen Wallace dancing West Coast Swing"
                fill
                sizes="(max-width: 768px) 100vw, 200px"
                className="object-cover object-[45%_25%]"
              />
            </div>
            <div className="flex-1 px-5 pb-1 md:py-5 md:px-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#1C8AD1' }}>
                🌍 International Intensive · Wednesday 16 December
              </p>
              <p className="font-spartan font-bold text-xl md:text-2xl leading-tight mb-1">
                Kristen Wallace is back in Cape Town!
              </p>
              <p className="text-sm text-text-dark/70">2-hour intensive · 3–5 PM · R250 · Pinelands North Primary School</p>
            </div>
            <span
              className="inline-block shrink-0 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90 mx-5 mb-5 md:mb-0 md:mx-0 md:mr-5 self-start md:self-center"
              style={{ backgroundColor: '#1C8AD1' }}
            >
              Book now →
            </span>
          </Link>

          {/* Monthly Social */}
          <Link
            href="/whats-on#monthly-social"
            className="flex items-start gap-3 rounded-xl border-2 border-pink-accent/30 hover:border-pink-accent bg-pink-accent/5 hover:bg-pink-accent/10 p-4 transition-all group"
          >
            <span className="mt-0.5 text-xl">🎄</span>
            <div className="text-left min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-accent mb-0.5">
                Friday 18 December
              </p>
              <p className="font-spartan font-semibold text-base leading-tight mb-1">
                Christmas Social
              </p>
              <p className="text-xs text-text-dark/60">Taster class at 8 PM · R50 · Scout Hall, Claremont</p>
            </div>
          </Link>

          {/* Regular events row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Monday Classes */}
            <Link
              href="/whats-on#monday-classes"
              className="flex items-start gap-3 rounded-xl border-2 border-yellow-accent/30 hover:border-yellow-accent bg-yellow-accent/5 hover:bg-yellow-accent/10 p-4 transition-all group"
            >
              <span className="mt-0.5 text-xl">🟡</span>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-yellow-accent mb-0.5">
                  {mondayLabel === "Tonight" ? "🎉 Tonight!" : mondayLabel}
                </p>
                <p className="font-spartan font-semibold text-base leading-tight mb-1">
                  Classes &amp; Social
                </p>
                <p className="text-xs text-text-dark/60">7–10 PM · Havana Nights, Plumstead</p>
                {BEFORE_BREAK && (
                  <p className="text-xs italic text-text-dark/50 mt-0.5">Last class for the year: 14 Dec</p>
                )}
              </div>
            </Link>

            {/* Wednesday Market */}
            <Link
              href="/whats-on#down-to-earth"
              className="flex items-start gap-3 rounded-xl border-2 border-text-dark/15 hover:border-text-dark/35 bg-text-dark/[0.03] hover:bg-text-dark/[0.06] p-4 transition-all group"
            >
              <span className="mt-0.5 text-xl">🎵</span>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-dark/50 mb-0.5">
                  {wednesdayLabel === "Tonight" ? "🎉 Tonight!" : wednesdayLabel}
                </p>
                <p className="font-spartan font-semibold text-base leading-tight mb-1">
                  Casual Dancing
                </p>
                <p className="text-xs text-text-dark/60">6–8 PM · Down to Earth Market</p>
              </div>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
