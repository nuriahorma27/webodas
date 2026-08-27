"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, registro } from "@/lib/auth-actions";

export default function InicioPage() {
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const action = modo === "entrar" ? login : registro;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel de marca */}
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

      {/* Formulario */}
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

          <form action={formAction} className="mt-7 space-y-4">
            {modo === "crear" && <Field label="Nombre" name="full_name" type="text" autoComplete="name" />}
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            <Field
              label="Contraseña"
              name="password"
              type="password"
              autoComplete={modo === "crear" ? "new-password" : "current-password"}
              required
            />

            {state?.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
            )}

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
              onClick={() => setModo(modo === "entrar" ? "crear" : "entrar")}
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
