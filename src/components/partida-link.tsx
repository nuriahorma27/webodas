"use client";

import { useEffect, useState } from "react";
import { eur } from "@/lib/mock";
import {
  loadPartidas,
  updatePartida,
  vincularPartida,
  desvincularTarea,
  crearPartidaVinculada,
  partidaByTarea,
  categoriasOrdenadas,
  estimadoDe,
  type Partida,
} from "@/lib/presupuesto";

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";
const numCls =
  "w-24 rounded-md border border-line bg-surface px-2 py-1 text-right text-sm outline-none focus:border-accent";

export function PartidaLink({
  tareaId,
  conceptoSugerido = "",
  labelEstimado = "Presupuesto",
  labelPagado = "Pagado",
}: {
  tareaId: string;
  conceptoSugerido?: string;
  labelEstimado?: string;
  labelPagado?: string;
}) {
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [creando, setCreando] = useState(false);
  const [nuevaCat, setNuevaCat] = useState("");
  const [nuevoConcepto, setNuevoConcepto] = useState(conceptoSugerido);

  useEffect(() => {
    const sync = () => setPartidas(loadPartidas());
    sync();
    window.addEventListener("webodas:presupuesto", sync);
    return () => window.removeEventListener("webodas:presupuesto", sync);
  }, []);

  const vinculada = partidaByTarea(tareaId);
  const cats = categoriasOrdenadas(partidas);

  if (vinculada) {
    return (
      <div className="mt-3 border-t border-line pt-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted">
            Presupuesto
          </span>
          <span className="text-xs text-muted">
            {vinculada.categoria} › {vinculada.concepto || "sin nombre"}
          </span>
          <button
            onClick={() => desvincularTarea(tareaId)}
            className="ml-auto text-xs text-muted underline hover:text-red-600"
          >
            Desvincular
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted">{labelEstimado}</span>
            <input
              type="number"
              defaultValue={estimadoDe(vinculada) || ""}
              onBlur={(e) => updatePartida(vinculada.id, { estimado: Number(e.target.value) || 0 })}
              className={numCls}
            />
            <span className="text-xs text-muted">€</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted">{labelPagado}</span>
            <input
              type="number"
              defaultValue={vinculada.pagado || ""}
              onBlur={(e) => updatePartida(vinculada.id, { pagado: Number(e.target.value) || 0 })}
              className={numCls}
            />
            <span className="text-xs text-muted">€</span>
          </label>
        </div>
      </div>
    );
  }

  if (creando) {
    return (
      <div className="mt-3 rounded-md border border-line bg-neutral-50/60 p-3">
        <p className="text-xs font-medium text-muted">Crear partida nueva en el presupuesto</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <select
            value={nuevaCat}
            onChange={(e) => setNuevaCat(e.target.value)}
            className={inputCls}
          >
            <option value="">Categoría…</option>
            {cats.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={nuevoConcepto}
            onChange={(e) => setNuevoConcepto(e.target.value)}
            placeholder="Concepto"
            className={inputCls}
          />
        </div>
        <div className="mt-2 flex gap-3">
          <button
            onClick={() => {
              crearPartidaVinculada(nuevaCat, nuevoConcepto.trim() || conceptoSugerido, tareaId);
              setCreando(false);
            }}
            disabled={!nuevaCat}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Crear y vincular
          </button>
          <button onClick={() => setCreando(false)} className="text-xs text-muted underline">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
        Presupuesto
      </span>
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value === "__nueva") setCreando(true);
            else if (e.target.value) vincularPartida(e.target.value, tareaId);
          }}
          className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
        >
          <option value="">Vincular a una partida…</option>
          {cats.map((c) => (
            <optgroup key={c} label={c}>
              {partidas
                .filter((p) => p.categoria === c)
                .map((p) => (
                  <option key={p.id} value={p.id} disabled={!!p.tareaId}>
                    {p.concepto || "(sin nombre)"}
                    {p.estimado ? ` — ${eur(p.estimado)}` : ""}
                    {p.tareaId ? " (ya vinculada)" : ""}
                  </option>
                ))}
            </optgroup>
          ))}
          <option value="__nueva">➕ Crear partida nueva…</option>
        </select>
      </div>
    </div>
  );
}
