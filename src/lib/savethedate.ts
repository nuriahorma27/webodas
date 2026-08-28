// "Save the date" (prototipo: se guarda en el navegador).
// Una sola hoja: imagen movible + textos, con color de fondo, color de letra,
// acabado del fondo, tipografía y posición del texto.

import type { CSSProperties } from "react";

export type AcabadoStd = "liso" | "papel" | "lino" | "kraft" | "puntos";
export type FuenteStd = "serif" | "sans" | "script";
export type PosTextoStd = "arriba" | "centro" | "abajo";

export type SaveTheDate = {
  publicada: boolean;
  titulo: string; // rótulo superior ("Save the date", "Reservad la fecha"…)
  nombres: string; // vacío → usa el nombre de la pareja del perfil
  fecha: string; // vacío → usa la fecha del perfil
  mensaje: string; // línea opcional bajo la fecha
  colorBg: string;
  colorText: string;
  acabado: AcabadoStd;
  fuente: FuenteStd;
  negrita: boolean;
  mayusculas: boolean;
  tamNombres: number; // escala del nombre 0.7 – 1.8
  posTexto: PosTextoStd;
  imagen: string; // data URL
  imgEscala: number; // 0.3 – 2.5
  imgX: number; // desplazamiento en % (-70 – 70)
  imgY: number;
};

const KEY = "webodas:savethedate";

const DEFAULT: SaveTheDate = {
  publicada: false,
  titulo: "Save the date",
  nombres: "",
  fecha: "",
  mensaje: "",
  colorBg: "#f4efe6",
  colorText: "#3a342b",
  acabado: "papel",
  fuente: "serif",
  negrita: false,
  mayusculas: false,
  tamNombres: 1,
  posTexto: "abajo",
  imagen: "",
  imgEscala: 1,
  imgX: 0,
  imgY: 0,
};

export function loadStd(): SaveTheDate {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return { ...DEFAULT };
    const c = JSON.parse(r) as Partial<SaveTheDate> & { textura?: string };
    const acabado = (c.acabado ?? c.textura ?? DEFAULT.acabado) as AcabadoStd;
    return { ...DEFAULT, ...c, acabado: ACABADOS[acabado] ? acabado : DEFAULT.acabado };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveStd(s: SaveTheDate) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new Event("webodas:savethedate"));
  } catch {
    /* noop */
  }
}

export function setStd(patch: Partial<SaveTheDate>) {
  saveStd({ ...loadStd(), ...patch });
}

export function stdConfigurada(s: SaveTheDate): boolean {
  return s.publicada || Boolean(s.imagen) || Boolean(s.nombres) || Boolean(s.mensaje);
}

/* ---------- acabados del fondo ---------- */

const noise = (op: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${op} 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const ACABADOS: Record<AcabadoStd, { label: string; style: CSSProperties }> = {
  liso: { label: "Liso", style: {} },
  papel: {
    // Papel verjurado de gramaje: líneas finas verticales (corondeles),
    // líneas horizontales más separadas (puntizones), grano y sombra suave.
    label: "Papel verjurado",
    style: {
      backgroundImage: `${noise(0.045)}, repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(0,0,0,.028) 0 1px, transparent 1px 22px)`,
      backgroundBlendMode: "multiply, normal, normal",
      boxShadow: "inset 0 0 70px rgba(0,0,0,.07)",
    },
  },
  lino: {
    label: "Lino",
    style: {
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,.035) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.035) 0 1px, transparent 1px 3px)`,
    },
  },
  kraft: {
    label: "Papel kraft",
    style: {
      backgroundImage: `${noise(0.09)}, linear-gradient(180deg, rgba(120,90,50,.10), rgba(120,90,50,.03))`,
      backgroundBlendMode: "multiply, normal",
    },
  },
  puntos: {
    label: "Puntitos",
    style: {
      backgroundImage: `radial-gradient(rgba(0,0,0,.10) 1px, transparent 1.4px)`,
      backgroundSize: "14px 14px",
    },
  },
};

export const FUENTES: Record<FuenteStd, { label: string; family: string }> = {
  serif: { label: "Elegante", family: "var(--font-cormorant), Georgia, serif" },
  sans: { label: "Moderna", family: "var(--font-geist-sans), system-ui, sans-serif" },
  script: { label: "Manuscrita", family: "'Great Vibes', 'Snell Roundhand', cursive" },
};
