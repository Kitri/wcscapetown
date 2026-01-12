export default function WhatIsWCS() {
  return (
    <section className="px-[5%] py-[40px] md:py-[50px]">
      <div className="max-w-[900px] mx-auto">
        <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] text-center mb-6">
          What is West Coast Swing?
        </h2>

        <p className="text-base md:text-lg leading-relaxed mb-4">
          WCS is a "living" dance that evolves with modern music (Pop, R&B,
          Blues, Hip Hop...), a smoothed-out evolution from Lindy Hop primarily
          danced to swing jazz music. It's a contemporary partner dance built on
          principles rather than patterns, allowing for endless creativity and
          personal expression.
        </p>

        <p className="text-base md:text-lg leading-relaxed mb-8">
          <a
            href="https://www.worldsdc.com/wp-content/uploads/2022/03/Article-Evolution-of-WCS.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-accent hover:text-yellow-accent underline"
          >
            Read about the evolution of WCS by Skippy Blair →
          </a>
        </p>

        {/* Video Section */}
        <div className="mt-10">
          <h3 className="font-spartan font-semibold text-xl md:text-2xl text-center mb-6">
            See WCS in Action
          </h3>
          <div
            className="max-w-[800px] mx-auto rounded-xl overflow-hidden"
            style={{
              boxShadow: "0 4px 20px rgba(219, 64, 156, 0.15)",
            }}
          >
            <iframe
              width="100%"
              height="450"
              src="https://www.youtube.com/embed/v4fRV0aG3lc?si=o4RtXzaGd-rCNxHP"
              title="West Coast Swing Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-[250px] md:h-[450px]"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
