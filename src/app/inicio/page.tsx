"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function InicioPage() {
  return (
    <Suspense fallback={null}>
      <Inicio />
    </Suspense>
  );
}

function Inicio() {
  const params = useSearchParams();
  const [modo, setModo] = useState<"entrar" | "crear">(
    params.get("crear") !== null ? "crear" : "entrar",
  );
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const nombre = String(data.get("full_name") ?? "").trim();

    if (!email || !password) {
      setError("Introduce email y contraseña.");
      return;
    }
    if (modo === "crear" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setPending(true);
    const supabase = createClient();

    if (modo === "crear") {
      const { data: res, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: nombre } },
      });
      setPending(false);
      if (error) return setError(traducir(error.message));
      if (res.session) {
        window.location.href = "/panel";
      } else {
        setAviso("Cuenta creada. Revisa tu correo para confirmar y luego entra.");
        setModo("entrar");
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setPending(false);
    if (error) return setError(traducir(error.message));
    window.location.href = "/panel";
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1c1a17] p-12 text-[#fbf9f6] lg:flex">
        <Link href="/" className="font-display text-2xl">
          webodas
        </Link>
        <div>
          <h1 className="font-display text-5xl leading-tight">
            Toda tu boda,
            <br />
            en un solo sitio.
          </h1>
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Crea tu página web, comparte la lista de regalos y organiza cada detalle del gran día.
          </p>
        </div>
        <Link href="/" className="text-xs text-white/40 hover:text-white/70">
          ← Volver a la portada
        </Link>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#8a6d3b]/30 blur-3xl" />
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-2xl lg:hidden">
            webodas
          </Link>
          <h2 className="mt-2 font-display text-3xl">
            {modo === "entrar" ? "Entra en tu panel" : "Crea tu cuenta"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {modo === "entrar" ? "Introduce tus datos para continuar." : "Empieza a organizar tu boda hoy."}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            {modo === "crear" && <Field label="Nombre" name="full_name" type="text" autoComplete="name" />}
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete={modo === "crear" ? "new-password" : "current-password"}
              required
            />

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            {aviso && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{aviso}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            {modo === "entrar" ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              onClick={() => {
                setModo(modo === "entrar" ? "crear" : "entrar");
                setError(null);
                setAviso(null);
              }}
              className="font-medium text-foreground underline"
            >
              {modo === "entrar" ? "Regístrate" : "Entra"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function traducir(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Email o contraseña incorrectos.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "Ya existe una cuenta con ese email.";
  if (m.includes("email not confirmed")) return "Confirma tu email antes de entrar.";
  if (m.includes("signups not allowed") || m.includes("sign ups"))
    return "El registro está cerrado ahora mismo.";
  return msg;
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />
    </label>
  );
}
