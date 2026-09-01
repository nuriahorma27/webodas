"use client";

import { useEffect, useRef, useState } from "react";
import { ESTADOS, type Estado } from "@/lib/tareas";

// Colores pastel para cada estado.
export const ESTADO_DOT: Record<Estado, string> = {
  sin: "bg-[#d7d2ca]",
  proceso: "bg-[#c7aa68]",
  hecho: "bg-[#66735e]",
};

const ESTADO_PILL: Record<Estado, string> = {
  sin: "border-[#d8d2c9] bg-[#f4f1ec] text-[#6d675f]",
  proceso: "border-[#d7c49b] bg-[#f4ecd9] text-[#745f32]",
  hecho: "border-[#b8c1af] bg-[#e8ede4] text-[#4f6049]",
};

export function EstadoControl({
  value,
  onChange,
}: {
  value: Estado;
  onChange: (e: Estado) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const actual = ESTADOS.find((e) => e.value === value) ?? ESTADOS[0];

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
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Estado: ${actual.label}. Pulsa para cambiarlo`}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex min-w-[7rem] items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:brightness-[.98] ${ESTADO_PILL[value]}`}
      >
        <span className={`h-2 w-2 shrink-0 rounded-full ${ESTADO_DOT[value]}`} />
        <span className="flex-1 text-left">{actual.label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-40 mt-1.5 min-w-[9rem] overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg"
        >
          {ESTADOS.map((e) => {
            const activo = e.value === value;
            return (
              <li key={e.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={activo}
                  onClick={() => {
                    onChange(e.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition hover:bg-accent-soft/50 ${
                    activo ? "font-medium text-foreground" : "text-muted"
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${ESTADO_DOT[e.value]}`} />
                  <span className="flex-1">{e.label}</span>
                  {activo && (
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function EstadoLeyenda() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {ESTADOS.map((e) => (
        <span key={e.value} className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-full ${ESTADO_DOT[e.value]}`} />
          {e.label}
        </span>
      ))}
    </div>
  );
}
