"use client";

import { useEffect, useState } from "react";
import { Card, Progress, Badge } from "@/components/ui";
import { EstadoControl, EstadoLeyenda } from "@/components/estado-control";
import { TareaDetalleForm, detalleResumen } from "@/components/tarea-detalle";
import {
  TAREAS,
  CATEGORIAS,
  FASES,
  ESTADOS,
  loadEstados,
  loadDetalles,
  setEstado,
  type Estado,
  type Tarea,
  type TareaDetalle,
} from "@/lib/tareas";

type Vista = "categoria" | "tiempo" | "estado";

export default function TareasPage() {
  const [vista, setVista] = useState<Vista>("categoria");
  const [estados, setEstados] = useState<Record<string, Estado>>({});
  const [detalles, setDetalles] = useState<Record<string, TareaDetalle>>({});
  const [abierta, setAbierta] = useState<string | null>(null);

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

  const Row = ({ t, meta }: { t: Tarea; meta?: string }) => {
    const e = estadoDe(t.id);
    const open = abierta === t.id;
    const resumen = detalleResumen(detalles[t.id]);
    return (
      <li className="text-sm">
        <div className="flex items-start gap-3 px-4 py-2.5">
          <EstadoControl value={e} onChange={(v) => setEstado(t.id, v)} />
          <button
            onClick={() => setAbierta(open ? null : t.id)}
            className="min-w-0 flex-1 text-left"
          >
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
              <span className="ml-1 text-muted">{open ? "▾" : "›"}</span>
            </p>
            {t.nota && <p className="text-xs text-accent">{t.nota}</p>}
            {resumen && <p className="text-xs text-accent">{resumen}</p>}
          </button>
          {meta && <span className="shrink-0 text-xs text-muted">{meta}</span>}
        </div>
        {open && (
          <div className="px-4 pb-4">
            <TareaDetalleForm id={t.id} tipo={t.tipo} inicial={detalles[t.id] ?? {}} />
          </div>
        )}
      </li>
    );
  };

  const Grupo = ({
    titulo,
    tareas,
    meta,
  }: {
    titulo: string;
    tareas: Tarea[];
    meta: (t: Tarea) => string | undefined;
  }) => {
    if (tareas.length === 0) return null;
    const done = tareas.filter((t) => estadoDe(t.id) === "hecho").length;
    return (
      <Card className="p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-display text-lg">{titulo}</h3>
          <span className="text-xs text-muted">
            {done}/{tareas.length}
          </span>
        </div>
        <div className="px-4">
          <Progress value={(done / tareas.length) * 100} />
        </div>
        <ul className="mt-2 divide-y divide-line">
          {tareas.map((t) => (
            <Row key={t.id} t={t} meta={meta(t)} />
          ))}
        </ul>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg">Tareas de la boda</p>
            <p className="text-sm text-muted">
              {hechas} de {TAREAS.length} terminadas · toca una tarea para ver su detalle
            </p>
          </div>
          <div className="flex gap-1 text-sm">
            {(
              [
                ["categoria", "Por categoría"],
                ["tiempo", "Por tiempo"],
                ["estado", "Por estado"],
              ] as [Vista, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setVista(v)}
                className={`rounded-full px-3 py-1 ${
                  vista === v ? "bg-foreground text-white" : "border border-line text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3">
          <EstadoLeyenda />
        </div>
        <div className="mt-2">
          <Progress value={(hechas / TAREAS.length) * 100} />
        </div>
      </Card>

      {vista === "categoria" && (
        <div className="space-y-4">
          {CATEGORIAS.map((c) => (
            <Grupo
              key={c}
              titulo={c}
              tareas={TAREAS.filter((t) => t.categoria === c)}
              meta={(t) => t.fase}
            />
          ))}
        </div>
      )}

      {vista === "tiempo" && (
        <div className="space-y-4">
          {FASES.map((f) => (
            <Grupo
              key={f}
              titulo={f}
              tareas={TAREAS.filter((t) => t.fase === f)}
              meta={(t) => t.categoria}
            />
          ))}
        </div>
      )}

      {vista === "estado" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {ESTADOS.map((e) => {
            const tareas = TAREAS.filter((t) => estadoDe(t.id) === e.value);
            return (
              <Card key={e.value} className="p-0">
                <div className="flex items-center justify-between px-4 py-3">
                  <h3 className="font-display text-lg">{e.label}</h3>
                  <Badge tone={e.tone}>{tareas.length}</Badge>
                </div>
                <ul className="divide-y divide-line">
                  {tareas.map((t) => (
                    <Row key={t.id} t={t} meta={`${t.categoria} · ${t.fase}`} />
                  ))}
                  {tareas.length === 0 && (
                    <li className="px-4 py-6 text-center text-xs text-muted">Nada aquí</li>
                  )}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
