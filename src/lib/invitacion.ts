// Invitación de boda "clásica de toda la vida" (prototipo: en el navegador).
// Formato tradicional: padres en las esquinas, participación en el centro.

import type { AcabadoStd, MarcoStd } from "@/lib/savethedate";
import { ACABADOS, MARCOS } from "@/lib/savethedate";

export { ACABADOS, MARCOS };
export type { AcabadoStd, MarcoStd };

// Tipografías de invitación (todas de imprenta / caligráficas clásicas).
export type FuenteInv = "imprenta" | "formal" | "elegante" | "manuscrita" | "fina";
export const FUENTES_INV: Record<
  FuenteInv,
  { label: string; family: string; escala: number }
> = {
  imprenta: { label: "Imprenta", family: "'Pinyon Script', 'Snell Roundhand', cursive", escala: 1.55 },
  formal: { label: "Formal", family: "'Petit Formal Script', cursive", escala: 1.3 },
  elegante: { label: "Elegante", family: "'Cormorant Garamond', Georgia, serif", escala: 1 },
  manuscrita: { label: "Manuscrita", family: "'Parisienne', cursive", escala: 1.35 },
  fina: { label: "Fina", family: "'Tangerine', cursive", escala: 1.7 },
};

export type Invitacion = {
  publicada: boolean;
  padresNovia: string; // "Juan Hormaechea Escós\nPilar Pérez del Yerro Núñez"
  direccionNovia: string; // "Calle de Mateo Inurria 35, 2B,\n28036, Madrid"
  padresNovio: string;
  direccionNovio: string;
  participan: string; // "Participan el enlace de sus hijos"
  nombres: string; // "Nuria y Javier"  (vacío → nombre de la pareja del perfil)
  cuerpo: string; // párrafo de ceremonia y celebración (multilínea)
  src: string; // "S. R. C."
  ciudadAno: string; // "Madrid, 2025"  (vacío → ciudad del perfil + año)
  colorBg: string;
  colorText: string;
  acabado: AcabadoStd;
  fuente: FuenteInv;
  marco: MarcoStd;
  colorMarco: string;
  colorFrutos: string;
};

const KEY = "webodas:invitacion";

const CUERPO_EJEMPLO =
  "y tienen el gusto de invitaros a la ceremonia religiosa que se celebrará (D. m.)\n" +
  "el sábado 12 de septiembre a la una del mediodía, en la Iglesia de Santa María la Real\n" +
  "y a la celebración que tendrá lugar a continuación, en la Finca El Olivar.";

const DEFAULT: Invitacion = {
  publicada: false,
  padresNovia: "",
  direccionNovia: "",
  padresNovio: "",
  direccionNovio: "",
  participan: "Participan el enlace de sus hijos",
  nombres: "",
  cuerpo: CUERPO_EJEMPLO,
  src: "S. R. C.",
  ciudadAno: "",
  colorBg: "#fdfcf8",
  colorText: "#5b6a4c",
  acabado: "liso",
  fuente: "imprenta",
  marco: "ninguno",
  colorMarco: "#6f7650",
  colorFrutos: "#c79a46",
};

export const INVITACION_CUERPO_EJEMPLO = CUERPO_EJEMPLO;

let override: Invitacion | null = null;
export function setInvitacionOverride(i: Invitacion | null) {
  override = i ? { ...DEFAULT, ...i } : null;
}

export function loadInvitacion(): Invitacion {
  if (override) return override;
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return { ...DEFAULT };
    const c = JSON.parse(r) as Partial<Invitacion>;
    return {
      ...DEFAULT,
      ...c,
      acabado: ACABADOS[c.acabado as AcabadoStd] ? (c.acabado as AcabadoStd) : DEFAULT.acabado,
      marco: c.marco && MARCOS[c.marco] ? c.marco : DEFAULT.marco,
      fuente: c.fuente && FUENTES_INV[c.fuente] ? c.fuente : DEFAULT.fuente,
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveInvitacion(i: Invitacion) {
  try {
    localStorage.setItem(KEY, JSON.stringify(i));
    window.dispatchEvent(new Event("webodas:invitacion"));
  } catch {
    /* noop */
  }
}

export function setInvitacion(patch: Partial<Invitacion>) {
  saveInvitacion({ ...loadInvitacion(), ...patch });
}

export function invitacionConfigurada(i: Invitacion): boolean {
  return i.publicada || Boolean(i.padresNovia || i.padresNovio || i.cuerpo || i.nombres);
}
