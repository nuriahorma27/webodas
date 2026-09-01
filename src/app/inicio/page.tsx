"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient, ConfigError } from "@/lib/supabase/client";

export default function InicioPage() {
  return (
    <Suspense fallback={null}>
      <Inicio />
    </Suspense>
  );
}

function Inicio() {
  const params = useSearchParams();
  const [modo, setModo] = useState<"entrar" | "crear" | "recuperar">(
    params.get("crear") !== null ? "crear" : "entrar",
  );
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const cambiarModo = (m: typeof modo) => {
    setModo(m);
    setError(null);
    setAviso(null);
  };

  // Evita que el botón se quede "pillado" si la llamada nunca responde.
  function conTimeout<T>(p: Promise<T>, ms = 15000): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), ms),
      ),
    ]);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    if (modo === "recuperar") {
      if (!email) {
        setError("Introduce tu email.");
        return;
      }
      setPending(true);
      try {
        const supabase = createClient();
        const { error } = await conTimeout(
          supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/recuperar`,
          }),
        );
        setPending(false);
        if (error) return setError(traducir(error.message));
        setAviso(
          "Si hay una cuenta con ese email, te hemos enviado un enlace para cambiar la contraseña. Revisa tu correo.",
        );
      } catch (err) {
        setPending(false);
        setError(
          err instanceof ConfigError
            ? "La conexión con el servidor no está configurada. Avísanos."
            : "No hemos podido contactar con el servidor. Vuelve a intentarlo.",
        );
      }
      return;
    }

    if (!email || !password) {
      setError("Introduce email y contraseña.");
      return;
    }
    if (modo === "crear" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setPending(true);
    try {
      const supabase = createClient();

      if (modo === "crear") {
        const { data: res, error } = await conTimeout(
          supabase.auth.signUp({
            email,
            password,
          }),
        );
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

      const { error } = await conTimeout(
        supabase.auth.signInWithPassword({ email, password }),
      );
      setPending(false);
      if (error) return setError(traducir(error.message));
      window.location.href = "/panel";
    } catch {
      setPending(false);
      setError("No hemos podido contactar con el servidor. Vuelve a intentarlo.");
    }
  }

  return (
    <div className="lp grid min-h-screen lg:grid-cols-2">
      {/* panel de la izquierda: mismo lenguaje que la landing */}
      <div className="relative hidden flex-col justify-between border-r border-[var(--line)] bg-[var(--paper-2)] p-12 lg:flex xl:p-16">
        <Link href="/" className="lp-display text-2xl">
          webodas
        </Link>
        <div className="max-w-md">
          <p className="lp-kicker">Organización de bodas</p>
          <h1 className="lp-display mt-4 text-[3rem] leading-[1.02] xl:text-[3.6rem]">
            Toda vuestra boda,
            <br />
            <span className="lp-display-it">en un sitio.</span>
          </h1>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-[var(--muted)]">
            La web, los regalos, las invitaciones y la organización del día. Para disfrutar también
            del camino hasta la boda.
          </p>
          <ul className="mt-9 space-y-3 text-sm text-[var(--muted)]">
            {[
              "7 días de prueba, sin tarjeta",
              "Web, regalos, invitaciones y organización",
              "Sin comisión de webodas sobre los regalos",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <Check />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="text-xs text-[var(--muted)] transition hover:text-[var(--ink)]">
          ← Volver a la portada
        </Link>
      </div>

      <div className="relative flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link href="/" className="lp-display text-2xl">webodas</Link>
            <Link href="/" className="text-xs text-[var(--muted)]">Volver</Link>
          </div>
          <p className="lp-kicker">
            {modo === "entrar" ? "Bienvenidos de nuevo" : modo === "crear" ? "Vuestra boda empieza aquí" : "Acceso a vuestra cuenta"}
          </p>
          <h2 className="lp-display mt-3 text-4xl leading-tight sm:text-5xl">
            {modo === "entrar"
              ? "Bienvenidos"
              : modo === "crear"
                ? "Cread vuestra cuenta"
                : "Recuperar contraseña"}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted)]">
            {modo === "entrar"
              ? "Acceded a vuestra web, regalos y toda la organización."
              : modo === "crear"
                ? "Empezad a preparar vuestra web, las invitaciones y cada detalle de la boda."
                : "Os enviaremos un enlace para crear una contraseña nueva."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Email" name="email" type="email" autoComplete="email" required />
            {modo !== "recuperar" && (
              <Field
                label="Contraseña"
                name="password"
                type="password"
                autoComplete={modo === "crear" ? "new-password" : "current-password"}
                required
              />
            )}

            {modo === "entrar" && (
              <button
                type="button"
                onClick={() => cambiarModo("recuperar")}
                className="text-sm text-[var(--muted)] underline decoration-[var(--rule)] underline-offset-4 hover:text-[var(--ink)]"
              >
                ¿Has olvidado la contraseña?
              </button>
            )}

            {error && <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            {aviso && <p className="border border-[var(--spot)]/30 bg-[var(--spot)]/10 px-3 py-2 text-sm text-[var(--spot-deep)]">{aviso}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-[var(--ink)] px-4 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
            >
              {pending
                ? "Un momento…"
                : modo === "entrar"
                  ? "Entrar en nuestro panel"
                  : modo === "crear"
                    ? "Crear nuestra cuenta"
                    : "Enviar enlace"}
            </button>
            {modo === "crear" && (
              <p className="text-center text-xs text-[var(--muted)]">
                7 días de prueba. No pedimos tarjeta.
              </p>
            )}
          </form>

          <p className="mt-7 text-sm text-[var(--muted)]">
            {modo === "recuperar" ? (
              <>
                ¿Ya te acuerdas?{" "}
                <button
                  onClick={() => cambiarModo("entrar")}
                  className="font-medium text-[var(--ink)] underline underline-offset-4"
                >
                  Volver a entrar
                </button>
              </>
            ) : (
              <>
                {modo === "entrar" ? "¿Aún no tenéis cuenta? " : "¿Ya tenéis cuenta? "}
                <button
                  onClick={() => cambiarModo(modo === "entrar" ? "crear" : "entrar")}
                  className="font-medium text-[var(--ink)] underline underline-offset-4"
                >
                  {modo === "entrar" ? "Empezad gratis" : "Entrad"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--green)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8.5l3.5 3.5L13 4" />
    </svg>
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
      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border border-[var(--rule)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--spot)] focus:ring-2 focus:ring-[var(--spot)]/15"
      />
    </label>
  );
}
