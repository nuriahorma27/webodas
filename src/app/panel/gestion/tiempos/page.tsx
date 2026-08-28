"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Progress } from "@/components/ui";
import { EstadoControl, EstadoLeyenda } from "@/components/estado-control";
import { TareaDetalleForm, detalleResumen } from "@/components/tarea-detalle";
import { descargarTareasExcel } from "@/lib/export-excel";
import { loadBoda } from "@/lib/boda";
import {
  CATEGORIAS,
  FASES,
  TIPOS_TAREA,
  RUTAS_WEBODAS,
  loadTareas,
  loadEstados,
  loadDetalles,
  setEstado,
  addTarea,
  updateTarea,
  removeTarea,
  resetTareas,
  type Estado,
  type Tarea,
  type TareaDetalle,
} from "@/lib/tareas";

type Vista = "tiempo" | "categoria";

const campo =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

/* ---------- fila de tarea (a nivel de módulo para no remontar al abrir) ---------- */

function Row({
  t,
  meta,
  estado,
  abierto,
  editar,
  detalle,
  responsables,
  onToggleOpen,
  onToggleEdit,
}: {
  t: Tarea;
  meta?: string;
  estado: Estado;
  abierto: boolean;
  editar: boolean;
  detalle: TareaDetalle | undefined;
  responsables: string[];
  onToggleOpen: () => void;
  onToggleEdit: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (abierto || editar) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [abierto, editar]);

  const resumen = detalleResumen(detalle);
  const visible =
    t.notaVisible || t.nota || (t.tipo === "webodas" ? RUTAS_WEBODAS[t.titulo]?.sub : "");

  return (
    <li ref={ref} className="scroll-mt-4 text-sm">
      <div className="flex items-start gap-3 px-4 py-2.5">
        <EstadoControl value={estado} onChange={(v) => setEstado(t.id, v)} />
        <button onClick={onToggleOpen} className="min-w-0 flex-1 text-left">
          <p
            className={
              estado === "hecho"
                ? "font-medium text-green-800"
                : estado === "descartada"
                  ? "text-neutral-400 line-through"
                  : ""
            }
          >
            {t.titulo || <span className="text-muted">Tarea sin nombre</span>}
            <span className="ml-1 text-muted">{abierto ? "▾" : "›"}</span>
          </p>
          {visible && <p className="text-xs text-accent">{visible}</p>}
          {resumen && <p className="text-xs text-accent">{resumen}</p>}
        </button>
        {meta && <span className="shrink-0 pt-0.5 text-xs text-muted">{meta}</span>}
        <button
          onClick={onToggleEdit}
          title="Editar tarea"
          className={`shrink-0 rounded px-1.5 text-base leading-none ${
            editar ? "text-accent" : "text-muted hover:text-foreground"
          }`}
        >
          ⋯
        </button>
      </div>

      {abierto && (
        <div className="border-t border-line bg-neutral-50/60 px-4 py-4">
          <TareaDetalleForm id={t.id} tipo={t.tipo} titulo={t.titulo} inicial={detalle ?? {}} />
        </div>
      )}

      {editar && (
        <div className="space-y-3 border-t border-line bg-neutral-50/60 px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs text-muted">Nombre de la tarea</span>
              <input
                defaultValue={t.titulo}
                onBlur={(ev) => updateTarea(t.id, { titulo: ev.target.value })}
                className={campo}
              />
            </label>
            <label className="block">
              <span className="text-xs text-muted">Responsable</span>
              <select
                value={t.responsable ?? ""}
                onChange={(ev) => {
                  if (ev.target.value === "__otra") {
                    const v = prompt("¿Quién se encarga?");
                    if (v?.trim()) updateTarea(t.id, { responsable: v.trim() });
                  } else {
                    updateTarea(t.id, { responsable: ev.target.value });
                  }
                }}
                className={campo}
              >
                <option value="">Sin asignar</option>
                {responsables.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="__otra">Otra persona…</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Momento</span>
              <select
                value={t.fase}
                onChange={(ev) => updateTarea(t.id, { fase: ev.target.value })}
                className={campo}
              >
                {FASES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-muted">Categoría</span>
              <select
                value={t.categoria}
                onChange={(ev) => updateTarea(t.id, { categoria: ev.target.value })}
                className={campo}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs text-muted">Nota visible (aparece bajo el título)</span>
              <input
                defaultValue={t.notaVisible ?? ""}
                onBlur={(ev) => updateTarea(t.id, { notaVisible: ev.target.value })}
                className={campo}
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleEdit}
              className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-white"
            >
              Listo
            </button>
            <button
              onClick={() => {
                if (confirm(`¿Quitar la tarea "${t.titulo || "sin nombre"}"?`)) removeTarea(t.id);
              }}
              className="text-xs text-muted underline hover:text-red-600"
            >
              Quitar esta tarea
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function AddTarea({
  abierto,
  categoria,
  fase,
  onOpen,
  onClose,
  onAdded,
}: {
  abierto: boolean;
  categoria: string;
  fase: string;
  onOpen: () => void;
  onClose: () => void;
  onAdded: (id: string) => void;
}) {
  if (!abierto) {
    return (
      <div className="px-4 py-2">
        <button onClick={onOpen} className="text-sm font-medium text-accent">
          + Añadir tarea
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line bg-neutral-50/60 px-4 py-3">
      <span className="text-xs text-muted">Tipo de ficha:</span>
      {TIPOS_TAREA.map((tp) => (
        <button
          key={tp.value}
          onClick={() => {
            const nueva = addTarea(categoria, fase, tp.value);
            onAdded(nueva.id);
          }}
          className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-accent hover:text-accent"
        >
          {tp.label}
        </button>
      ))}
      <button onClick={onClose} className="text-xs text-muted underline">
        Cancelar
      </button>
    </div>
  );
}

export default function TareasPage() {
  const [vista, setVista] = useState<Vista>("tiempo");
  const [tareas, setTareas] = useState<Tarea[] | null>(null);
  const [estados, setEstados] = useState<Record<string, Estado>>({});
  const [detalles, setDetalles] = useState<Record<string, TareaDetalle>>({});
  const [abierta, setAbierta] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);
  const [filtroResp, setFiltroResp] = useState<string>("");
  const [addEn, setAddEn] = useState<string | null>(null);
  const [nombres, setNombres] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setTareas(loadTareas());
      setEstados(loadEstados());
      setDetalles(loadDetalles());
      const b = loadBoda();
      setNombres([b.p1.nombre.trim(), b.p2.nombre.trim(), "Los dos"].filter(Boolean));
    };
    sync();
    window.addEventListener("webodas:tareas", sync);
    window.addEventListener("webodas:boda", sync);
    return () => {
      window.removeEventListener("webodas:tareas", sync);
      window.removeEventListener("webodas:boda", sync);
    };
  }, []);

  const responsables = useMemo(() => {
    const set = new Set(nombres);
    (tareas ?? []).forEach((t) => t.responsable && set.add(t.responsable));
    return [...set];
  }, [tareas, nombres]);

  if (!tareas) return null;

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const visibles = filtroResp
    ? tareas.filter((t) => (t.responsable ?? "") === filtroResp)
    : tareas;
  const hechas = visibles.filter((t) => estadoDe(t.id) === "hecho").length;

  const toggleOpen = (id: string) => {
    setEditando(null);
    setAbierta((cur) => (cur === id ? null : id));
  };
  const toggleEdit = (id: string) => {
    setAbierta(null);
    setEditando((cur) => (cur === id ? null : id));
  };

  const renderGrupo = (
    titulo: string,
    ts: Tarea[],
    meta: (t: Tarea) => string | undefined,
    add: { groupKey: string; categoria: string; fase: string },
  ) => {
    const done = ts.filter((t) => estadoDe(t.id) === "hecho").length;
    return (
      <Card key={titulo} className="p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-display text-lg">{titulo}</h3>
          <span className="text-xs text-muted">
            {done}/{ts.length}
          </span>
        </div>
        {ts.length > 0 && (
          <div className="px-4">
            <Progress value={(done / ts.length) * 100} />
          </div>
        )}
        <ul className="mt-2 divide-y divide-line">
          {ts.map((t) => (
            <Row
              key={t.id}
              t={t}
              meta={meta(t)}
              estado={estadoDe(t.id)}
              abierto={abierta === t.id}
              editar={editando === t.id}
              detalle={detalles[t.id]}
              responsables={responsables}
              onToggleOpen={() => toggleOpen(t.id)}
              onToggleEdit={() => toggleEdit(t.id)}
            />
          ))}
        </ul>
        <AddTarea
          abierto={addEn === add.groupKey}
          categoria={add.categoria}
          fase={add.fase}
          onOpen={() => setAddEn(add.groupKey)}
          onClose={() => setAddEn(null)}
          onAdded={(id) => {
            setAddEn(null);
            setEditando(null);
            setAbierta(id);
          }}
        />
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
              {hechas} de {visibles.length} terminadas · toca una tarea para ver su ficha
            </p>
          </div>
          <div className="flex gap-1 text-sm">
            {(
              [
                ["tiempo", "Por tiempo"],
                ["categoria", "Por categoría"],
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

        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-xs text-muted">Responsable:</span>
          <button
            onClick={() => setFiltroResp("")}
            className={`rounded-full px-2.5 py-0.5 text-xs ${
              filtroResp === "" ? "bg-foreground text-white" : "border border-line text-muted"
            }`}
          >
            Todos
          </button>
          {responsables.map((r) => (
            <button
              key={r}
              onClick={() => setFiltroResp(r)}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                filtroResp === r ? "bg-foreground text-white" : "border border-line text-muted"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="mt-3">
          <EstadoLeyenda />
        </div>
        <div className="mt-2">
          <Progress value={visibles.length ? (hechas / visibles.length) * 100 : 0} />
        </div>

        <div className="mt-3 flex items-center gap-4">
          <button
            onClick={() => descargarTareasExcel(visibles, estados, detalles)}
            className="rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
          >
            ↓ Descargar en Excel
          </button>
          <button
            onClick={() => {
              if (
                confirm(
                  "¿Volver a la lista de tareas estándar? Se pierden tus cambios en la lista (no los estados).",
                )
              ) {
                resetTareas();
              }
            }}
            className="text-xs text-muted underline hover:text-foreground"
          >
            Restablecer lista estándar
          </button>
        </div>
      </Card>

      <div className="space-y-4">
        {vista === "tiempo"
          ? FASES.map((f) =>
              renderGrupo(
                f,
                visibles.filter((t) => t.fase === f),
                (t) => t.categoria,
                { groupKey: `fase-${f}`, categoria: CATEGORIAS[0], fase: f },
              ),
            )
          : CATEGORIAS.map((c) =>
              renderGrupo(
                c,
                visibles.filter((t) => t.categoria === c),
                (t) => t.fase,
                { groupKey: `cat-${c}`, categoria: c, fase: "Sin fecha asignada" },
              ),
            )}
      </div>
    </div>
  );
}
