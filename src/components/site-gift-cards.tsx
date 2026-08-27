"use client";

import { useEffect, useState } from "react";
import { loadLista, type Gift } from "@/lib/regalos";

export function SiteGiftCards() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  useEffect(() => {
    const sync = () => setGifts(loadLista().gifts);
    sync();
    window.addEventListener("webodas:regalos", sync);
    return () => window.removeEventListener("webodas:regalos", sync);
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: 20,
        maxWidth: 960,
        margin: "32px auto 0",
      }}
    >
      {gifts.map((g) => {
        const pct = g.objetivo ? Math.min(100, (g.aportado / g.objetivo) * 100) : 60;
        return (
          <div
            key={g.id}
            style={{
              border: "1px solid color-mix(in srgb, var(--wf-text) 15%, transparent)",
              borderRadius: 6,
              overflow: "hidden",
              textAlign: "left",
            }}
          >
            <div
              style={{
                height: 170,
                background: "color-mix(in srgb, var(--wf-accent) 12%, transparent)",
              }}
            >
              {g.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.imagen}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
            </div>
            <div style={{ padding: "10px 12px 12px" }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.3,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  minHeight: "2.6em",
                }}
              >
                {g.nombre}
              </p>
              <p style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>{g.tipo}</p>
              {g.objetivo > 0 && (
                <div
                  style={{
                    height: 4,
                    borderRadius: 4,
                    background: "color-mix(in srgb, var(--wf-accent) 15%, transparent)",
                  }}
                >
                  <div
                    style={{ width: `${pct}%`, height: "100%", borderRadius: 4, background: "var(--wf-accent)" }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
