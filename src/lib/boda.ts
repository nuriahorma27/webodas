// Perfil de la boda (prototipo: en el navegador).

export type BodaPerfil = {
  pareja: string;
  fecha: string; // ISO "2026-09-12" o "" si aún no se sabe
  lugar: string;
  invitadosAprox: number | null;
  presupuestoTotal: number | null;
};

const KEY = "webodas:boda";

const VACIO: BodaPerfil = {
  pareja: "",
  fecha: "",
  lugar: "",
  invitadosAprox: null,
  presupuestoTotal: null,
};

export function loadBoda(): BodaPerfil {
  try {
    const r = localStorage.getItem(KEY);
    return r ? { ...VACIO, ...(JSON.parse(r) as Partial<BodaPerfil>) } : VACIO;
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

export function configurada(b: BodaPerfil): boolean {
  return b.pareja.trim().length > 0;
}

// Días que faltan; null si no hay fecha.
export function diasRestantes(b: BodaPerfil): number | null {
  if (!b.fecha) return null;
  const d = Math.ceil((new Date(b.fecha).getTime() - Date.now()) / 86400000);
  return d;
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
