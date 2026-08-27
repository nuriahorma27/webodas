"use client";

import { useRef } from "react";
import { parseInline } from "@/lib/rich-text";

export type StripCard = {
  image?: string;
  eyebrow?: string;
  itemTitle?: string;
  text?: string;
  linkLabel?: string;
  linkUrl?: string;
};

export function CardStrip({ cards }: { cards: StripCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const list = (cards ?? []).filter((c) => c.itemTitle || c.image || c.text);
  if (list.length === 0) return null;

  const scroll = (dir: number) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", maxWidth: 1240, margin: "0 auto", padding: "0 52px" }}>
      <div
        ref={ref}
        style={{
          display: "flex",
          gap: 28,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          paddingBottom: 8,
        }}
      >
        {list.map((c, i) => {
          const inner = (
            <>
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt=""
                  style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 240,
                    background: "color-mix(in srgb, var(--wf-accent) 12%, transparent)",
                  }}
                />
              )}
              <div style={{ padding: "22px 24px 26px" }}>
                {c.eyebrow && (
                  <p
                    style={{
                      fontSize: 12,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--wf-accent)",
                      marginBottom: 8,
                      fontWeight: 600,
                    }}
                  >
                    {parseInline(c.eyebrow)}
                  </p>
                )}
                <h3
                  style={{
                    fontFamily: "var(--wf-heading)",
                    fontSize: "calc(23px * var(--wf-scale, 1))",
                    fontWeight: 500,
                    marginBottom: 8,
                  }}
                >
                  {parseInline(c.itemTitle)}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.82, whiteSpace: "pre-wrap" }}>
                  {parseInline(c.text)}
                </p>
                {c.linkLabel && (
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--wf-accent)",
                    }}
                  >
                    {c.linkLabel} →
                  </span>
                )}
              </div>
            </>
          );
          const style: React.CSSProperties = {
            flex: "0 0 clamp(260px, 30%, 340px)",
            scrollSnapAlign: "start",
            background: "#fff",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 18px 40px -24px rgba(0,0,0,0.35)",
            textDecoration: "none",
            color: "inherit",
          };
          return c.linkUrl ? (
            <a key={i} href={c.linkUrl} style={style}>
              {inner}
            </a>
          ) : (
            <div key={i} style={style}>
              {inner}
            </div>
          );
        })}
      </div>
      {list.length > 1 && (
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
  [side]: 6,
  transform: "translateY(-50%)",
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.95)",
  fontSize: 22,
  lineHeight: 1,
  cursor: "pointer",
  boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
});
