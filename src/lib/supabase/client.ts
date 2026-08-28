import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Una sola instancia del cliente de navegador. Crear varios GoTrueClient con la
// misma clave de almacenamiento hace que las llamadas de auth (signIn, reset…)
// se queden bloqueadas esperando el lock del navegador.
let cliente: SupabaseClient | undefined;

export class ConfigError extends Error {}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new ConfigError(
      "Faltan las variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  if (!cliente) {
    cliente = createBrowserClient(url, key);
  }
  return cliente;
}
