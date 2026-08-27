"use client";

import { useRef } from "react";

type Slide = { src: string; caption?: string; linkUrl?: string };

export function SiteCarousel({ slides }: { slides: Slide[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pics = (slides ?? []).filter((s) => s.src);
  if (pics.length === 0) return null;

  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", maxWidth: 1200, margin: "40px auto", padding: "0 56px" }}>
      <div
        ref={ref}
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {pics.map((s, i) => {
          const media = (
            <div style={{ position: "relative", width: "100%", height: 300 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.caption ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, display: "block" }}
              />
              {s.caption && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "40px 20px 16px",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                    color: "#fff",
                    fontSize: 18,
                    borderRadius: "0 0 4px 4px",
                  }}
                >
                  {s.caption}
                  {s.linkUrl ? " →" : ""}
                </span>
              )}
            </div>
          );
          return (
            <div
              key={i}
              style={{ flex: "0 0 clamp(240px, 32%, 380px)", scrollSnapAlign: "start" }}
            >
              {s.linkUrl ? (
                <a href={s.linkUrl} style={{ display: "block", textDecoration: "none" }}>
                  {media}
                </a>
              ) : (
                media
              )}
            </div>
          );
        })}
      </div>
      {pics.length > 1 && (
        <>
          <button onClick={() => scroll(-1)} style={arrow("left")} aria-label="Anterior">
            ‹
          </button>
          <button onClick={() => scroll(1)} style={arrow("right")} aria-label="Siguiente">
            ›
          </button>
        </>
      )}
    </div>
  );
}

const arrow = (side: "left" | "right"): React.CSSProperties => ({
  position: "absolute",
  top: "50%",
  [side]: 8,
  transform: "translateY(-50%)",
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.9)",
  fontSize: 24,
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
});
