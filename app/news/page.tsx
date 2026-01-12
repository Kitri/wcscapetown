"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Image from "next/image";

export default function News() {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  return (
    <>
      <Header />
      
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-yellow-accent transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            ×
          </button>
          <Image
            src={lightboxImage}
            alt="Enlarged photo"
            width={1200}
            height={900}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <main>
        {/* Hero Section */}
        <section className="px-[5%] py-[40px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto text-center">
            <h1 className="font-spartan font-semibold text-[36px] md:text-[52px] mb-4">
              Highlights
            </h1>
            <p className="text-lg md:text-xl text-text-dark/80">
              Stories from our WCS community
            </p>
          </div>
        </section>

        {/* Harold Baker Weekender - Featured Article */}
        <section 
          className="px-[5%] py-[50px]"
          style={{
            background: "linear-gradient(135deg, rgba(255, 209, 23, 0.15), rgba(255, 209, 23, 0.05))",
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block bg-pink-accent text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider mb-4">
                Past Event
              </div>
              <h2 className="font-spartan font-semibold text-[28px] md:text-[36px] mb-2">
                WCS Weekender with Harold
              </h2>
              <p className="text-text-dark/70">April 2025</p>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-white rounded-xl p-8 md:p-12 mb-8 text-center shadow-sm">
              <p className="text-xl md:text-2xl font-semibold mb-4">
                Full recap coming soon!
              </p>
              <p className="text-base md:text-lg text-text-dark/80">
                We're putting together photos, videos, and stories from this incredible weekend with international WCS All Star Harold Baker.
              </p>
            </div>

            {/* Event Poster */}
            <div className="mb-8">
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mb-4 text-center">
                The Schedule
              </h3>
              <div className="bg-white rounded-xl p-4 shadow-sm max-w-[600px] mx-auto">
                <Image
                  src="/images/Harold Poster.jpg"
                  alt="Harold Baker Weekender Schedule"
                  width={600}
                  height={750}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>

            {/* Class Photos */}
            <div>
              <h3 className="font-spartan font-semibold text-xl md:text-2xl mb-4 text-center">
                The Weekend
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <button
                    onClick={() => setLightboxImage("/images/Class photo.jpeg")}
                    className="w-full cursor-zoom-in hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src="/images/Class photo.jpeg"
                      alt="Harold Baker Weekender Class Photo 1"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg"
                    />
                  </button>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <button
                    onClick={() => setLightboxImage("/images/Class 2.jpeg")}
                    className="w-full cursor-zoom-in hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src="/images/Class 2.jpeg"
                      alt="Harold Baker Weekender Class Photo 2"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-lg"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Articles Coming Soon */}
        <section className="px-[5%] py-[50px] bg-cloud-dancer">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="text-lg text-text-dark/70">
              More stories from our community coming soon...
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
