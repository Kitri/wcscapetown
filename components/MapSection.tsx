"use client";

import { useState } from "react";
import { getOrCreateSessionId } from "@/lib/sessionId";

export default function MapSection() {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const zones = [
    "City Bowl",
    "Northern Suburbs",
    "Atlantic Seaboard",
    "South Peninsula",
    "West Coast",
  ];

  const handleZoneToggle = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone)
        ? prev.filter((z) => z !== zone)
        : [...prev, zone]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const allZones = [...selectedZones];
      if (otherText.trim()) {
        allZones.push(`Other: ${otherText.trim()}`);
      }
      
      await fetch("/api/map-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          zones: allZones, 
          timestamp: new Date().toISOString(),
          sessionId: getOrCreateSessionId()
        }),
      });
      setSubmitted(true);
    } catch (error) {
      // Silently fail - error already logged server-side
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section 
        className="px-[5%] py-[60px] md:py-[60px] bg-cloud-dancer"
      >
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] mb-4">
            Thank you!
          </h2>
          <p className="text-lg">
            Your vote helps us plan where to expand next.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="px-[5%] py-[40px] md:py-[50px] bg-cloud-dancer"
    >
      <div className="max-w-[700px] mx-auto">
        <h2 className="font-spartan font-semibold text-[24px] md:text-[32px] text-center mb-2">
          Where Should We Dance Next?
        </h2>
        <p className="text-center mb-2">
          Help us plan 2026 satellite classes! Choose your neighborhood(s).
        </p>
        <p className="text-center text-sm text-text-dark/70 mb-2">
          (You can choose more than one option)
        </p>
        <p className="text-center text-sm mb-6">
          We're currently in <strong>Plumstead, Southern Suburbs</strong>
        </p>

        {/* Zone Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => handleZoneToggle(zone)}
              className={`
                p-4 rounded-lg border-2 font-medium transition-all duration-200
                ${
                  selectedZones.includes(zone)
                    ? "bg-yellow-accent/20 border-yellow-accent text-text-dark scale-105"
                    : "bg-white border-text-dark/20 hover:bg-yellow-accent/10 hover:border-yellow-accent"
                }
              `}
            >
              {zone}
            </button>
          ))}
        </div>
        
        {/* Other Option with Text Field */}
        <div className="mb-6">
          <label htmlFor="other-zone" className="block text-sm font-medium mb-2">
            Other location? Tell us where:
          </label>
          <input
            id="other-zone"
            type="text"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="e.g., Stellenbosch, Camps Bay..."
            className="w-full p-4 rounded-lg border-2 border-text-dark/20 focus:border-yellow-accent focus:outline-none bg-white"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={selectedZones.length === 0 || isSubmitting}
            className="bg-pink-accent text-white px-10 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-accent/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-95"
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
              "Submit"
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
