import Link from "next/link";

export default function WeekenderBanner() {
  return (
    <section className="bg-gradient-to-r from-pink-accent to-pink-accent/80 text-white py-6">
      <div className="px-[5%] max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h2 className="font-spartan font-bold text-xl md:text-2xl">
              WCS Cape Town Weekender — March 20–22, 2026
            </h2>
          </div>
          
          <Link
            href="/bookweekender"
            className="inline-block bg-yellow-accent text-text-dark px-6 py-3 rounded-lg font-bold text-base hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
          >
            Book Now →
          </Link>
        </div>
      </div>
    </section>
  );
}
