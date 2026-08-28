"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Stat, Progress } from "@/components/ui";
import { CampoBoda } from "@/components/campo-boda";
import { loadBoda } from "@/lib/boda";
import { eur } from "@/lib/mock";
import {
  loadPartidas,
  addPartida,
  updatePartida,
  removePartida,
  removeCategoria,
  renameCategoria,
  categoriasOrdenadas,
  totales,
  type Partida,
} from "@/lib/presupuesto";

export default function PresupuestoPage() {
  const [partidas, setPartidas] = useState<Partida[] | null>(null);
  const [presupuestoTotal, setPresupuestoTotal] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => {
      setPartidas(loadPartidas());
      setPresupuestoTotal(loadBoda().presupuestoTotal);
    };
    sync();
    window.addEventListener("webodas:presupuesto", sync);
    window.addEventListener("webodas:boda", sync);
    return () => {
      window.removeEventListener("webodas:presupuesto", sync);
      window.removeEventListener("webodas:boda", sync);
    };
  }, []);

  const categorias = useMemo(
    () => (partidas ? categoriasOrdenadas(partidas) : []),
    [partidas],
  );
  const tot = useMemo(() => totales(partidas ?? []), [partidas]);

  if (!partidas) return null;

  const referencia = presupuestoTotal ?? 0;
  const sinAsignar = referencia - tot.estimado;

  const nuevaCategoria = () => {
    const nombre = prompt("Nombre de la nueva categoría");
    if (!nombre?.trim()) return;
    addPartida(nombre.trim());
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoBoda campo="presupuestoTotal" label="Presupuesto total" euro />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Estimado"
          value={eur(tot.estimado)}
          sub={
            referencia
              ? `${eur(Math.abs(sinAsignar))} ${sinAsignar >= 0 ? "sin asignar" : "por encima"}`
              : "define el presupuesto total"
          }
        />
        <Stat label="Pagado" value={eur(tot.pagado)} sub={`${eur(tot.estimado - tot.pagado)} pendiente`} />
        <Stat
          label="Avance de pago"
          value={tot.estimado ? `${Math.round((tot.pagado / tot.estimado) * 100)}%` : "—"}
        />
      </div>

      <div className="space-y-4">
        {categorias.map((cat) => {
          const filas = partidas.filter((p) => p.categoria === cat);
          const ct = totales(filas);
          return (
            <Card key={cat} className="p-0">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                <input
                  defaultValue={cat}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== cat) renameCategoria(cat, v);
                    else e.target.value = cat;
                  }}
                  className="min-w-0 flex-1 bg-transparent font-display text-lg outline-none focus:border-b focus:border-accent"
                />
                <span className="shrink-0 text-sm text-muted">
                  {eur(ct.pagado)} / {eur(ct.estimado)}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar la categoría "${cat}" y todas sus partidas?`)) removeCategoria(cat);
                  }}
                  className="shrink-0 text-xs text-muted hover:text-red-600"
                  title="Eliminar categoría"
                >
                  Eliminar
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-2 font-medium">Concepto</th>
                      <th className="px-5 py-2 font-medium">Proveedor</th>
                      <th className="px-3 py-2 text-right font-medium">Estimado</th>
                      <th className="px-3 py-2 text-right font-medium">Pagado</th>
                      <th className="w-32 px-3 py-2 font-medium">Avance</th>
                      <th className="w-8 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filas.map((p) => (
                      <Fila key={p.id} p={p} />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-2.5">
                <button
                  onClick={() => addPartida(cat)}
                  className="text-sm font-medium text-accent"
                >
                  + Añadir partida
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <button
        onClick={nuevaCategoria}
        className="w-full rounded-lg border border-dashed border-line py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent"
      >
        + Añadir categoría
      </button>
    </div>
  );
}

function Fila({ p }: { p: Partida }) {
  const num = (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const pct = p.estimado ? Math.min(100, (p.pagado / p.estimado) * 100) : 0;

  const cell = "w-full bg-transparent outline-none focus:border-b focus:border-accent";

  return (
    <tr>
      <td className="px-5 py-2">
        <input
          defaultValue={p.concepto}
          placeholder="Concepto"
          onBlur={(e) => updatePartida(p.id, { concepto: e.target.value })}
          className={`${cell} font-medium`}
        />
      </td>
      <td className="px-5 py-2">
        <input
          defaultValue={p.proveedor}
          placeholder="—"
          onBlur={(e) => updatePartida(p.id, { proveedor: e.target.value })}
          className={`${cell} text-muted`}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="text"
          inputMode="decimal"
          defaultValue={p.estimado || ""}
          placeholder="0"
          onBlur={(e) => updatePartida(p.id, { estimado: num(e.target.value) })}
          className={`${cell} text-right`}
        />
      </td>
      <td className="px-3 py-2 text-right">
        <input
          type="text"
          inputMode="decimal"
          defaultValue={p.pagado || ""}
          placeholder="0"
          onBlur={(e) => updatePartida(p.id, { pagado: num(e.target.value) })}
          className={`${cell} text-right`}
        />
      </td>
      <td className="px-3 py-2">
        <Progress value={pct} />
      </td>
      <td className="px-3 py-2 text-right">
        <button
          onClick={() => removePartida(p.id)}
          className="text-muted hover:text-red-600"
          title="Eliminar partida"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
