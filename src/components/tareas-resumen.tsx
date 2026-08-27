"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Progress } from "@/components/ui";
import { EstadoControl, EstadoLeyenda } from "@/components/estado-control";
import { detalleResumen } from "@/components/tarea-detalle";
import {
  TAREAS,
  CATEGORIAS,
  loadEstados,
  loadDetalles,
  setEstado,
  type Estado,
  type TareaDetalle,
} from "@/lib/tareas";

export function TareasResumen() {
  const [estados, setEstados] = useState<Record<string, Estado>>({});
  const [detalles, setDetalles] = useState<Record<string, TareaDetalle>>({});

  useEffect(() => {
    const sync = () => {
      setEstados(loadEstados());
      setDetalles(loadDetalles());
    };
    sync();
    window.addEventListener("webodas:tareas", sync);
    return () => window.removeEventListener("webodas:tareas", sync);
  }, []);

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const hechas = TAREAS.filter((t) => estadoDe(t.id) === "hecho").length;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Tus tareas</h2>
        <Link href="/panel/gestion/tiempos" className="text-sm text-accent">
          Ver todas →
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        {hechas} de {TAREAS.length} terminadas
      </p>
      <div className="mt-3">
        <EstadoLeyenda />
      </div>
      <div className="mt-2">
        <Progress value={(hechas / TAREAS.length) * 100} />
      </div>

      <div className="mt-4 max-h-96 space-y-4 overflow-y-auto pr-1">
        {CATEGORIAS.map((c) => {
          const tareas = TAREAS.filter((t) => t.categoria === c);
          const done = tareas.filter((t) => estadoDe(t.id) === "hecho").length;
          return (
            <div key={c}>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.15em] text-muted">{c}</p>
                <span className="text-xs text-muted">
                  {done}/{tareas.length}
                </span>
              </div>
              <ul className="mt-1 divide-y divide-line">
                {tareas.map((t) => {
                  const e = estadoDe(t.id);
                  return (
                    <li key={t.id} className="flex items-start gap-3 py-2 text-sm">
                      <EstadoControl value={e} onChange={(v) => setEstado(t.id, v)} />
                      <div className="min-w-0 flex-1">
                        <p
                          className={
                            e === "hecho"
                              ? "font-medium text-green-800"
                              : e === "descartada"
                                ? "text-neutral-400 line-through"
                                : ""
                          }
                        >
                          {t.titulo}
                        </p>
                        {detalleResumen(detalles[t.id]) && (
                          <p className="text-xs text-accent">{detalleResumen(detalles[t.id])}</p>
                        )}
                        {t.nota && <p className="text-xs text-accent">{t.nota}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
