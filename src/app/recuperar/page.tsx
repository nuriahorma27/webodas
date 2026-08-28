"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RecuperarPage() {
  return (
    <Suspense fallback={null}>
      <Recuperar />
    </Suspense>
  );
}

function Recuperar() {
  const [estado, setEstado] = useState<"cargando" | "listo" | "invalido" | "hecho">("cargando");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let vivo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!vivo) return;
      if (event === "PASSWORD_RECOVERY" || session) setEstado("listo");
    });

    (async () => {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type");
      const code = url.searchParams.get("code");
      try {
        if (tokenHash && type) {
          await supabase.auth.verifyOtp({
            type: type as "recovery",
            token_hash: tokenHash,
          });
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(window.location.href);
        }
      } catch {
        /* lo resolvemos con getSession abajo */
      }
      const { data } = await supabase.auth.getSession();
      if (!vivo) return;
      setEstado(data.session ? "listo" : "invalido");
    })();

    return () => {
      vivo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const p1 = String(data.get("password") ?? "");
    const p2 = String(data.get("password2") ?? "");
    if (p1.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (p1 !== p2) return setError("Las dos contraseñas no coinciden.");

    setPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: p1 });
    setPending(false);
    if (error) return setError(error.message);
    setEstado("hecho");
    setTimeout(() => {
      window.location.href = "/panel";
    }, 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-2xl">
          webodas
        </Link>
        <h1 className="mt-2 font-display text-3xl">Nueva contraseña</h1>

        {estado === "cargando" && (
          <p className="mt-4 text-sm text-muted">Comprobando el enlace…</p>
        )}

        {estado === "invalido" && (
          <div className="mt-4 space-y-3">
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              El enlace no es válido o ha caducado. Pide uno nuevo.
            </p>
            <Link href="/inicio" className="text-sm font-medium text-foreground underline">
              Volver a inicio
            </Link>
          </div>
        )}

        {estado === "hecho" && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Contraseña cambiada. Entrando en tu panel…
          </p>
        )}

        {estado === "listo" && (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Nueva contraseña</span>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Repítela</span>
              <input
                name="password2"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
