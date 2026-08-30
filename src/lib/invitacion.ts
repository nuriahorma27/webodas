// Invitación de boda "clásica de toda la vida" (prototipo: en el navegador).
// Reutiliza acabados, tipografías y marcos del Save the date.

import type {
  AcabadoStd,
  FuenteStd,
  MarcoStd,
} from "@/lib/savethedate";
import { ACABADOS, FUENTES, MARCOS } from "@/lib/savethedate";

export { ACABADOS, FUENTES, MARCOS };
export type { AcabadoStd, FuenteStd, MarcoStd };

export type Invitacion = {
  publicada: boolean;
  encabezado: string; // línea opcional de arriba
  familiaNovia: string; // "D. … y Dña. …" (multilínea)
  familiaNovio: string;
  textoInvitacion: string; // "tienen el gusto de invitaros a la boda de sus hijos"
  nombres: string; // vacío → nombre de la pareja del perfil
  fecha: string; // vacío → fecha del perfil (texto libre)
  hora: string;
  ceremoniaLugar: string;
  ceremoniaDireccion: string;
  celebracionLugar: string;
  celebracionDireccion: string;
  confirmacion: string; // "Se ruega confirmación antes del … · teléfono"
  nota: string; // "Etiqueta rigurosa", "Se ruega puntualidad"…
  colorBg: string;
  colorText: string;
  acabado: AcabadoStd;
  fuente: FuenteStd;
  marco: MarcoStd;
  colorMarco: string;
  colorFrutos: string;
};

const KEY = "webodas:invitacion";

const DEFAULT: Invitacion = {
  publicada: false,
  encabezado: "",
  familiaNovia: "",
  familiaNovio: "",
  textoInvitacion: "tienen el gusto de invitaros a la boda de sus hijos",
  nombres: "",
  fecha: "",
  hora: "",
  ceremoniaLugar: "",
  ceremoniaDireccion: "",
  celebracionLugar: "",
  celebracionDireccion: "",
  confirmacion: "",
  nota: "",
  colorBg: "#faf7f0",
  colorText: "#3a342b",
  acabado: "papel",
  fuente: "serif",
  marco: "ninguno",
  colorMarco: "#6f7650",
  colorFrutos: "#c79a46",
};

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
  return (
    i.publicada ||
    Boolean(i.familiaNovia || i.familiaNovio || i.ceremoniaLugar || i.celebracionLugar || i.nota)
  );
}
