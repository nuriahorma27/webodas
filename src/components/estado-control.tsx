"use client";

import { ESTADOS, type Estado } from "@/lib/tareas";

// Colores pastel para cada estado.
export const ESTADO_DOT: Record<Estado, string> = {
  sin: "bg-slate-200",
  proceso: "bg-amber-200",
  hecho: "bg-emerald-300",
  descartada: "bg-rose-200",
};

export function EstadoControl({
  value,
  onChange,
}: {
  value: Estado;
  onChange: (e: Estado) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      {ESTADOS.map((e) => {
        const active = value === e.value;
        return (
          <button
            key={e.value}
            title={e.label}
            onClick={() => onChange(e.value)}
            className={`grid h-6 w-6 place-items-center rounded-full border transition ${
              active ? "border-neutral-800" : "border-transparent hover:border-neutral-300"
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${ESTADO_DOT[e.value]}`} />
          </button>
        );
      })}
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
