"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Progress } from "@/components/ui";
import { EstadoControl } from "@/components/estado-control";
import { PersonasToggle, personasDe } from "@/components/personas-toggle";
import { TareaDetalleForm } from "@/components/tarea-detalle";
import { descargarTareasExcel } from "@/lib/export-excel";
import { loadBoda, mesesRestantes } from "@/lib/boda";
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

// A qué bloque de la cuenta atrás toca prestar atención ahora.
function faseActualDe(meses: number | null): string {
  if (meses == null || meses >= 12) return "12 meses antes";
  if (meses >= 9) return "10-11 meses antes";
  if (meses >= 7) return "8-9 meses antes";
  if (meses >= 5) return "6-7 meses antes";
  if (meses >= 3) return "4-5 meses antes";
  if (meses >= 1) return "2-3 meses antes";
  if (meses >= 0.25) return "Último mes";
  if (meses >= 0.03) return "Última semana";
  return "El día de la boda";
}

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
          <p className="mt-1 text-xs text-muted">Del perfil de la boda: {base.join(" · ")}</p>
        )}

        <ul className="mt-3 divide-y divide-line">
          {custom.length === 0 && (
            <li className="py-2 text-sm text-muted">Aún no habéis añadido a nadie.</li>
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
        estado === "hecho" ? "bg-[#eef1eb]" : estado === "proceso" ? "bg-[#f6f0e3]" : ""
      }`}
    >
      <div className="px-4 py-2.5">
        <div className="flex flex-wrap items-start gap-3 sm:flex-nowrap">
          <span data-tour="tareas-estado" className="order-2 sm:order-1">
            <EstadoControl value={estado} onChange={(v) => setEstado(t.id, v)} />
          </span>
          <button onClick={onToggleOpen} className="order-1 min-w-0 flex-1 text-left sm:order-2">
            <p
              className={
                estado === "hecho"
                  ? "font-medium text-[#4f6049]"
                  : estado === "proceso"
                    ? "font-medium text-[#745f32]"
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
            className={`order-3 shrink-0 rounded px-1.5 text-base leading-none ${
              editar ? "text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            ⋯
          </button>
        </div>
      </div>

      {abierto && (
        <div className="space-y-3 border-t border-line bg-accent-soft/25 px-4 py-4">
          <div>
            <span className="text-xs font-medium text-muted">Responsable</span>
            <div className="mt-1.5">
              <PersonasToggle
                valor={t.responsable}
                opciones={responsables}
                onChange={(v) => updateTarea(t.id, { responsable: v })}
              />
            </div>
          </div>
          <TareaDetalleForm id={t.id} tipo={t.tipo} titulo={t.titulo} inicial={detalle ?? {}} />
        </div>
      )}

      {editar && (
        <div className="space-y-3 border-t border-line bg-accent-soft/25 px-4 py-4">
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

/* Fila del "día de la boda": no tiene estados, solo responsables.
   Al asignar a alguien la fila se pone en verde. Puede haber varias personas. */
function FilaReparto({
  t,
  responsables,
}: {
  t: Tarea;
  responsables: string[];
}) {
  const asignada = personasDe(t.responsable).length > 0;
  return (
    <li className={`px-4 py-3 text-sm ${asignada ? "bg-accent-soft/60" : ""}`}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[0.6rem] ${
            asignada ? "border-accent bg-accent text-white" : "border-line"
          }`}
        >
          {asignada ? "✓" : ""}
        </span>
        <div className="min-w-0 flex-1">
          <p className={asignada ? "font-medium" : ""}>{t.titulo}</p>
          <div className="mt-1.5">
            <PersonasToggle
              valor={t.responsable}
              opciones={responsables}
              onChange={(v) => updateTarea(t.id, { responsable: v })}
              size="xs"
            />
          </div>
        </div>
      </div>
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
    <div className="flex flex-wrap items-center gap-2 border-t border-line bg-accent-soft/25 px-4 py-3">
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
  const [meses, setMeses] = useState<number | null>(null);
  const [respCustom, setRespCustom] = useState<string[]>([]);
  const [gestionResp, setGestionResp] = useState(false);
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [cats, setCats] = useState<string[]>([]);
  const [catsOcultas, setCatsOcultas] = useState<string[]>([]);
  const [grupoAbierto, setGrupoAbierto] = useState<Record<string, boolean>>({});
  const filtrosRef = useRef<HTMLDivElement>(null);

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
      setMeses(mesesRestantes(b));
    };
    sync();
    window.addEventListener("webodas:tareas", sync);
    window.addEventListener("webodas:boda", sync);
    return () => {
      window.removeEventListener("webodas:tareas", sync);
      window.removeEventListener("webodas:boda", sync);
    };
  }, []);

  useEffect(() => {
    if (!filtrosOpen) return;
    const cerrar = (e: MouseEvent) => {
      if (filtrosRef.current && !filtrosRef.current.contains(e.target as Node)) setFiltrosOpen(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, [filtrosOpen]);

  const responsables = useMemo(
    () => [...new Set([...nombres, ...respCustom])],
    [nombres, respCustom],
  );

  if (!tareas) return null;

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const visibles = filtroResp
    ? tareas.filter((t) => personasDe(t.responsable).includes(filtroResp))
    : tareas;
  // Las tareas del día de la boda solo se asignan; no cuentan para el progreso.
  const contables = visibles.filter((t) => t.fase !== "El día de la boda");
  const hechas = contables.filter((t) => estadoDe(t.id) === "hecho").length;
  const pct = contables.length ? Math.round((hechas / contables.length) * 100) : 0;
  const faseActual = faseActualDe(meses);
  const filtroActivo = filtroResp !== "" || vista !== "tiempo";

  const toggleOpen = (id: string) => {
    setEditando(null);
    setAbierta((cur) => (cur === id ? null : id));
  };
  const toggleEdit = (id: string) => {
    setAbierta(null);
    setEditando((cur) => (cur === id ? null : id));
  };

  /* ---------- vista "Por categoría": lista de tarjetas (se mantiene) ---------- */
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
      <Card key={titulo} className="p-0" data-tour="tareas-grupo">
        <button
          type="button"
          onClick={() => setGrupoAbierto((s) => ({ ...s, [add.groupKey]: !abierto }))}
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

  /* ---------- vista "Cuenta atrás": línea temporal vertical ---------- */
  const renderTimeline = () => {
    const idxActual = FASES.indexOf(faseActual);
    return (
      <ol className="relative ml-3 space-y-3 border-l border-line pl-6 sm:ml-4 sm:pl-8">
        {FASES.map((f, i) => {
          const ts = visibles.filter((t) => t.fase === f);
          if (f === "Sin fecha asignada" && ts.length === 0) return null;
          const esDia = f === "El día de la boda";
          const done = ts.filter((t) => estadoDe(t.id) === "hecho").length;
          const asignadas = ts.filter((t) => personasDe(t.responsable).length > 0).length;
          const pendientes = ts.length - done;
          const esActual = f === faseActual;
          const pasada = i < idxActual;
          const groupKey = `fase-${f}`;
          const abierto = grupoAbierto[groupKey] ?? (esActual || esDia);
          const alerta = pasada && pendientes > 0 && !esDia;

          return (
            <li key={f} className="relative">
              {/* nodo en la línea */}
              <span
                aria-hidden
                className={`absolute top-1.5 rounded-full border-2 ${
                  esDia
                    ? "-left-[calc(1.5rem+5px)] h-4 w-4 border-accent bg-accent-soft sm:-left-[calc(2rem+5px)]"
                    : "-left-[calc(1.5rem+1px)] h-3 w-3 sm:-left-[calc(2rem+1px)]"
                } ${
                  esDia
                    ? ""
                    : esActual
                      ? "border-accent bg-accent"
                      : alerta
                        ? "border-[#a9864d] bg-surface"
                        : pasada
                          ? "border-line bg-line"
                          : "border-line bg-surface"
                }`}
              />

              <div
                className={`overflow-hidden rounded-xl border ${
                  esDia
                    ? "border-accent/50 bg-accent-soft/30"
                    : esActual
                      ? "border-accent/40 bg-surface"
                      : "border-line bg-surface"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setGrupoAbierto((s) => ({ ...s, [groupKey]: !abierto }))}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-display ${esActual || esDia ? "text-xl" : "text-lg"} ${
                          pasada && !alerta && !esDia ? "text-muted" : ""
                        }`}
                      >
                        {f}
                      </span>
                      {esDia && (
                        <span className="rounded-full border border-accent px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-accent-deep">
                          Para delegar
                        </span>
                      )}
                      {esActual && !esDia && (
                        <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-white">
                          Ahora
                        </span>
                      )}
                      {alerta && (
                        <span className="rounded-full bg-[#f4ead6] px-2 py-0.5 text-[0.65rem] font-medium text-[#8a6a34]">
                          {pendientes} sin hacer
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {esDia
                        ? `${asignadas} de ${ts.length} con responsable · se reparten entre familiares y amigos`
                        : ts.length === 0
                          ? "Sin tareas"
                          : done === ts.length
                            ? `Todo hecho · ${ts.length}`
                            : `${done} de ${ts.length} hechas`}
                    </span>
                  </span>
                  <span
                    className="ml-auto shrink-0 text-muted transition-transform"
                    style={{ transform: abierto ? "rotate(90deg)" : "none" }}
                    aria-hidden
                  >
                    ▸
                  </span>
                </button>

                {ts.length > 0 && (
                  <div className="px-4 pb-1">
                    <Progress value={esDia ? (asignadas / ts.length) * 100 : (done / ts.length) * 100} />
                  </div>
                )}

                {abierto && f === "El día de la boda" && (
                  <>
                    <p className="border-t border-line bg-accent-soft/25 px-4 py-3 text-xs leading-relaxed text-muted">
                      Estas tareas no las hacéis vosotros, sino que se reparten entre familiares y
                      amigos de confianza para que no tengáis que preocuparos de nada el día de la
                      boda. <strong className="text-foreground">Asigna un responsable a cada tarea</strong>{" "}
                      (aquí no se marcan como terminadas). Podéis añadir personas desde «Configuración
                      → + Nuevo». Cuando una tarea tiene responsable se pone en verde.
                    </p>
                    <ul className="divide-y divide-line border-t border-line">
                      {ts.map((t) => (
                        <FilaReparto key={t.id} t={t} responsables={responsables} />
                      ))}
                      {ts.length === 0 && (
                        <li className="px-4 py-3 text-sm text-muted">Nada por aquí todavía.</li>
                      )}
                    </ul>
                    <AddTarea
                      abierto={addEn === groupKey}
                      categoria={cats[0] ?? "Otros"}
                      fase={f}
                      onOpen={() => setAddEn(groupKey)}
                      onClose={() => setAddEn(null)}
                      onAdded={(id) => {
                        setAddEn(null);
                        setEditando(null);
                        setAbierta(id);
                      }}
                    />
                  </>
                )}

                {abierto && f !== "El día de la boda" && (
                  <>
                    <ul className="mt-2 divide-y divide-line border-t border-line">
                      {ts.map((t) => (
                        <Row
                          key={t.id}
                          t={t}
                          meta={t.categoria}
                          estado={estadoDe(t.id)}
                          abierto={abierta === t.id}
                          editar={editando === t.id}
                          detalle={detalles[t.id]}
                          responsables={responsables}
                          onToggleOpen={() => toggleOpen(t.id)}
                          onToggleEdit={() => toggleEdit(t.id)}
                        />
                      ))}
                      {ts.length === 0 && (
                        <li className="px-4 py-3 text-sm text-muted">Nada por aquí todavía.</li>
                      )}
                    </ul>
                    <AddTarea
                      abierto={addEn === groupKey}
                      categoria={cats[0] ?? "Otros"}
                      fase={f}
                      onOpen={() => setAddEn(groupKey)}
                      onClose={() => setAddEn(null)}
                      onAdded={(id) => {
                        setAddEn(null);
                        setEditando(null);
                        setAbierta(id);
                      }}
                    />
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    );
  };

  return (
    <div className="space-y-6">
      {/* cabecera mínima */}
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Tareas de la boda</h2>
            <p className="mt-1 text-sm text-muted">
              Vais por el <span className="font-medium text-foreground">{pct}%</span> · {hechas} de{" "}
              {contables.length} hechas
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div ref={filtrosRef} className="relative">
              <button
                onClick={() => setFiltrosOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition ${
                  filtroActivo
                    ? "border-accent text-accent"
                    : "border-line text-muted hover:text-foreground"
                }`}
              >
                Configuración
                {filtroActivo && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                <span aria-hidden className="text-xs">▾</span>
              </button>

              {filtrosOpen && (
                <div className="absolute right-0 z-40 mt-1.5 w-64 rounded-xl border border-line bg-surface p-3 shadow-lg">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Ver</p>
                  <div className="mt-1.5 flex gap-1.5">
                    {(
                      [
                        ["tiempo", "Cuenta atrás"],
                        ["categoria", "Por categoría"],
                      ] as [Vista, string][]
                    ).map(([v, label]) => (
                      <button
                        key={v}
                        onClick={() => setVista(v)}
                        className={`flex-1 rounded-md px-2 py-1.5 text-xs ${
                          vista === v
                            ? "bg-foreground text-white"
                            : "border border-line text-muted hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">
                    Responsable
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFiltroResp("")}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        filtroResp === ""
                          ? "bg-foreground text-white"
                          : "border border-line text-muted"
                      }`}
                    >
                      Todos
                    </button>
                    {responsables.map((r) => (
                      <button
                        key={r}
                        onClick={() => setFiltroResp(r)}
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          filtroResp === r
                            ? "bg-foreground text-white"
                            : "border border-line text-muted"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      onClick={() => setGestionResp(true)}
                      className="rounded-full border border-dashed border-line px-2.5 py-1 text-xs text-muted hover:text-accent"
                    >
                      + Nuevo
                    </button>
                  </div>

                  <div className="mt-3 border-t border-line pt-2">
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "¿Volver a la lista de tareas estándar? Se pierden vuestros cambios en la lista (no los estados).",
                          )
                        ) {
                          resetTareas();
                          setFiltrosOpen(false);
                        }
                      }}
                      className="text-xs text-muted underline hover:text-foreground"
                    >
                      Restablecer lista estándar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => descargarTareasExcel(visibles, estados, detalles)}
              className="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-accent"
            >
              ↓ Excel
            </button>
          </div>
        </div>

        <div className="mt-3">
          <Progress value={pct} />
        </div>
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

      {vista === "tiempo" ? (
        renderTimeline()
      ) : (
        <div className="space-y-4">
          {(() => {
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
            return cats.map((c) => {
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
                      `¿Eliminar la categoría "${c}" y todas sus tareas? Podréis recuperarla luego.`,
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
      )}

      {vista === "categoria" && catsOcultas.length > 0 && (
        <p className="text-xs text-muted">
          Categorías ocultas:{" "}
          {catsOcultas.map((c, i) => (
            <span key={c}>
              {i > 0 && ", "}
              <button onClick={() => recuperarCategoria(c)} className="underline hover:text-accent">
                {c}
              </button>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
