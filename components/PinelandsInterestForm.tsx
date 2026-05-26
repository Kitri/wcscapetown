"use client";

import { useState, FormEvent } from "react";

const EXPERIENCE_OPTIONS = [
  "New to WCS",
  "Never done WCS",
  "Experienced WCS dancer",
  "An out of town visitor",
];

export default function PinelandsInterestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/pinelands-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          experience,
          comments: comments.trim(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-lg font-semibold text-purple-accent mb-1">
          Thanks for letting us know! 🎉
        </p>
        <p className="text-base text-text-dark/70">
          We&apos;ll reach out when Tuesday classes are back on.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="pinelands-name" className="block text-sm font-medium mb-1 text-text-dark/80">
          Name <span className="text-text-dark/40 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          id="pinelands-name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-purple-accent focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="pinelands-email" className="block text-sm font-medium mb-1 text-text-dark/80">
          Email <span className="text-pink-accent">*</span>
        </label>
        <input
          type="email"
          id="pinelands-email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-purple-accent focus:outline-none"
        />
      </div>
      <div>
        <p className="block text-sm font-medium mb-2 text-text-dark/80">I am...</p>
        <div className="flex flex-col gap-2">
          {EXPERIENCE_OPTIONS.map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="experience"
                value={option}
                checked={experience === option}
                onChange={() => setExperience(option)}
                className="w-4 h-4 accent-purple-accent cursor-pointer"
              />
              <span className="text-sm text-text-dark/80 group-hover:text-text-dark transition-colors">
                {option}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="pinelands-comments" className="block text-sm font-medium mb-1 text-text-dark/80">
          Anything else? <span className="text-text-dark/40 font-normal">(optional)</span>
        </label>
        <textarea
          id="pinelands-comments"
          name="comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Any questions, preferences, or other thoughts..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white focus:border-purple-accent focus:outline-none resize-none"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-purple-accent text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-accent/30 disabled:opacity-50 active:scale-95"
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
          "Count me in!"
        )}
      </button>
    </form>
  );
}
