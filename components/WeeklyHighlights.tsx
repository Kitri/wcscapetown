import Link from "next/link";

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

          {/* Workshop — featured banner */}
          <Link
            href="/swingstrong"
            className="rounded-xl border-2 p-5 transition-all hover:shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            style={{ borderColor: '#00B49A', backgroundColor: 'rgba(0,180,154,0.07)' }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#00B49A' }}>
                🌍 International Workshop · Sunday 6 September 2026
              </p>
              <p className="font-spartan font-bold text-xl md:text-2xl leading-tight mb-1">
                Jeff Mumford in Cape Town!
              </p>
              <p className="text-sm text-text-dark/70">Swing Strong — Mobility &amp; Movement for WCS · 4 Hours · 11:30–15:30 · R350 · Pinelands</p>
            </div>
            <span
              className="inline-block shrink-0 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#00B49A' }}
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
