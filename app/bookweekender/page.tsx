import Header from "@/components/Header";

export default function BookWeekender() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-black text-white min-h-[60vh] flex items-center justify-center">
          <div className="px-[5%] py-20 text-center">
            <h1 className="font-spartan font-semibold text-[32px] md:text-[48px] mb-6">
              Book Your Weekender Pass
            </h1>
            <p className="text-2xl md:text-3xl text-yellow-accent font-semibold">
              Ticket sales open at 7am on 18 February 2026
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
