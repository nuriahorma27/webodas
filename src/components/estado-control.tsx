"use client";

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
  const index = ESTADOS.findIndex((estado) => estado.value === value);
  const actual = ESTADOS[index] ?? ESTADOS[0];
  const siguiente = ESTADOS[(index + 1) % ESTADOS.length];
  return (
    <button
      type="button"
      title={`Cambiar a ${siguiente.label.toLowerCase()}`}
      aria-label={`Estado: ${actual.label}. Cambiar a ${siguiente.label}`}
      onClick={() => onChange(siguiente.value)}
      className={`inline-flex min-w-[6.4rem] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition hover:brightness-[.98] ${ESTADO_PILL[value]}`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${ESTADO_DOT[value]}`} />
      {actual.label}
    </button>
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
