// "Save the date" (prototipo: se guarda en el navegador).
// Es una sola hoja: imagen movible + nombres + fecha, con color de fondo,
// color de letra y textura (liso o papel de boda).

export type TexturaStd = "liso" | "papel";

export type SaveTheDate = {
  publicada: boolean;
  titulo: string; // rótulo superior ("Save the date", "Reservad la fecha"…)
  nombres: string; // vacío → usa el nombre de la pareja del perfil
  fecha: string; // vacío → usa la fecha del perfil
  mensaje: string; // línea opcional bajo la fecha
  colorBg: string;
  colorText: string;
  textura: TexturaStd;
  imagen: string; // data URL
  imgEscala: number; // 0.3 – 2.5
  imgX: number; // desplazamiento en % (-60 – 60)
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
  textura: "papel",
  imagen: "",
  imgEscala: 1,
  imgX: 0,
  imgY: 0,
};

export function loadStd(): SaveTheDate {
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return { ...DEFAULT };
    return { ...DEFAULT, ...(JSON.parse(r) as Partial<SaveTheDate>) };
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

// Fondo con textura tipo papel (SVG con ruido, en data URI para el CSS).
export const PAPEL_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";
