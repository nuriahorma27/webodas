"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { loadBoda, saveBoda, type BodaPerfil } from "@/lib/boda";
import { eur } from "@/lib/mock";

export function CampoBoda({
  campo,
  label,
  euro,
}: {
  campo: "invitadosAprox" | "presupuestoTotal";
  label: string;
  euro?: boolean;
}) {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState("");

  useEffect(() => {
    const sync = () => setBoda(loadBoda());
    sync();
    window.addEventListener("webodas:boda", sync);
    return () => window.removeEventListener("webodas:boda", sync);
  }, []);

  if (!boda) return null;
  const actual = boda[campo];

  const guardar = () => {
    saveBoda({ [campo]: Number(valor) || 0 });
    setEditando(false);
  };

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
        {editando ? (
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              autoFocus
              defaultValue={actual ?? ""}
              onChange={(e) => setValor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardar()}
              className="w-32 rounded-md border border-line px-2 py-1 text-sm outline-none focus:border-accent"
            />
            <button onClick={guardar} className="rounded-md bg-foreground px-3 py-1 text-xs text-white">
              Guardar
            </button>
          </div>
        ) : (
          <p className="mt-1 font-display text-2xl">
            {actual == null || actual === 0 ? (
              <span className="text-accent">Pendiente</span>
            ) : euro ? (
              eur(actual)
            ) : (
              actual
            )}
          </p>
        )}
      </div>
      {!editando && (
        <button
          onClick={() => {
            setValor(String(actual ?? ""));
            setEditando(true);
          }}
          className="text-sm text-accent"
        >
          {actual ? "Cambiar" : "Añadir"}
        </button>
      )}
    </Card>
  );
}
