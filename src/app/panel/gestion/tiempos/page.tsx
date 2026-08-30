"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Progress } from "@/components/ui";
import { EstadoControl } from "@/components/estado-control";
import { TareaDetalleForm } from "@/components/tarea-detalle";
import { descargarTareasExcel } from "@/lib/export-excel";
import { loadBoda } from "@/lib/boda";
import {
  CATEGORIAS,
  FASES,
  TIPOS_TAREA,
  loadTareas,
  loadEstados,
  loadDetalles,
  loadResponsablesCustom,
  loadCategorias,
  loadCategoriasOcultas,
  ocultarCategoria,
  recuperarCategoria,
  addResponsableCustom,
  removeResponsableCustom,
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

function PersonasModal({
  base,
  custom,
  onClose,
  onRemove,
}: {
  base: string[];
  custom: string[];
  onClose: () => void;
  onRemove: (nombre: string) => void;
}) {
  const [nombre, setNombre] = useState("");
  const anadir = () => {
    const n = nombre.trim();
    if (n) {
      addResponsableCustom(n);
      setNombre("");
    }
  };
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-surface p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Personas</h3>
          <button onClick={onClose} className="text-xl text-neutral-400 hover:text-foreground">
            ×
          </button>
        </div>

        {base.length > 0 && (
          <p className="mt-1 text-xs text-muted">
            Del perfil de la boda: {base.join(" · ")}
          </p>
        )}

        <ul className="mt-3 divide-y divide-line">
          {custom.length === 0 && (
            <li className="py-2 text-sm text-muted">Aún no has añadido a nadie.</li>
          )}
          {custom.map((r) => (
            <li key={r} className="flex items-center justify-between py-2 text-sm">
              <span>{r}</span>
              <button
                onClick={() => {
                  if (confirm(`¿Quitar a "${r}"? Se desasignará de sus tareas.`)) onRemove(r);
                }}
                className="text-muted hover:text-red-600"
                title="Quitar"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && anadir()}
            placeholder="Nombre de la persona"
            autoFocus
            className="flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={anadir}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}

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

  return (
    <li
      ref={ref}
      className={`scroll-mt-4 text-sm ${
        estado === "hecho" ? "bg-emerald-50" : estado === "proceso" ? "bg-amber-50" : ""
      }`}
    >
      <div className="px-4 py-2.5">
        <div className="flex items-start gap-3">
          <EstadoControl value={estado} onChange={(v) => setEstado(t.id, v)} />
          <button onClick={onToggleOpen} className="min-w-0 flex-1 text-left">
            <p
              className={
                estado === "hecho"
                  ? "font-medium text-emerald-900"
                  : estado === "proceso"
                    ? "font-medium text-amber-900"
                    : ""
              }
            >
              {t.titulo || <span className="text-muted">Tarea sin nombre</span>}
              <span className="ml-1 text-muted">{abierto ? "▾" : "›"}</span>
            </p>
            {(t.responsable || meta) && (
              <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                {t.responsable && (
                  <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">
                    {t.responsable}
                  </span>
                )}
                {meta && <span className="text-muted">{meta}</span>}
              </span>
            )}
          </button>
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
      </div>

      {abierto && (
        <div className="space-y-3 border-t border-line bg-neutral-50/60 px-4 py-4">
          <label className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-muted">Responsable</span>
            <select
              value={t.responsable ?? ""}
              onChange={(ev) => {
                updateTarea(t.id, { responsable: ev.target.value });
              }}
              className="rounded-md border border-line bg-surface px-2.5 py-1 text-sm outline-none focus:border-accent"
            >
              <option value="">Sin asignar</option>
              {responsables.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
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
  const [respCustom, setRespCustom] = useState<string[]>([]);
  const [gestionResp, setGestionResp] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [catsOcultas, setCatsOcultas] = useState<string[]>([]);
  const [grupoAbierto, setGrupoAbierto] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sync = () => {
      setTareas(loadTareas());
      setEstados(loadEstados());
      setDetalles(loadDetalles());
      setRespCustom(loadResponsablesCustom());
      setCats(loadCategorias());
      setCatsOcultas(loadCategoriasOcultas());
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

  const responsables = useMemo(
    () => [...new Set([...nombres, ...respCustom])],
    [nombres, respCustom],
  );

  if (!tareas) return null;

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const visibles = filtroResp
    ? tareas.filter((t) => (t.responsable ?? "") === filtroResp)
    : tareas;
  const total = visibles.length;
  const cuenta = {
    sin: visibles.filter((t) => estadoDe(t.id) === "sin").length,
    proceso: visibles.filter((t) => estadoDe(t.id) === "proceso").length,
    hecho: visibles.filter((t) => estadoDe(t.id) === "hecho").length,
  };
  const hechas = cuenta.hecho;

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
    defaultOpen: boolean,
    onDelete?: () => void,
  ) => {
    const done = ts.filter((t) => estadoDe(t.id) === "hecho").length;
    const abierto = grupoAbierto[add.groupKey] ?? defaultOpen;
    return (
      <Card key={titulo} className="p-0">
        <button
          type="button"
          onClick={() =>
            setGrupoAbierto((s) => ({ ...s, [add.groupKey]: !abierto }))
          }
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span
            className="shrink-0 text-muted transition-transform"
            style={{ transform: abierto ? "rotate(90deg)" : "none" }}
            aria-hidden
          >
            ▸
          </span>
          <h3 className="font-display text-lg">{titulo}</h3>
          <span className="ml-auto shrink-0 text-xs text-muted">
            {done}/{ts.length}
          </span>
          {onDelete && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="shrink-0 text-xs text-muted hover:text-red-600"
              title="Eliminar esta categoría"
            >
              Eliminar
            </span>
          )}
        </button>
        {ts.length > 0 && (
          <div className="px-4 pb-1">
            <Progress value={(done / ts.length) * 100} />
          </div>
        )}
        {!abierto ? null : (
          <>
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
          </>
        )}
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
          <button
            onClick={() => setGestionResp(true)}
            className="rounded-full border border-dashed border-line px-2.5 py-0.5 text-xs text-muted hover:text-accent"
          >
            Gestionar personas
          </button>
        </div>

        {gestionResp && (
          <PersonasModal
            base={nombres}
            custom={respCustom}
            onClose={() => setGestionResp(false)}
            onRemove={(r) => {
              removeResponsableCustom(r);
              if (filtroResp === r) setFiltroResp("");
            }}
          />
        )}

        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {(
            [
              ["Sin empezar", cuenta.sin, "bg-slate-300"],
              ["En proceso", cuenta.proceso, "bg-amber-300"],
              ["Terminadas", cuenta.hecho, "bg-emerald-400"],
            ] as [string, number, string][]
          ).map(([label, n, color]) => {
            const pct = total ? Math.round((n / total) * 100) : 0;
            return (
              <div key={label}>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium">
                    {n} · {pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
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
        {(() => {
          // Abrir por defecto solo el primer grupo con tareas pendientes.
          let yaAbierto = false;
          const defaultOpen = (ts: Tarea[]) => {
            if (yaAbierto) return false;
            const pendientes = ts.some((t) => estadoDe(t.id) !== "hecho");
            if (pendientes) {
              yaAbierto = true;
              return true;
            }
            return false;
          };
          return vista === "tiempo"
            ? FASES.map((f) => {
                const ts = visibles.filter((t) => t.fase === f);
                return renderGrupo(
                  f,
                  ts,
                  (t) => t.categoria,
                  { groupKey: `fase-${f}`, categoria: cats[0] ?? "Otros", fase: f },
                  defaultOpen(ts),
                );
              })
            : cats.map((c) => {
                const ts = visibles
                  .filter((t) => t.categoria === c)
                  .sort((a, b) => FASES.indexOf(a.fase) - FASES.indexOf(b.fase));
                return renderGrupo(
                  c,
                  ts,
                  (t) => t.fase,
                  { groupKey: `cat-${c}`, categoria: c, fase: "Sin fecha asignada" },
                  defaultOpen(ts),
                  () => {
                    if (
                      confirm(
                        `¿Eliminar la categoría "${c}" y todas sus tareas? Podrás recuperarla luego.`,
                      )
                    ) {
                      ocultarCategoria(c);
                      if (filtroResp) setFiltroResp("");
                    }
                  },
                );
              });
        })()}
      </div>

      {vista === "categoria" && catsOcultas.length > 0 && (
        <p className="text-xs text-muted">
          Categorías ocultas:{" "}
          {catsOcultas.map((c, i) => (
            <span key={c}>
              {i > 0 && ", "}
              <button
                onClick={() => recuperarCategoria(c)}
                className="underline hover:text-accent"
              >
                {c}
              </button>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
