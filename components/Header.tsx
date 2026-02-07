"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            className="object-contain w-auto h-auto"
          />
          <div className="font-spartan font-semibold text-base md:text-lg leading-tight text-text-dark">
            <div>West Coast Swing</div>
            <div>Cape Town</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-text-dark hover:text-yellow-accent transition-colors">Home</Link>
          <Link href="/whats-on" className="text-text-dark hover:text-pink-accent transition-colors">What&apos;s On</Link>
          <Link href="/about-us" className="text-text-dark hover:text-yellow-accent transition-colors">About Us</Link>
          <Link href="/community-culture" className="text-text-dark hover:text-pink-accent transition-colors">Community Culture</Link>
          <Link href="/news" className="text-text-dark hover:text-yellow-accent transition-colors">Highlights</Link>
          <Link href="/contact" className="text-text-dark hover:text-pink-accent transition-colors">Contact</Link>
        </nav>

        {/* Mobile Hamburger Menu */}
        <button 
          className="md:hidden w-[30px] h-[24px] flex flex-col justify-between"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className={`w-full h-[3px] bg-text-dark rounded-sm transition-transform ${
            isMenuOpen ? "rotate-45 translate-y-[10.5px]" : ""
          }`}></span>
          <span className={`w-full h-[3px] bg-text-dark rounded-sm transition-opacity ${
            isMenuOpen ? "opacity-0" : ""
          }`}></span>
          <span className={`w-full h-[3px] bg-text-dark rounded-sm transition-transform ${
            isMenuOpen ? "-rotate-45 -translate-y-[10.5px]" : ""
          }`}></span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[90px] bg-cloud-dancer z-[999]">
          <nav className="flex flex-col items-center gap-6 py-8">
            <Link 
              href="/" 
              className="text-text-dark hover:text-yellow-accent transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/whats-on" 
              className="text-text-dark hover:text-pink-accent transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              What&apos;s On
            </Link>
            <Link 
              href="/about-us" 
              className="text-text-dark hover:text-yellow-accent transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              href="/community-culture" 
              className="text-text-dark hover:text-pink-accent transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Community Culture
            </Link>
            <Link 
              href="/news" 
              className="text-text-dark hover:text-yellow-accent transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Highlights
            </Link>
            <Link 
              href="/contact" 
              className="text-text-dark hover:text-pink-accent transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
