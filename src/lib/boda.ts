// Perfil de la boda (prototipo: en el navegador).

export type Persona = { nombre: string; apellidos: string; apodo: string };

export type BodaPerfil = {
  p1: Persona;
  p2: Persona;
  fecha: string; // ISO "2026-09-12" o "" si aún no se sabe
  lugar: string; // "" si aún no se sabe
  invitadosAprox: number | null;
  presupuestoTotal: number | null;
};

const KEY = "webodas:boda";

const PERSONA: Persona = { nombre: "", apellidos: "", apodo: "" };
const VACIO: BodaPerfil = {
  p1: { ...PERSONA },
  p2: { ...PERSONA },
  fecha: "",
  lugar: "",
  invitadosAprox: null,
  presupuestoTotal: null,
};

// Override para páginas públicas (el invitado no tiene el perfil en su navegador).
let override: BodaPerfil | null = null;
export function setBodaOverride(b: Partial<BodaPerfil> | null) {
  override = b ? { ...VACIO, ...b, p1: { ...PERSONA, ...b.p1 }, p2: { ...PERSONA, ...b.p2 } } : null;
}

export function loadBoda(): BodaPerfil {
  if (override) return override;
  try {
    const r = localStorage.getItem(KEY);
    if (!r) return VACIO;
    const raw = JSON.parse(r) as Partial<BodaPerfil> & { pareja?: string };
    return {
      ...VACIO,
      ...raw,
      p1: { ...PERSONA, ...raw.p1 },
      p2: { ...PERSONA, ...raw.p2 },
    };
  } catch {
    return VACIO;
  }
}

export function saveBoda(patch: Partial<BodaPerfil>) {
  try {
    const next = { ...loadBoda(), ...patch };
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("webodas:boda"));
  } catch {
    /* noop */
  }
}

const nombreCorto = (p: Persona) => p.apodo.trim() || p.nombre.trim();

export function nombrePareja(b: BodaPerfil): string {
  const a = nombreCorto(b.p1);
  const c = nombreCorto(b.p2);
  if (a && c) return `${a} & ${c}`;
  return a || c || "Vuestra boda";
}

export function configurada(b: BodaPerfil): boolean {
  return b.p1.nombre.trim().length > 0 && b.p2.nombre.trim().length > 0;
}

// Días que faltan; null si no hay fecha.
export function diasRestantes(b: BodaPerfil): number | null {
  if (!b.fecha) return null;
  return Math.ceil((new Date(b.fecha).getTime() - Date.now()) / 86400000);
}

export function mesesRestantes(b: BodaPerfil): number | null {
  const d = diasRestantes(b);
  return d == null ? null : d / 30.4;
}

export function fechaLarga(b: BodaPerfil): string {
  if (!b.fecha) return "Fecha por definir";
  return new Date(b.fecha).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
