// La "boda" del usuario en Supabase: su slug (enlace público) y el bundle de
// datos que ven los invitados (web, lista de regalos, save the date, formulario).

import { createClient } from "@/lib/supabase/client";
import { loadBoda, nombrePareja } from "@/lib/boda";

export type Wedding = {
  id: string;
  slug: string;
  couple_names: string;
  published_at: string | null;
};

let cache: Wedding | null = null;
let pending: Promise<Wedding | null> | null = null;

// Id de la boda que se está viendo en una página pública (/w, /lista, /std).
// Lo usa el formulario de confirmación para guardar la respuesta en el servidor.
let publicId: string | null = null;
let publicSlug: string | null = null;
export function setPublicWeddingId(id: string | null, slug: string | null = null) {
  publicId = id;
  publicSlug = slug;
}
export function getPublicWeddingId(): string | null {
  return publicId;
}
export function getPublicSlug(): string {
  return publicSlug || "ana-y-leo";
}

export type BundlePublico = Record<string, unknown>;

export async function fetchBundlePublico(
  slug: string,
): Promise<{ found: boolean; data: BundlePublico; id: string; names: string } | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weddings")
    .select("id, public_data, couple_names")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  if (!data) return { found: false, data: {}, id: "", names: "" };
  return {
    found: true,
    data: (data.public_data ?? {}) as BundlePublico,
    id: data.id,
    names: data.couple_names ?? "",
  };
}

export function pickBundle<T>(b: BundlePublico | null, key: string, fallback: T): T {
  const v = b?.[key];
  return v == null ? fallback : (v as T);
}

// Claves de localStorage que forman el contenido público para invitados.
const BUNDLE_KEYS = [
  "webodas:boda",
  "webodas:colors",
  "webodas:site:demo",
  "webodas:regalos",
  "webodas:savethedate",
  "webodas:formulario",
  "webodas:aportaciones",
];

function baseSlug(): string {
  const n = nombrePareja(loadBoda());
  return n === "Vuestra boda" ? "boda" : n;
}

export async function getWedding(): Promise<Wedding | null> {
  if (cache) return cache;
  if (pending) return pending;
  pending = (async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.rpc("ensure_wedding", { base: baseSlug() });
    if (error || !data) return null;
    cache = {
      id: data.id,
      slug: data.slug,
      couple_names: data.couple_names,
      published_at: data.published_at,
    };
    return cache;
  })();
  const w = await pending;
  pending = null;
  return w;
}

// Sube el contenido actual del panel para que lo vean los invitados.
export async function publishWedding(): Promise<void> {
  if (typeof window === "undefined") return;
  const w = await getWedding();
  if (!w) return;
  const bundle: Record<string, unknown> = {};
  for (const k of BUNDLE_KEYS) {
    const raw = localStorage.getItem(k);
    if (raw == null) continue;
    try {
      bundle[k] = JSON.parse(raw);
    } catch {
      bundle[k] = raw;
    }
  }
  const supabase = createClient();
  const now = new Date().toISOString();
  await supabase
    .from("weddings")
    .update({ public_data: bundle, published_at: now, couple_names: nombrePareja(loadBoda()) })
    .eq("id", w.id);
  if (cache) cache.published_at = now;
}

export async function renameSlug(
  slug: string,
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("set_wedding_slug", { new_slug: slug });
  if (error) {
    return {
      ok: false,
      error: /en uso/i.test(error.message)
        ? "Ese enlace ya está en uso, prueba otro."
        : "No se ha podido cambiar el enlace.",
    };
  }
  if (cache && data) cache.slug = data.slug;
  return { ok: true, slug: data?.slug };
}
