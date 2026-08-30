"use client";

import { useState } from "react";
import { saveBoda, type BodaPerfil, type Persona } from "@/lib/boda";

const field =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent";

export function OnboardingBoda({
  inicial,
  onClose,
}: {
  inicial: BodaPerfil;
  onClose?: () => void;
}) {
  const editar = Boolean(onClose);
  const [p1, setP1] = useState<Persona>(inicial.p1);
  const [p2, setP2] = useState<Persona>(inicial.p2);
  const [fecha, setFecha] = useState(inicial.fecha);
  const [sinFecha, setSinFecha] = useState(!inicial.fecha);
  const [lugar, setLugar] = useState(inicial.lugar);
  const [sinLugar, setSinLugar] = useState(!inicial.lugar && editar ? false : !inicial.lugar);

  const guardar = (e: React.FormEvent) => {
    e.preventDefault();
    saveBoda({
      p1: trim(p1),
      p2: trim(p2),
      fecha: sinFecha ? "" : fecha,
      lugar: sinLugar ? "" : lugar.trim(),
    });
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={editar ? onClose : undefined}
    >
      <form
        onSubmit={guardar}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-xl bg-surface p-6 shadow-xl"
      >
        {editar && (
          <button type="button" onClick={onClose} className="absolute right-4 top-4 text-xl text-neutral-400">
            ×
          </button>
        )}
        <h2 className="font-display text-2xl">
          {editar ? "Datos de la boda" : "Empecemos por vosotros"}
        </h2>
        {!editar && (
          <p className="mt-2 text-sm leading-6 text-muted">Añadid vuestros nombres y, si ya los sabéis, la fecha y el lugar. Así personalizaremos todo el panel; podréis cambiarlo cuando queráis.</p>
        )}

        <PersonaFields titulo="Sobre ti" p={p1} set={setP1} />
        <PersonaFields titulo="Sobre tu pareja" p={p2} set={setP2} />

        <div className="mt-5">
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

        <div className="mt-4">
          <span className="text-sm font-medium">Lugar de la celebración</span>
          <input
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            disabled={sinLugar}
            placeholder="Finca Los Olivos, Madrid"
            className={`${field} disabled:opacity-50`}
          />
          <label className="mt-1.5 flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={sinLugar} onChange={(e) => setSinLugar(e.target.checked)} />
            Todavía no lo tenemos
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          {editar ? "Guardar" : "Preparar nuestro panel"}
        </button>
      </form>
    </div>
  );
}

function PersonaFields({
  titulo,
  p,
  set,
}: {
  titulo: string;
  p: Persona;
  set: (p: Persona) => void;
}) {
  return (
    <fieldset className="mt-5 rounded-lg border border-line p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-muted">{titulo}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium">Nombre</span>
          <input value={p.nombre} onChange={(e) => set({ ...p, nombre: e.target.value })} required className={field} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Apellidos</span>
          <input value={p.apellidos} onChange={(e) => set({ ...p, apellidos: e.target.value })} className={field} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium">Apodo (opcional)</span>
          <input
            value={p.apodo}
            onChange={(e) => set({ ...p, apodo: e.target.value })}
            placeholder="Cómo os llaman"
            className={field}
          />
        </label>
      </div>
    </fieldset>
  );
}

const trim = (p: Persona): Persona => ({
  nombre: p.nombre.trim(),
  apellidos: p.apellidos.trim(),
  apodo: p.apodo.trim(),
});
