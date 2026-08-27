"use client";

import { FieldLabel } from "@measured/puck";

export type StyleOption = { value: string; label: string; icon: React.ReactNode };

export function StylePicker({
  value,
  onChange,
  options,
  label,
}: {
  value?: string;
  onChange: (value: string) => void;
  options: StyleOption[];
  label?: string;
}) {
  return (
    <FieldLabel label={label ?? "Estilo"}>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`rounded-lg border p-2 text-left transition ${
                active
                  ? "border-neutral-900 bg-neutral-50"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              <div className="mb-1.5 grid h-12 w-full place-items-center text-neutral-500">
                {o.icon}
              </div>
              <span className="text-xs font-medium leading-tight">{o.label}</span>
            </button>
          );
        })}
      </div>
    </FieldLabel>
  );
}

const S = ({ children }: { children: React.ReactNode }) => (
  <svg width="56" height="40" viewBox="0 0 56 40" fill="none" stroke="currentColor" strokeWidth="1.6">
    {children}
  </svg>
);

export const LIST_STYLE_ICONS: Record<string, React.ReactNode> = {
  tarjetas: (
    <S>
      <rect x="3" y="8" width="14" height="24" rx="2" />
      <rect x="21" y="8" width="14" height="24" rx="2" />
      <rect x="39" y="8" width="14" height="24" rx="2" />
    </S>
  ),
  carrusel: (
    <S>
      <rect x="14" y="8" width="28" height="24" rx="2" />
      <path d="M8 20h-4M52 20h-4" />
      <path d="M6 16l-3 4 3 4M50 16l3 4-3 4" />
    </S>
  ),
  "lista-fotos": (
    <S>
      <rect x="4" y="6" width="12" height="10" rx="1" />
      <path d="M20 8h32M20 13h24" />
      <rect x="4" y="24" width="12" height="10" rx="1" />
      <path d="M20 26h32M20 31h24" />
    </S>
  ),
  "lista-linea": (
    <S>
      <path d="M10 4v32" />
      <circle cx="10" cy="11" r="2.5" fill="currentColor" />
      <circle cx="10" cy="29" r="2.5" fill="currentColor" />
      <path d="M18 9h30M18 14h20M18 27h30M18 32h20" />
    </S>
  ),
  cronologia: (
    <S>
      <path d="M16 4v32" />
      <circle cx="16" cy="12" r="2.5" fill="currentColor" />
      <circle cx="16" cy="28" r="2.5" fill="currentColor" />
      <path d="M4 12h6M4 28h6" />
      <path d="M22 10h28M22 26h28" />
    </S>
  ),
};

export const AGENDA_STYLE_ICONS: Record<string, React.ReactNode> = {
  lista: (
    <S>
      <path d="M8 10h6M20 10h28M8 20h6M20 20h28M8 30h6M20 30h28" />
    </S>
  ),
  linea: (
    <S>
      <path d="M16 4v32" />
      <circle cx="16" cy="10" r="2.5" fill="currentColor" />
      <circle cx="16" cy="20" r="2.5" fill="currentColor" />
      <circle cx="16" cy="30" r="2.5" fill="currentColor" />
      <path d="M4 10h6M4 20h6M4 30h6M22 10h28M22 20h28M22 30h28" />
    </S>
  ),
  foto: (
    <S>
      <rect x="4" y="8" width="18" height="24" rx="2" />
      <path d="M28 12h24M28 20h24M28 28h24" />
    </S>
  ),
};
