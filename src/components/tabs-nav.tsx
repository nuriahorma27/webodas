"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Tab = { href: string; label: string; group?: string };

// Navegación entre secciones.
// - Móvil: un desplegable propio (estética webodas), no el <select> del sistema.
// - Escritorio: pestañas.
export function TabsNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  const actual = tabs.find((t) => t.href === pathname) ?? tabs[0];

  return (
    <>
      <div className="sm:hidden">
        <SelectorSeccion tabs={tabs} actual={actual} />
      </div>

      <div className="hidden gap-7 overflow-x-auto rounded-2xl border border-[#ddd4c7] bg-[#f3ede3] px-4 py-3 sm:flex">
        {Array.from(new Set(tabs.map((t) => t.group ?? "Secciones"))).map((group) => (
          <div key={group} className="shrink-0">
            <p className="mb-1.5 px-2 text-[.62rem] font-semibold uppercase tracking-[.18em] text-[#81786d]">{group}</p>
            <div className="flex gap-1">
        {tabs.filter((t) => (t.group ?? "Secciones") === group).map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition ${
                active
                  ? "bg-[#3d3933] text-white shadow-sm"
                  : "text-muted hover:bg-white/70 hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SelectorSeccion({ tabs, actual }: { tabs: Tab[]; actual: Tab }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const cerrar = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", cerrar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", cerrar);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-3.5 py-2.5 text-left text-sm font-medium text-foreground transition hover:border-accent"
      >
        <span>
          <span className="mr-2 text-xs font-normal uppercase tracking-[0.14em] text-muted">
            Sección
          </span>
          {actual.label}
        </span>
        <Chevron abierto={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-40 mt-1.5 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg"
        >
          {tabs.map((t) => {
            const activo = t.href === actual.href;
            return (
              <li key={t.href} role="option" aria-selected={activo}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    if (!activo) router.push(t.href);
                  }}
                  className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition ${
                    activo
                      ? "font-medium text-accent"
                      : "text-foreground hover:bg-accent-soft/50"
                  }`}
                >
                  {t.label}
                  {activo && <Check />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`shrink-0 text-muted transition-transform ${abierto ? "rotate-180" : ""}`}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
