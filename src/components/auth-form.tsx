"use client";

import Link from "next/link";
import { useActionState } from "react";

type Action = (prev: unknown, formData: FormData) => Promise<{ error?: string } | undefined>;

export function AuthForm({ mode, action }: { mode: "login" | "registro"; action: Action }) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const isRegistro = mode === "registro";

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isRegistro ? "Crea tu cuenta" : "Entra en tu panel"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {isRegistro ? "Empieza a organizar tu boda." : "Bienvenido de nuevo."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {isRegistro && (
          <Field label="Nombre" name="full_name" type="text" autoComplete="name" />
        )}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Contraseña"
          name="password"
          type="password"
          autoComplete={isRegistro ? "new-password" : "current-password"}
          required
        />

        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-60"
        >
          {pending ? "Un momento…" : isRegistro ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        {isRegistro ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-neutral-900 underline">
              Entra
            </Link>
          </>
        ) : (
          <>
            ¿Aún no tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-neutral-900 underline">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <input
        {...props}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
    </label>
  );
}
