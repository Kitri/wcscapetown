"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type VideoItem = {
  label: string;
  url: string;
  note?: string;
  thumbnailUrl?: string;
};

function getYouTubeId(url: string): string | null {
  const m1 = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m1) return m1[1];

  const m2 = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (m2) return m2[1];

  return null;
}

function getInstagramCode(url: string): string | null {
  const m = url.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)\/?/);
  return m ? m[1] : null;
}

function parseYouTubeStartSeconds(url: string): number | null {
  try {
    const u = new URL(url);
    const t = u.searchParams.get("t") ?? u.searchParams.get("start");
    if (!t) return null;

    // Common share format: t=18
    if (/^\d+$/.test(t)) return Number(t);

    // Handle t=1m02s
    const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!m) return null;

    const h = m[1] ? Number(m[1]) : 0;
    const min = m[2] ? Number(m[2]) : 0;
    const s = m[3] ? Number(m[3]) : 0;
    const total = h * 3600 + min * 60 + s;

    return total > 0 ? total : null;
  } catch {
    return null;
  }
}

function getEmbedSrc(url: string): { provider: "youtube" | "instagram" | "link"; src: string } {
  const yt = getYouTubeId(url);
  if (yt) {
    // Keep the page lightweight: only mount the iframe when the modal opens.
    const start = parseYouTubeStartSeconds(url);
    const startParam = start ? `&start=${start}` : "";

    return {
      provider: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0&modestbranding=1&playsinline=1${startParam}`,
    };
  }

  const ig = getInstagramCode(url);
  if (ig) {
    return {
      provider: "instagram",
      src: `https://www.instagram.com/p/${ig}/embed/captioned/`,
    };
  }

  return { provider: "link", src: url };
}


export default function VideoGallery({
  videos,
}: {
  videos: VideoItem[];
}) {
  const [active, setActive] = useState<VideoItem | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const activeEmbed = useMemo(() => {
    if (!active) return null;
    return getEmbedSrc(active.url);
  }, [active]);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    // When a thumbnail is clicked, bring the expanded player into view.
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active]);

  return (
    <div>
      {active ? (
        <div
          ref={playerRef}
          className="mb-6 bg-white rounded-xl border-2 border-text-dark/10 overflow-hidden scroll-mt-[140px]"
        >
          <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-text-dark/10">
            <div className="min-w-0">
              <p className="font-spartan font-semibold text-sm md:text-base truncate">
                {active.label}
              </p>
              {active.note ? (
                <p className="text-xs text-text-dark/60 mt-1">{active.note}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border-2 border-text-dark/10 hover:border-text-dark/20 hover:bg-text-dark/5 transition-colors text-sm font-semibold"
              onClick={close}
            >
              Close
            </button>
          </div>

          <div className="bg-black">
            {activeEmbed?.provider === "youtube" ? (
              <div className="relative w-full aspect-video">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={activeEmbed.src}
                  title={active.label}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : activeEmbed?.provider === "instagram" ? (
              <div className="w-full flex justify-center p-3">
                <iframe
                  className="w-full max-w-[520px] h-[70vh] max-h-[720px] bg-white rounded-lg"
                  src={activeEmbed.src}
                  title={active.label}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="p-4 bg-white">
                <p className="text-sm text-text-dark/80 mb-3">This link can&apos;t be embedded here.</p>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-text-dark/10 bg-white">
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-accent hover:text-yellow-accent underline text-sm font-semibold"
            >
              {activeEmbed?.provider === "instagram" ? "Open on Instagram" : "Open on YouTube"}
            </a>
            <p className="text-xs text-text-dark/60 mt-2">
              If you see “Video unavailable”, that video is likely blocked from embedding — use the link above.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => {
          const ytId = getYouTubeId(v.url);
          const thumb = v.thumbnailUrl ?? (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);
          const isInstagram = !!getInstagramCode(v.url);

          const isActive = active?.url === v.url && active?.label === v.label;

          return (
            <button
              key={v.label}
              type="button"
              onClick={() => setActive(isActive ? null : v)}
              aria-pressed={isActive}
              className={`text-left bg-white rounded-xl overflow-hidden border-2 transition-all ${
                isActive
                  ? "border-pink-accent shadow-lg"
                  : "border-text-dark/10 hover:border-text-dark/20 hover:shadow-lg"
              }`}
            >
              <div className="relative w-full aspect-video bg-black">
                {thumb ? (
                  <>
                    <Image
                      src={thumb}
                      alt={v.label}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg">
                        ▶
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm font-semibold">
                    {isInstagram ? "Instagram" : "Video"}
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-spartan font-semibold text-base mb-1">{v.label}</p>
                {v.note ? <p className="text-xs text-text-dark/60">{v.note}</p> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
