"use client";

import { useState } from "react";
import { renameSlug } from "@/lib/wedding";

export function EditarEnlace({
  slug,
  onChange,
}: {
  slug: string;
  onChange: (s: string) => void;
}) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(slug);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    const r = await renameSlug(valor);
    setGuardando(false);
    if (!r.ok) {
      setError(r.error ?? "No se ha podido cambiar.");
      return;
    }
    onChange(r.slug ?? valor);
    setEditando(false);
  };

  if (!editando) {
    return (
      <button
        onClick={() => {
          setValor(slug);
          setEditando(true);
        }}
        className="text-xs text-muted underline hover:text-accent"
      >
        Cambiar la parte final del enlace
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-1.5 text-sm">
        <span className="text-muted">…/w/</span>
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-44 rounded-md border border-line bg-surface px-2 py-1 outline-none focus:border-accent"
        />
        <button
          onClick={guardar}
          disabled={guardando}
          className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {guardando ? "…" : "Guardar"}
        </button>
        <button
          onClick={() => setEditando(false)}
          className="text-xs text-muted underline"
        >
          Cancelar
        </button>
      </div>
      {error && <p className="text-xs text-[#7b2233]">{error}</p>}
    </div>
  );
}
