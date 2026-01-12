import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-[1000] bg-cloud-dancer border-b border-text-dark/10 px-[5%] py-5">
      <div className="flex justify-between items-center max-w-[1200px] mx-auto">
        {/* Logo and Text */}
        <Link href="/" className="flex items-center gap-4">
          <Image
            src="/images/WCS CT Logo black.png"
            alt="WCS Cape Town Logo"
            width={50}
            height={50}
            className="object-contain"
          />
          <div className="font-spartan font-semibold text-base md:text-lg leading-tight text-text-dark">
            <div>West Coast Swing</div>
            <div>Cape Town</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-text-dark hover:text-yellow-accent transition-colors">Home</Link>
          <Link href="/whats-on" className="text-text-dark hover:text-pink-accent transition-colors">What's On</Link>
          <Link href="/about-us" className="text-text-dark hover:text-yellow-accent transition-colors">About Us</Link>
          <Link href="/community-culture" className="text-text-dark hover:text-pink-accent transition-colors">Community Culture</Link>
          <Link href="/news" className="text-text-dark hover:text-yellow-accent transition-colors">Highlights</Link>
          <Link href="/contact" className="text-text-dark hover:text-pink-accent transition-colors">Contact</Link>
        </nav>

        {/* Mobile Hamburger Menu */}
        <button 
          className="md:hidden w-[30px] h-[24px] flex flex-col justify-between"
          aria-label="Open navigation menu"
        >
          <span className="w-full h-[3px] bg-text-dark rounded-sm"></span>
          <span className="w-full h-[3px] bg-text-dark rounded-sm"></span>
          <span className="w-full h-[3px] bg-text-dark rounded-sm"></span>
        </button>
      </div>
    </header>
  );
}
