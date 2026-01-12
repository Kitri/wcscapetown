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

        <p className="text-base md:text-lg leading-relaxed mb-6">
          West Coast Swing Cape Town started in a living room in 2023 - a handful of us teaching ourselves a dance we'd only seen online. We learned chaotically from scattered online resources, jumping from sugar pushes to advanced concepts without knowing what we were skipping. Then the international WCS community stepped in - workshops, visiting instructors, connections across continents - and helped us find our way.
        </p>
        
        <p className="text-base md:text-lg leading-relaxed mb-6">
          Today, we're a team of community organizers and teachers who are completely in love with this dance. Our ambition is to bring international-quality West Coast Swing to every corner of Cape Town - learning it properly, sharing what we discover, and building a community where everyone's welcome to explore it with us.
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
