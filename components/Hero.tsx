"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FeatureBlock from "./FeatureBlock";

export default function Hero() {
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const features = [
    {
      title: "Any Music",
      detail:
        "Dance to virtually any music - pop, R&B, blues, hip hop, you name it. WCS adapts to the music you already love.",
    },
    {
      title: "Flexible Connection",
      detail:
        "Flexible connection - we use both open and closed position for dynamic expression, creating the dance's signature elastic feel.",
    },
    {
      title: "No Syllabus",
      detail:
        "No rigid syllabus - just 5 basic patterns and endless creativity from there. The dance is grounded in principles, not memorized routines.",
    },
    {
      title: "Gender Neutral",
      detail:
        "Completely gender-neutral - anyone can lead or follow. Your role is your choice, not determined by identity.",
    },
    {
      title: "Social Inclusivity",
      detail:
        "At socials, everyone asks everyone - leads and follows both initiate dances. No implicit hierarchies or barriers to getting on the floor.",
    },
    {
      title: "Improv Contests",
      detail:
        "Competitions pair you with a random partner for a random song - pure improvisation. It's about skill, not choreography.",
    },
    {
      title: "True Partnership",
      detail:
        "True partnership - both dancers contribute equally to co-create each dance. It's collaboration, not dictation.",
    },
  ];

  const toggleFeature = (index: number) => {
    setExpandedFeature(expandedFeature === index ? null : index);
  };


  return (
    <section className="relative min-h-[80vh] md:min-h-[85vh] px-[5%] py-[60px] md:py-[80px] flex flex-col items-center justify-center">
      {/* Content */}
      <div className="relative z-10 max-w-[1100px] mx-auto text-center">

        {/* Headline */}
        <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] leading-tight mb-2">
          Between Mountain and Sea
        </h1>
        
        {/* Subheading - We Dance */}
        <h2 className="font-spartan font-medium text-[28px] md:text-[36px] leading-tight mb-4">
          We Dance
        </h2>
        {/* Dancers Image Above Title */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/dancers_black.png"
            alt="Silhouette of West Coast Swing dancers with Table Mountain in background"
            width={300}
            height={200}
            priority
            className="w-auto h-auto"
          />
        </div>

        {/* Subtitle with Gradient */}
        <h3
          className="font-spartan text-[22px] md:text-[28px] leading-tight mb-6"
          style={{
            background: "linear-gradient(90deg, #FFD117, #db409c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Your Music. Your Style.
        </h3>

        {/* Introduction Paragraph */}
        <p className="text-base md:text-lg leading-relaxed max-w-[700px] mx-auto mb-8">
          <span className="font-semibold">West Coast Swing</span> is a modern social dance built on connection, musicality, and
          improvisation. Join our small but growing community as we bring WCS to
          every corner of Cape Town.
        </p>

        {/* Feature Blocks Title */}
        <h3 className="text-xl font-medium mb-2">
          What makes West Coast Swing different?
        </h3>
        <p className="text-sm text-text-dark/70 mb-6">Click for more detail</p>

        {/* Feature Blocks Grid */}
        <div className="mb-10">
          {/* First Row - 5 blocks */}
          <div className="flex flex-wrap gap-3 justify-center mb-3">
          {features.slice(0, 5).map((feature, index) => (
              <FeatureBlock
                key={index}
                title={feature.title}
                index={index}
                isActive={expandedFeature === index}
                onToggle={() => toggleFeature(index)}
              />
            ))}
          </div>
          
          {/* Second Row - 2 blocks centered */}
          <div className="flex flex-wrap gap-3 justify-center mb-3">
          {features.slice(5, 7).map((feature, index) => (
              <FeatureBlock
                key={index + 5}
                title={feature.title}
                index={index + 5}
                isActive={expandedFeature === index + 5}
                onToggle={() => toggleFeature(index + 5)}
              />
            ))}
          </div>
          
          {/* Expanded Detail Area - shows under both rows */}
          {expandedFeature !== null && (
            <div className="overflow-hidden transition-all duration-300 py-5">
              <div className="bg-yellow-accent/20 rounded-xl p-6 max-w-[700px] mx-auto">
                <p className="text-sm md:text-base leading-relaxed text-center">
                  {features[expandedFeature].detail}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link href="/whats-on" className="bg-yellow-accent text-text-dark px-10 py-4 rounded-lg font-medium text-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-yellow-accent/30 w-full md:w-auto text-center">
            What&apos;s On
          </Link>
        </div>
      </div>
    </section>
  );
}
