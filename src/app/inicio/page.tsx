"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InicioPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value.trim();
    const pass = (form.elements.namedItem("password") as HTMLInputElement)?.value;
    if (!email || !pass) {
      setError("Introduce email y contraseña.");
      return;
    }
    // Prototipo: sesión de acceso guardada en una cookie.
    document.cookie = `wb_session=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    router.push("/panel");
  }

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
            Crea tu página web, comparte la lista de regalos y organiza cada
            detalle del gran día.
          </p>
        </div>
        <p className="text-xs text-white/40">Ana &amp; Leo · 12 de septiembre de 2026</p>
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#8a6d3b]/30 blur-3xl" />
      </div>

      {/* Formulario */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="font-display text-2xl lg:hidden">webodas</p>
          <h2 className="mt-2 font-display text-3xl">
            {modo === "entrar" ? "Entra en tu panel" : "Crea tu cuenta"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {modo === "entrar"
              ? "Introduce tus datos para continuar."
              : "Empieza a organizar tu boda hoy."}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            {modo === "crear" && (
              <Field label="Nombre" name="nombre" type="text" placeholder="Ana" />
            )}
            <Field label="Email" name="email" type="text" placeholder="ana@email.com" defaultValue="xxx" />
            <Field label="Contraseña" name="password" type="password" placeholder="••••••••" defaultValue="xxx" />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              {modo === "entrar" ? "Entrar" : "Crear cuenta"}
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
