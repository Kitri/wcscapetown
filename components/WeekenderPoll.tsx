"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { getOrCreateSessionId } from "@/lib/sessionId";

export default function WeekenderPoll() {
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedInterest) return;
    
    setIsSubmitting(true);

    const data = {
      interest: selectedInterest,
      email: email || "(not provided)",
      timestamp: new Date().toISOString(),
      sessionId: getOrCreateSessionId(),
    };

    try {
      const response = await fetch("/api/poll-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      // Silently fail - error already logged server-side
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section
        id="weekender"
        className="px-[5%] py-[60px] md:py-[60px]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
        }}
      >
        <div className="max-w-[900px] mx-auto text-center">
          <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] mb-4">
            Thank you!
          </h2>
          <p className="text-lg">
            Your response helps us plan what's possible.
          </p>
        </div>
      </section>
    );
  }

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
        {/* Title */}
        <div className="mb-2">
          <span className="inline-block bg-pink-accent text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Announcement
          </span>
        </div>
        
        <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-3">
          WCS Weekender with International Pros!
        </h2>
        
        <p className="text-lg md:text-xl font-medium mb-6">
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
                className="object-cover"
              />
            </div>
            <p className="text-sm md:text-base font-semibold text-center text-pink-accent group-hover:text-yellow-accent transition-colors underline">
              Harold<br />Baker
            </p>
          </a>
        </div>
        
        <p className="text-base md:text-lg text-text-dark/80 mb-6 max-w-[600px] mx-auto">
          Weekend of learning • Evening socials
        </p>

        {/* Interest Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[700px] mx-auto mb-6">
          {[
            { label: "I'm in! 🚀", value: "excited-yes", gradient: "from-yellow-accent to-pink-accent" },
            { label: "Depends on cost", value: "cost-dependent", gradient: "from-yellow-accent/70 to-yellow-accent/40" },
            { label: "Not for me", value: "no", gradient: "" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedInterest(prev => prev === option.value ? null : option.value)}
              disabled={isSubmitting}
              className={`
                relative border-2 rounded-lg p-4 font-medium text-base transition-all duration-200
                ${
                  selectedInterest === option.value
                    ? option.gradient
                      ? `bg-gradient-to-r ${option.gradient} border-yellow-accent text-text-dark scale-105 shadow-lg`
                      : "bg-gray-100 border-gray-300 text-text-dark scale-105"
                    : option.gradient
                      ? "bg-white border-text-dark/20 hover:bg-yellow-accent/10 hover:border-yellow-accent"
                      : "bg-white border-text-dark/20 hover:bg-gray-50 hover:border-gray-300"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {/* Checkbox Circle */}
              <div className={`
                absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${selectedInterest === option.value ? "bg-yellow-accent border-yellow-accent" : "border-gray-300"}
              `}>
                {selectedInterest === option.value && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              
              <span>{option.label}</span>
            </button>
          ))}
        </div>

        {/* Email Input */}
        <div className="mb-6 max-w-md mx-auto">
          <label htmlFor="weekender-email" className="block text-sm font-medium mb-2">
            Notify me about this event
          </label>
          <input
            id="weekender-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full p-3 rounded-lg border-2 border-text-dark/20 focus:border-yellow-accent focus:outline-none bg-white"
          />
          <p className="text-xs text-text-dark/60 mt-1">
            Optional - all details will be shared on our community channels
          </p>
        </div>

        {/* Submit Button */}
        {selectedInterest && (
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-pink-accent text-white px-10 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-accent/30 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Response"
              )}
            </button>
          </div>
        )}

        {/* Fine Print */}
        <p className="text-xs text-text-dark/60 mt-6 max-w-[600px] mx-auto">
          Watch this space! Details coming soon!
        </p>
      </div>
    </section>
  );
}
