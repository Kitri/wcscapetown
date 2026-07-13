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
          This week
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

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

          {/* Monthly Social */}
          <Link
            href="/whats-on#monthly-social"
            className="flex items-start gap-3 rounded-xl border-2 border-pink-accent/30 hover:border-pink-accent bg-pink-accent/5 hover:bg-pink-accent/10 p-4 transition-all group"
          >
            <span className="mt-0.5 text-xl">🤠</span>
            <div className="text-left min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-accent mb-0.5">
                Saturday, 18 July
              </p>
              <p className="font-spartan font-semibold text-base leading-tight mb-1">
                Cowboys &amp; Fishnets Social
              </p>
              <p className="text-xs text-text-dark/60">8–11 PM · Scout Hall, Claremont</p>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
