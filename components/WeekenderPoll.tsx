import Image from "next/image";
import Link from "next/link";

export default function WeekenderPoll() {
  return (
    <section
      id="weekender"
      className="px-[5%] py-[40px] md:py-[50px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
      }}
    >
      <div className="max-w-[900px] mx-auto text-center">
        <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-3">
          WCS Weekender with International Pros!
        </h2>

        <p className="text-lg md:text-xl font-medium mb-3">
          March 20-22, 2026 • Cape Town
        </p>
        
        {/* Instructor Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-[700px] mx-auto mb-6">
          {/* Igor & Fernanda - Slightly larger, spans 2 columns on mobile */}
          <a href="https://www.instagram.com/igorandfernanda/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center col-span-2 md:col-span-1">
            <div className="w-full max-w-[200px] md:max-w-none aspect-square rounded-xl mb-3 overflow-hidden border-2 border-text-dark/10 group-hover:border-pink-accent transition-all shadow-sm mx-auto relative">
              <Image
                src="/images/igor_fernanda1.jpg"
                alt="Igor Pitangui and Fernanda Dubiel"
                fill
                sizes="(max-width: 768px) 200px, 233px"
                className="object-cover"
              />
            </div>
            <p className="text-sm md:text-base font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors underline">
              Igor Pitangui &<br />Fernanda Dubiel
            </p>
          </a>
          
          {/* Kristen */}
          <a href="https://www.instagram.com/kwalla.bear" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
            <div className="w-full aspect-square rounded-lg mb-3 overflow-hidden border-2 border-text-dark/10 group-hover:border-pink-accent transition-all shadow-sm relative">
              <Image
                src="/images/kristen1.jpg"
                alt="Kristen Wallace"
                fill
                sizes="(max-width: 768px) 50vw, 233px"
                className="object-cover"
              />
            </div>
            <p className="text-sm md:text-base font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors underline">
              Kristen<br />Wallace
            </p>
          </a>
          
          {/* Harold */}
          <a href="https://www.instagram.com/harold_baker_dance" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center">
            <div className="w-full aspect-square rounded-lg mb-3 overflow-hidden border-2 border-text-dark/10 group-hover:border-pink-accent transition-all shadow-sm relative">
              <Image
                src="/images/harold1.jpg"
                alt="Harold Baker"
                fill
                sizes="(max-width: 768px) 50vw, 233px"
                className="object-cover"
              />
            </div>
            <p className="text-sm md:text-base font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors underline">
              Harold<br />Baker
            </p>
          </a>
        </div>
        
        <p className="text-base md:text-lg text-text-dark/80 mb-4 max-w-[600px] mx-auto">
          Weekend of learning • Evening socials
        </p>

        <div className="mt-4">
          <div className="mt-6">
            <Link
              href="/weekender"
              className="inline-block bg-pink-accent text-white px-10 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-accent/30"
            >
              View Weekender page
            </Link>
          </div>

          <p className="text-xs text-text-dark/60 mt-6 max-w-[600px] mx-auto">
            Details may change slightly — the Weekender page is always the latest info.
          </p>
        </div>
      </div>
    </section>
  );
}
