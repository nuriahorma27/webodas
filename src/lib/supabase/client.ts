import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Una sola instancia del cliente de navegador. Crear varios GoTrueClient con la
// misma clave de almacenamiento hace que las llamadas de auth (signIn, reset…)
// se queden bloqueadas esperando el lock del navegador.
let cliente: SupabaseClient | undefined;

export function createClient() {
  if (!cliente) {
    cliente = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return cliente;
}
