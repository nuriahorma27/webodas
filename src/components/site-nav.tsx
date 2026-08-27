"use client";

import { useState } from "react";

export type NavLink = { label: string; href: string };

export function SiteNav({ title, links }: { title?: string; links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const items = (links ?? []).filter((l) => l.label);
  if (items.length === 0 && !title) return null;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "color-mix(in srgb, var(--wf-bg) 92%, transparent)",
        backdropFilter: "blur(6px)",
        borderBottom: "1px solid color-mix(in srgb, var(--wf-text) 12%, transparent)",
        fontFamily: "var(--wf-body)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <span style={{ fontFamily: "var(--wf-heading)", fontSize: 20, color: "var(--wf-accent)" }}>
          {title}
        </span>

        {/* Enlaces en escritorio */}
        <nav className="wf-nav-desktop" style={{ display: "flex", gap: 24 }}>
          {items.map((l, i) => (
            <a
              key={i}
              href={l.href || "#"}
              style={{ color: "var(--wf-text)", textDecoration: "none", fontSize: 14, letterSpacing: "0.04em" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Botón bocadillo en móvil */}
        <button
          className="wf-nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menú"
          style={{
            display: "none",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <span style={{ display: "block", width: 22, height: 2, background: "var(--wf-text)", margin: "4px 0" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--wf-text)", margin: "4px 0" }} />
          <span style={{ display: "block", width: 22, height: 2, background: "var(--wf-text)", margin: "4px 0" }} />
        </button>
      </div>

      {/* Menú desplegable en móvil */}
      {open && (
        <nav
          className="wf-nav-mobile"
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 24px 16px",
            gap: 4,
          }}
        >
          {items.map((l, i) => (
            <a
              key={i}
              href={l.href || "#"}
              onClick={() => setOpen(false)}
              style={{ color: "var(--wf-text)", textDecoration: "none", padding: "10px 0", fontSize: 15 }}
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}

      <style>{`
        @media (max-width: 720px) {
          .wf-nav-desktop { display: none !important; }
          .wf-nav-toggle { display: block !important; }
        }
        @media (min-width: 721px) {
          .wf-nav-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
