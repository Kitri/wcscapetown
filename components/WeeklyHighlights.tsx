import Link from "next/link";
import Image from "next/image";

function getNextLabel(targetDay: number): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  if (dayOfWeek === targetDay) return "Tonight";
  const daysUntil = (targetDay - dayOfWeek + 7) % 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  return next.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function WeeklyHighlights() {
  const mondayLabel = getNextLabel(1);
  const wednesdayLabel = getNextLabel(3);

  return (
    <section className="px-[5%] py-[28px] bg-white border-t border-text-dark/10">
      <div className="max-w-[1100px] mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-dark/40 text-center mb-5">
          What&apos;s On
        </p>
        <div className="flex flex-col gap-3">

          {/* Featured: Strictly Halloween Social */}
          <Link
            href="/whats-on#monthly-social"
            className="rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg flex flex-col md:flex-row md:items-center gap-4"
            style={{ borderColor: 'rgba(245,116,32,0.45)', backgroundColor: 'rgba(245,116,32,0.07)' }}
          >
            <div className="shrink-0 bg-white flex items-center justify-center p-4 md:w-[200px] self-stretch">
              <Image
                src="/images/strictly social.png"
                alt="Strictly Social"
                width={469}
                height={265}
                className="w-[160px] md:w-full h-auto"
              />
            </div>
            <div className="flex-1 px-5 pb-1 md:py-5 md:px-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#F57420' }}>
                🎃 Early Halloween party · Saturday 10 October
              </p>
              <p className="font-spartan font-bold text-xl md:text-2xl leading-tight mb-1">
                Strictly Halloween Social
              </p>
              <p className="text-sm text-text-dark/70">Taster class at 8 PM · Social 8–11 PM · R50 per person · 1st Claremont Scout Group · All welcome</p>
            </div>
            <span
              className="inline-block shrink-0 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90 mx-5 mb-5 md:mb-0 md:mx-0 md:mr-5 self-start md:self-center"
              style={{ backgroundColor: '#F57420' }}
            >
              Find out more →
            </span>
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
