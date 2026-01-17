export default function WhoAreWe() {
  return (
    <section 
      className="px-[5%] py-[40px] md:py-[50px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
      }}
    >
      <div className="max-w-[900px] mx-auto text-center">
        <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] mb-6">
          Who Are We?
        </h2>

        <p className="text-base md:text-lg mb-6 leading-relaxed">
          We're a <span className="font-semibold">volunteer-driven community with one ambition:</span> bring this wonderful dance to Cape Town and grow a welcoming community — <span className="font-semibold">like the international WCS family that's embraced us.</span>
        </p>

        <a
          href="/about-us"
          className="inline-block text-pink-accent hover:text-yellow-accent underline font-medium"
        >
          Learn more about us →
        </a>
      </div>
    </section>
  );
}
