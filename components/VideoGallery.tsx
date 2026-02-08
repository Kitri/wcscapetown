"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type VideoItem = {
  label: string;
  url: string;
  note?: string;
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

function getEmbedSrc(url: string): { provider: "youtube" | "instagram" | "link"; src: string } {
  const yt = getYouTubeId(url);
  if (yt) {
    return { provider: "youtube", src: `https://www.youtube.com/embed/${yt}` };
  }

  const ig = getInstagramCode(url);
  if (ig) {
    return { provider: "instagram", src: `https://www.instagram.com/p/${ig}/embed` };
  }

  return { provider: "link", src: url };
}

function Modal({
  isOpen,
  title,
  children,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-text-dark/10">
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-text-dark/10">
          <p className="font-spartan font-semibold text-base md:text-lg truncate">{title}</p>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border-2 border-text-dark/10 hover:border-text-dark/20 hover:bg-text-dark/5 transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4 md:p-6 bg-black">{children}</div>
      </div>
    </div>
  );
}

export default function VideoGallery({
  videos,
}: {
  videos: VideoItem[];
}) {
  const [active, setActive] = useState<VideoItem | null>(null);

  const activeEmbed = useMemo(() => {
    if (!active) return null;
    return getEmbedSrc(active.url);
  }, [active]);

  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => {
          const ytId = getYouTubeId(v.url);
          const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
          const isInstagram = !!getInstagramCode(v.url);

          return (
            <button
              key={v.label}
              type="button"
              onClick={() => setActive(v)}
              className="text-left bg-white rounded-xl overflow-hidden border-2 border-text-dark/10 hover:border-text-dark/20 hover:shadow-lg transition-all"
            >
              <div className="relative w-full pb-[56.25%] bg-black">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={v.label}
                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/80 text-sm font-semibold">
                    {isInstagram ? "Instagram" : "Video"}
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="font-spartan font-semibold text-base mb-1">{v.label}</p>
                {v.note ? (
                  <p className="text-xs text-text-dark/60">{v.note}</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <Modal isOpen={!!active} title={active?.label ?? "Video"} onClose={close}>
        {activeEmbed?.provider === "youtube" ? (
          <div className="relative w-full pb-[56.25%]">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={activeEmbed.src}
              title={active?.label ?? "Video"}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : activeEmbed?.provider === "instagram" ? (
          <div className="w-full flex justify-center">
            <iframe
              className="w-full max-w-[520px] h-[80vh] max-h-[780px] bg-white rounded-lg"
              src={activeEmbed.src}
              title={active?.label ?? "Instagram"}
              loading="lazy"
            />
          </div>
        ) : active ? (
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-text-dark/80 mb-3">
              This link can&apos;t be embedded here.
            </p>
            <a
              href={active.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-accent hover:text-yellow-accent underline text-sm"
            >
              Open in a new tab
            </a>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
