"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: traducir(error.message) };
  redirect("/panel");
}

export async function registro(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { error: traducir(error.message) };
  redirect("/panel");
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/inicio");
}

function traducir(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email o contraseña incorrectos.";
  if (m.includes("already registered")) return "Ya existe una cuenta con ese email.";
  if (m.includes("email not confirmed")) return "Confirma tu email antes de entrar.";
  return msg;
}
