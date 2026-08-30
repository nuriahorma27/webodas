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
    const nombre = String(data.get("full_name") ?? "").trim();

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
            options: { data: { full_name: nombre } },
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
    <div className="grid min-h-screen bg-[#f7f3eb] lg:grid-cols-[1.08fr_.92fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#ded2bf] p-12 text-[#302a24] lg:flex xl:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[url('/textures/papel-algodon.png')] bg-cover opacity-[.22] mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-y-10 right-8 w-px bg-[#8a7658]/25" />
        <Link href="/" className="relative z-10 font-display text-2xl">
          webodas
        </Link>
        <div className="relative z-10 max-w-2xl pr-12">
          <div className="flex items-center gap-4 text-[#846d49]">
            <span className="h-px w-12 bg-current" />
            <p className="font-display text-lg italic">Todo para vuestro gran día</p>
          </div>
          <h1 className="mt-7 font-display text-5xl leading-[1.08] xl:text-[4.2rem]">
            Vuestra boda,<br />a vuestra manera.
          </h1>
          <p className="mt-7 max-w-lg font-display text-xl leading-8 text-[#51483e]/85">
            Un lugar donde crear vuestra web y las invitaciones, compartir los regalos y preparar cada detalle de la boda con calma.
          </p>
        </div>
        <Link href="/" className="relative z-10 text-xs text-[#6e6254] transition hover:text-[#302a24]">
          ← Volver a la portada
        </Link>
      </div>

      <div className="relative flex items-center justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center justify-between lg:hidden">
            <Link href="/" className="font-display text-2xl text-[#3b3028]">webodas</Link>
            <Link href="/" className="text-xs text-[#6f7169]">Volver</Link>
          </div>
          <p className="text-xs uppercase tracking-[.24em] text-[#8a713d]">
            {modo === "entrar" ? "Bienvenidos de nuevo" : modo === "crear" ? "Empezad hoy" : "Acceso a vuestra cuenta"}
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-[#3b3028] sm:text-5xl">
            {modo === "entrar"
              ? "Bienvenidos"
              : modo === "crear"
                ? "Organizadlo todo juntos"
                : "Recuperar contraseña"}
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#6f7169]">
            {modo === "entrar"
              ? "Acceded a vuestra web, regalos y toda la organización."
              : modo === "crear"
                ? "Web, invitaciones, regalos y gestión en un mismo lugar."
                : "Os enviaremos un enlace para crear una contraseña nueva."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {modo === "crear" && <Field label="Nombre" name="full_name" type="text" autoComplete="name" />}
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
                className="text-sm text-[#6f7169] underline decoration-[#b9aa8c] underline-offset-4 hover:text-[#3b3028]"
              >
                ¿Has olvidado la contraseña?
              </button>
            )}

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            {aviso && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{aviso}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-[#3b3028] px-4 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#2b231e] disabled:opacity-60"
            >
              {pending
                ? "Un momento…"
                : modo === "entrar"
                  ? "Entrar en nuestro panel"
                  : modo === "crear"
                    ? "Empezar gratis"
                    : "Enviar enlace"}
            </button>
          </form>

          <p className="mt-7 text-sm text-[#6f7169]">
            {modo === "recuperar" ? (
              <>
                ¿Ya te acuerdas?{" "}
                <button
                  onClick={() => cambiarModo("entrar")}
                  className="font-medium text-[#3b3028] underline underline-offset-4"
                >
                  Volver a entrar
                </button>
              </>
            ) : (
              <>
                {modo === "entrar" ? "¿Aún no tenéis cuenta? " : "¿Ya tenéis cuenta? "}
                <button
                  onClick={() => cambiarModo(modo === "entrar" ? "crear" : "entrar")}
                  className="font-medium text-[#3b3028] underline underline-offset-4"
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
      <span className="text-sm font-medium text-[#30362f]">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-xl border border-[#d8ceba] bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-[#9a7d50] focus:ring-2 focus:ring-[#9a7d50]/10"
      />
    </label>
  );
}
