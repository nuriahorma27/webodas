"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Data } from "@measured/puck";
import { createClient } from "@/lib/supabase/server";

export async function crearWeb() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: wedding, error } = await supabase
    .from("weddings")
    .insert({ owner_id: user.id, couple_names: "" })
    .select("id")
    .single();
  if (error || !wedding) throw new Error(error?.message ?? "No se pudo crear la web.");

  await supabase.from("wedding_sites").insert({ wedding_id: wedding.id });

  redirect(`/editor/${wedding.id}`);
}

export async function guardarWeb(weddingId: string, data: Data) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("wedding_sites")
    .update({ draft_data: data, updated_at: new Date().toISOString() })
    .eq("wedding_id", weddingId);
  if (error) return { error: error.message };
  revalidatePath(`/editor/${weddingId}`);
  return { ok: true };
}

export async function publicarWeb(weddingId: string, data: Data) {
  const supabase = await createClient();

  const { data: wedding } = await supabase
    .from("weddings")
    .select("id, slug, couple_names")
    .eq("id", weddingId)
    .single();
  if (!wedding) return { error: "Web no encontrada." };

  let slug = wedding.slug;
  if (!slug) {
    const base =
      slugify(wedding.couple_names) || "boda";
    slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    const { error: slugErr } = await supabase
      .from("weddings")
      .update({ slug })
      .eq("id", weddingId);
    if (slugErr) return { error: slugErr.message };
  }

  const { error } = await supabase
    .from("wedding_sites")
    .update({
      draft_data: data,
      published_data: data,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("wedding_id", weddingId);
  if (error) return { error: error.message };

  revalidatePath(`/w/${slug}`);
  return { ok: true, slug };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
