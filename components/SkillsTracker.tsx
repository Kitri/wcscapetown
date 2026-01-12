"use client";

import { useState, useEffect, FormEvent } from "react";
import { getOrCreateSessionId } from "@/lib/sessionId";

export default function SkillsTracker() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Auto-populate from poll email
  useEffect(() => {
    const pollEmail = localStorage.getItem("pollEmail");
    if (pollEmail) {
      setEmail(pollEmail);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/skills-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          timestamp: new Date().toISOString(),
          sessionId: getOrCreateSessionId()
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      // Silently fail - error already logged server-side
    }
  };

  return (
    <section 
      className="px-[5%] py-[40px] md:py-[50px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
      }}
    >
      <div className="max-w-[900px] mx-auto text-center p-8 md:p-12">
        {/* Coming Soon Badge */}
        <div className="inline-block bg-pink-accent text-white px-4 py-[6px] rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
          COMING IN 2026
        </div>

        <h2 className="font-spartan font-semibold text-[24px] md:text-[28px] mb-4">
          Track Your WCS Journey
        </h2>

        <p className="text-base md:text-lg leading-relaxed mb-6">
          WCS isn't about memorizing patterns - it's about mastering principles.
          Our interactive skills tracker breaks down the core concepts
          (connection, rhythm, movement quality) so you always know what to work
          on next.
        </p>

        {submitted ? (
          <p className="text-lg font-medium text-pink-accent">
            Thanks! We'll notify you when it launches.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full max-w-[400px] px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-pink-accent focus:outline-none"
            />
            <button
              type="submit"
              className="bg-yellow-accent text-text-dark px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-accent/30"
            >
              Get Early Access
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
