"use client";

import { useState } from "react";
import { saveBoda, type BodaPerfil } from "@/lib/boda";

export function OnboardingBoda({
  inicial,
  onClose,
}: {
  inicial: BodaPerfil;
  onClose?: () => void;
}) {
  const editar = Boolean(onClose);
  const [pareja, setPareja] = useState(inicial.pareja);
  const [fecha, setFecha] = useState(inicial.fecha);
  const [sinFecha, setSinFecha] = useState(!inicial.fecha);
  const [lugar, setLugar] = useState(inicial.lugar);

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    saveBoda({ pareja: pareja.trim(), fecha: sinFecha ? "" : fecha, lugar: lugar.trim() });
    onClose?.();
  };

  const field =
    "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={editar ? onClose : undefined}
    >
      <form
        onSubmit={guardar}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-xl bg-surface p-6 shadow-xl"
      >
        {editar && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-xl text-neutral-400"
          >
            ×
          </button>
        )}
        <h2 className="font-display text-2xl">
          {editar ? "Datos de la boda" : "Contadnos de vuestra boda"}
        </h2>
        {!editar && (
          <p className="mt-1 text-sm text-muted">
            Con esto preparamos vuestro panel. Podéis cambiarlo luego.
          </p>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nombres de la pareja</span>
            <input
              value={pareja}
              onChange={(e) => setPareja(e.target.value)}
              placeholder="Ana y Leo"
              required
              className={field}
            />
          </label>

          <div>
            <span className="text-sm font-medium">Fecha de la boda</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              disabled={sinFecha}
              className={`${field} disabled:opacity-50`}
            />
            <label className="mt-1.5 flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={sinFecha} onChange={(e) => setSinFecha(e.target.checked)} />
              Todavía no la tenemos
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Lugar (opcional)</span>
            <input
              value={lugar}
              onChange={(e) => setLugar(e.target.value)}
              placeholder="Finca Los Olivos, Madrid"
              className={field}
            />
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          {editar ? "Guardar" : "Empezar"}
        </button>
      </form>
    </div>
  );
}
