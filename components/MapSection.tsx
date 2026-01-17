"use client";

import { useState } from "react";
import { getOrCreateSessionId } from "@/lib/sessionId";

export default function MapSection() {
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
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

  const learningFormats = [
    "Group Classes",
    "Occasional Bootcamps",
    "Just Socials",
    "Private Lessons",
    "Learn to Teach",
  ];

  const handleZoneToggle = (zone: string) => {
    setSelectedZones((prev) =>
      prev.includes(zone)
        ? prev.filter((z) => z !== zone)
        : [...prev, zone]
    );
  };

  const handleFormatToggle = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
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
          formats: selectedFormats,
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
          I'm Interested In...
        </h2>
        <p className="text-center text-sm text-text-dark/70 mb-8">
          (Choose all that apply)
        </p>

        {/* Learning Formats */}
        <div className="mb-8">
          <h3 className="font-semibold text-lg mb-3">What type of learning?</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {learningFormats.map((format) => (
              <button
                key={format}
                onClick={() => handleFormatToggle(format)}
                className={`
                  relative p-3 rounded-lg border-2 font-medium text-sm transition-all duration-200
                  ${
                    selectedFormats.includes(format)
                      ? "bg-pink-accent/20 border-pink-accent text-text-dark scale-105"
                      : "bg-white border-text-dark/20 hover:bg-pink-accent/10 hover:border-pink-accent"
                  }
                `}
              >
                {/* Checkbox Circle */}
                <div className={`
                  absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                  ${selectedFormats.includes(format) ? "bg-pink-accent border-pink-accent" : "border-gray-300"}
                `}>
                  {selectedFormats.includes(format) && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-1">Where in Cape Town?</h3>
          <p className="text-sm text-text-dark/70 mb-3">
            We're currently in <strong>Plumstead, Southern Suburbs</strong>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => handleZoneToggle(zone)}
              className={`
                relative p-3 rounded-lg border-2 font-medium text-sm transition-all duration-200
                ${
                  selectedZones.includes(zone)
                    ? "bg-yellow-accent/20 border-yellow-accent text-text-dark scale-105"
                    : "bg-white border-text-dark/20 hover:bg-yellow-accent/10 hover:border-yellow-accent"
                }
              `}
            >
              {/* Checkbox Circle */}
              <div className={`
                absolute top-2 right-2 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
                ${selectedZones.includes(zone) ? "bg-yellow-accent border-yellow-accent" : "border-gray-300"}
              `}>
                {selectedZones.includes(zone) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
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
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={(selectedZones.length === 0 && selectedFormats.length === 0) || isSubmitting}
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
