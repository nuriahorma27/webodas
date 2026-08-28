// Sincroniza TODO lo que la app guarda en localStorage (claves "webodas:*")
// con una fila por usuario en Supabase (tabla wedding_state). Así los datos
// sobreviven a cambiar de dispositivo o borrar la caché del navegador.
//
// No hace falta tocar el resto del código: se intercepta localStorage.setItem.

import { createClient } from "@/lib/supabase/client";
import { publishWedding } from "@/lib/wedding";

const PREFIX = "webodas:";
const MARK = "webodas:__cloud_at"; // updated_at de la última sync con la nube

const EVENTOS = [
  "webodas:boda",
  "webodas:colors",
  "webodas:presupuesto",
  "webodas:tareas",
  "webodas:invitados",
  "webodas:proveedores",
  "webodas:formulario",
  "webodas:rsvp",
  "webodas:mesas",
  "webodas:savethedate",
  "webodas:regalos",
];

let iniciado = false;
let empujando = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let uid: string | null = null;

function estadoLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX) && k !== MARK) {
      const v = localStorage.getItem(k);
      if (v != null) out[k] = v;
    }
  }
  return out;
}

async function empujar() {
  if (empujando || !uid) return;
  empujando = true;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("wedding_state")
      .upsert(
        { user_id: uid, data: estadoLocal(), updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      )
      .select("updated_at")
      .single();
    if (!error && data?.updated_at) {
      localStorage.setItem(MARK, data.updated_at);
    }
    // Publicar también el contenido para invitados (web, lista, save the date…).
    await publishWedding();
  } catch {
    /* reintentará en el siguiente cambio */
  } finally {
    empujando = false;
  }
}

function programarEmpuje() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(empujar, 1500);
}

export async function startCloudSync() {
  if (iniciado || typeof window === "undefined") return;
  iniciado = true;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    iniciado = false;
    return;
  }
  uid = user.id;

  // 1) Traer de la nube
  const { data: fila } = await supabase
    .from("wedding_state")
    .select("data, updated_at")
    .eq("user_id", uid)
    .maybeSingle();

  const nube =
    fila && fila.data && typeof fila.data === "object"
      ? (fila.data as Record<string, unknown>)
      : null;
  const nubeAt = fila ? String(fila.updated_at) : "";
  const marca = localStorage.getItem(MARK);

  if (!nube) {
    // No hay nada en la nube: subir lo de este navegador.
    await empujar();
  } else if (!marca) {
    // Primera sync de este dispositivo: fusionar SIN perder nada
    // (lo local gana en caso de conflicto), y subir el resultado.
    const local = estadoLocal();
    const fusion: Record<string, string> = {};
    for (const [k, v] of Object.entries(nube)) if (typeof v === "string") fusion[k] = v;
    for (const [k, v] of Object.entries(local)) fusion[k] = v;
    for (const [k, v] of Object.entries(fusion)) localStorage.setItem(k, v);
    for (const ev of EVENTOS) window.dispatchEvent(new Event(ev));
    await empujar();
  } else if (nubeAt > marca) {
    // Otro dispositivo ha guardado después: adoptar la nube.
    const clavesNube = new Set(Object.keys(nube));
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX) && k !== MARK && !clavesNube.has(k)) {
        localStorage.removeItem(k);
      }
    }
    for (const [k, v] of Object.entries(nube)) {
      if (typeof v === "string") localStorage.setItem(k, v);
    }
    localStorage.setItem(MARK, nubeAt);
    for (const ev of EVENTOS) window.dispatchEvent(new Event(ev));
  }

  // 2) Interceptar escrituras para ir guardando en la nube
  const setItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (k: string, v: string) => {
    setItem(k, v);
    if (k.startsWith(PREFIX) && k !== MARK) programarEmpuje();
  };
  const removeItem = localStorage.removeItem.bind(localStorage);
  localStorage.removeItem = (k: string) => {
    removeItem(k);
    if (k.startsWith(PREFIX) && k !== MARK) programarEmpuje();
  };

  // 3) Guardar al salir / cambiar de pestaña
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") empujar();
  });
  window.addEventListener("pagehide", () => {
    empujar();
  });
}

/* ---------- copia de seguridad manual ---------- */

export function exportarDatos(): string {
  return JSON.stringify({ v: 1, fecha: new Date().toISOString(), datos: estadoLocal() }, null, 2);
}

export function importarDatos(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as { datos?: Record<string, string> };
    const datos = parsed.datos ?? (parsed as unknown as Record<string, string>);
    if (!datos || typeof datos !== "object") return false;
    for (const [k, v] of Object.entries(datos)) {
      if (k.startsWith(PREFIX) && typeof v === "string") localStorage.setItem(k, v);
    }
    for (const ev of EVENTOS) window.dispatchEvent(new Event(ev));
    programarEmpuje();
    return true;
  } catch {
    return false;
  }
}
