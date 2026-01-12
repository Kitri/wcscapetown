"use client";

import { useState, FormEvent } from "react";
import { getOrCreateSessionId } from "@/lib/sessionId";

export default function PreferencesPoll() {
  const [selectedLearning, setSelectedLearning] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const learningOptions = [
    "3-Hour Saturday Bootcamp",
    "Weekly Group Classes + Socials",
    "Teacher workshop so I can teach at my local dance studio",
  ];

  const eventOptions = [
    "Weekender with high-level international teachers",
    "Affordable Local Weekender",
    "Single day of workshops only (local)",
  ];

  const handleLearningChange = (value: string) => {
    setSelectedLearning((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleEventsChange = (value: string) => {
    setSelectedEvents((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) {
      localStorage.setItem("pollEmail", value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data = {
      learning: selectedLearning,
      events: selectedEvents,
      email: email || null,
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
    }
  };

  if (submitted) {
    return (
      <section
        id="preferences"
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
            Your input helps us build the WCS community Cape Town deserves.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="preferences"
      className="px-[5%] py-[40px] md:py-[50px]"
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
      }}
    >
      <div className="max-w-[1000px] mx-auto">
        <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] text-center mb-2">
          Help Us Shape 2026! ✨
        </h2>
        <p className="text-center text-lg mb-2">
          We're planning big things. What sounds most like you?
        </p>
        <p className="text-center text-sm text-text-dark/70 mb-8">
          (You can choose more than one option)
        </p>

        <form onSubmit={handleSubmit}>
          {/* Question 1: Learning Format */}
          <div className="mb-8">
            <h3 className="font-medium text-xl mb-4">
              I want to learn WCS via...
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {learningOptions.map((option) => (
                <label
                  key={option}
                  className={`
                    block border-[3px] rounded-xl p-6 cursor-pointer transition-all duration-250
                    ${
                      selectedLearning.includes(option)
                        ? "bg-yellow-accent/20 border-yellow-accent text-text-dark"
                        : "bg-white border-gray-200 hover:border-yellow-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-accent/20"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedLearning.includes(option)}
                    onChange={(e) => handleLearningChange(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 2: Event Preferences */}
          <div className="mb-8">
            <h3 className="font-medium text-xl mb-4">What draws you more?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {eventOptions.map((option) => (
                <label
                  key={option}
                  className={`
                    block border-[3px] rounded-xl p-6 cursor-pointer transition-all duration-250
                    ${
                      selectedEvents.includes(option)
                        ? "bg-yellow-accent/20 border-yellow-accent text-text-dark"
                        : "bg-white border-gray-200 hover:border-yellow-accent hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-accent/20"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    value={option}
                    checked={selectedEvents.includes(option)}
                    onChange={(e) => handleEventsChange(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-medium">{option}</span>
                </label>
              ))}
            </div>
            <p className="text-sm mt-3 text-text-dark/70">
              A weekender is a weekend of workshops with socials.{" "}
              <a
                href="/news"
                className="text-pink-accent hover:text-yellow-accent underline"
              >
                See our 2025 weekender with Harold Baker →
              </a>
            </p>
          </div>

          {/* Email Capture */}
          <div className="mb-6 text-center">
            <label
              htmlFor="email"
              className="block text-base mb-2 font-medium"
            >
              Stay updated on 2026 plans (optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="your@email.com"
              className="w-full max-w-[400px] px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-yellow-accent focus:outline-none mx-auto"
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={selectedLearning.length === 0 && selectedEvents.length === 0}
              className="bg-pink-accent text-white px-10 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-accent/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Share Your Preferences
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
