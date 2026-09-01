"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Tab = { href: string; label: string; group?: string };

// Navegación entre secciones de Gestión.
// - Escritorio (lg+): barra lateral con las secciones agrupadas.
// - Móvil: un desplegable propio (estética webodas), no el <select> del sistema.
export function GestionNav({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  const actual = tabs.find((t) => t.href === pathname) ?? tabs[0];
  const groups = Array.from(new Set(tabs.map((t) => t.group ?? "Secciones")));

  return (
    <>
      <div className="lg:hidden">
        <SelectorSeccion tabs={tabs} actual={actual} />
      </div>

      <nav className="hidden lg:sticky lg:top-20 lg:block">
        {groups.map((group) => (
          <div key={group} className="mb-6 last:mb-0">
            <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-muted">
              {group}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {tabs
                .filter((t) => (t.group ?? "Secciones") === group)
                .map((t) => {
                  const active = pathname === t.href;
                  return (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        aria-current={active ? "page" : undefined}
                        className={`block rounded-lg px-3 py-2 text-sm transition ${
                          active
                            ? "bg-accent-soft font-medium text-accent-deep"
                            : "text-muted hover:bg-accent-soft/50 hover:text-foreground"
                        }`}
                      >
                        {t.label}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>
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
          {Array.from(new Set(tabs.map((t) => t.group ?? "Secciones"))).map((group) => (
            <li key={group}>
              <p className="px-3.5 pb-0.5 pt-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-muted">
                {group}
              </p>
              {tabs
                .filter((t) => (t.group ?? "Secciones") === group)
                .map((t) => {
                  const activo = t.href === actual.href;
                  return (
                    <button
                      key={t.href}
                      type="button"
                      role="option"
                      aria-selected={activo}
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
                  );
                })}
            </li>
          ))}
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
