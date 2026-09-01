// "Save the date" (prototipo: se guarda en el navegador).
// Una sola hoja: imagen movible + textos, con color de fondo, color de letra,
// acabado del fondo, tipografía y posición del texto.

import type { CSSProperties } from "react";

export type AcabadoStd = "liso" | "papel";
export type FuenteStd = "serif" | "sans" | "script";
export type PosTextoStd = "arriba" | "centro" | "abajo";
export type MarcoStd = "ninguno" | "limonero" | "olivo" | "silvestre" | "azahar" | "eucalipto";

export type SaveTheDate = {
  publicada: boolean;
  titulo: string; // rótulo superior ("Save the date", "Reservad la fecha"…)
  nombres: string; // vacío → usa el nombre de la pareja del perfil
  fecha: string; // vacío → usa la fecha del perfil
  mensaje: string; // línea opcional bajo la fecha
  colorBg: string;
  colorText: string;
  colorMarco: string;
  colorFrutos: string;
  marco: MarcoStd;
  tamMarco: number;
  margenMarco: number;
  acabado: AcabadoStd;
  fuente: FuenteStd;
  negrita: boolean;
  cursiva: boolean;
  mayusculas: boolean;
  tamNombres: number; // escala del nombre 0.7 – 1.8
  posTexto: PosTextoStd;
  textoX: number;
  textoY: number;
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
  colorMarco: "#6f7650",
  colorFrutos: "#c79a46",
  marco: "ninguno",
  tamMarco: 1,
  margenMarco: 1.5,
  acabado: "papel",
  fuente: "serif",
  negrita: false,
  cursiva: false,
  mayusculas: false,
  tamNombres: 1,
  posTexto: "abajo",
  textoX: 0,
  textoY: 0,
  imagen: "",
  imgEscala: 1,
  imgX: 0,
  imgY: 0,
};

let override: SaveTheDate | null = null;
export function setStdOverride(s: SaveTheDate | null) {
  override = s ? { ...DEFAULT, ...s } : null;
}

export function loadStd(): SaveTheDate {
  if (override) return override;
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return { ...DEFAULT };
    const c = JSON.parse(r) as Partial<SaveTheDate> & { textura?: string };
    const acabado = (c.acabado ?? c.textura ?? DEFAULT.acabado) as AcabadoStd;
    const marco = c.marco && MARCOS[c.marco] ? c.marco : DEFAULT.marco;
    const tamMarco = Math.max(0.65, Math.min(1.12, c.tamMarco ?? DEFAULT.tamMarco));
    return { ...DEFAULT, ...c, acabado: ACABADOS[acabado] ? acabado : DEFAULT.acabado, marco, tamMarco };
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

export const ACABADOS: Record<AcabadoStd, { label: string; style: CSSProperties }> = {
  liso: { label: "Papel liso", style: {} },
  papel: {
    label: "Papel rugoso",
    style: {
      backgroundImage: `url("/textures/papel-algodon.png")`,
      backgroundSize: "450px 450px",
      backgroundBlendMode: "multiply",
      boxShadow: "inset 0 0 60px rgba(83,65,37,.06)",
    },
  },
};

export const MARCOS: Record<MarcoStd, { label: string; hojas: string; frutos: string; detalle: string }> = {
  ninguno: { label: "Ninguno", hojas: "", frutos: "", detalle: "" },
  limonero: { label: "Limonero", hojas: "/frames/limonero-hojas.png", frutos: "/frames/limonero-frutos.png", detalle: "/frames/limonero-detalle.png" },
  olivo: { label: "Olivo", hojas: "/frames/olivo-hojas.png", frutos: "/frames/olivo-frutos.png", detalle: "/frames/olivo-detalle.png" },
  silvestre: { label: "Flores", hojas: "/frames/flores-silvestres-hojas.png", frutos: "/frames/flores-silvestres-frutos.png", detalle: "/frames/flores-silvestres-detalle.png" },
  azahar: { label: "Azahar", hojas: "/frames/azahar-hojas.png", frutos: "/frames/azahar-frutos.png", detalle: "/frames/azahar-detalle.png" },
  eucalipto: { label: "Eucalipto", hojas: "/frames/eucalipto-hojas.png", frutos: "/frames/eucalipto-frutos.png", detalle: "/frames/eucalipto-detalle.png" },
};

export const FUENTES: Record<FuenteStd, { label: string; family: string }> = {
  serif: { label: "Elegante", family: "var(--font-cormorant), Georgia, serif" },
  sans: { label: "Editorial", family: "var(--font-bodoni), Didot, serif" },
  script: { label: "Caligráfica", family: "var(--font-parisienne), 'Snell Roundhand', cursive" },
};

/* ---------- puntos de partida ---------- */
// Cada preset fija todo el "look" de la hoja. La pareja lo elige y luego ajusta.

export type StdPreset = { id: string; label: string; nota: string; props: Partial<SaveTheDate> };

export const PRESETS: StdPreset[] = [
  {
    id: "clasico",
    label: "Clásico",
    nota: "Serif sobrio, sin adornos.",
    props: {
      colorBg: "#f6f2e9", colorText: "#33302a", marco: "ninguno", acabado: "papel",
      fuente: "serif", posTexto: "centro", tamNombres: 1, negrita: false, cursiva: false,
      mayusculas: false, imagen: "", textoX: 0, textoY: 0,
    },
  },
  {
    id: "azahar",
    label: "Azahar",
    nota: "Cenefa de azahar, tono cálido.",
    props: {
      colorBg: "#faf5ea", colorText: "#4b4636", marco: "azahar", colorMarco: "#8a9a5b",
      colorFrutos: "#d59a3f", tamMarco: 1, margenMarco: 1.5, acabado: "papel",
      fuente: "serif", posTexto: "abajo", tamNombres: 1.05, cursiva: true,
      mayusculas: false, imagen: "", textoX: 0, textoY: 0,
    },
  },
  {
    id: "olivo",
    label: "Olivo",
    nota: "Verde eucalipto, cenefa de olivo.",
    props: {
      colorBg: "#eef0e7", colorText: "#33372f", marco: "olivo", colorMarco: "#4b5a3f",
      colorFrutos: "#7d6a3a", tamMarco: 1, margenMarco: 1.5, acabado: "papel",
      fuente: "serif", posTexto: "abajo", tamNombres: 1, cursiva: false,
      mayusculas: false, imagen: "", textoX: 0, textoY: 0,
    },
  },
  {
    id: "acuarela",
    label: "Acuarela",
    nota: "Con una ilustración de fondo.",
    props: {
      colorBg: "#e9e3d6", colorText: "#3a342b", marco: "ninguno", acabado: "liso",
      fuente: "serif", posTexto: "abajo", tamNombres: 1.1, cursiva: true, mayusculas: false,
      imagen: "/demo/quinta.jpg", imgEscala: 1.5, imgX: 0, imgY: -8, textoX: 0, textoY: 0,
    },
  },
  {
    id: "editorial",
    label: "Editorial",
    nota: "Didone en mayúsculas, blanco y negro.",
    props: {
      colorBg: "#ffffff", colorText: "#161616", marco: "ninguno", acabado: "liso",
      fuente: "sans", posTexto: "centro", tamNombres: 0.95, negrita: false, cursiva: false,
      mayusculas: true, imagen: "", textoX: 0, textoY: 0,
    },
  },
];
