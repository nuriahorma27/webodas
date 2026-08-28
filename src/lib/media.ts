// Subida de imágenes a Supabase Storage (bucket "media", público).
// Se guarda solo la URL, no el archivo dentro del contenido.

import { createClient } from "@/lib/supabase/client";

// Reduce el tamaño de la imagen con un canvas antes de subirla.
async function comprimir(file: Blob, max = 1600, quality = 0.82): Promise<Blob> {
  try {
    const img = await createImageBitmap(file);
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * escala));
    const h = Math.max(1, Math.round(img.height * escala));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", quality),
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

// Sube un Blob/File y devuelve su URL pública. Lanza si no hay sesión.
export async function subirImagen(file: Blob): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Necesitas haber iniciado sesión para subir imágenes.");

  const blob = await comprimir(file);
  const path = `${user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from("media")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function esDataUrl(v: unknown): v is string {
  return typeof v === "string" && v.startsWith("data:");
}

// Convierte una data URL a Blob y la sube (para migrar contenido antiguo).
export async function subirDataUrl(dataUrl: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  return subirImagen(blob);
}
