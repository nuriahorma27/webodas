"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resumenInvitados } from "@/lib/invitados";
import {
  FIELD_SETS,
  RUTAS_WEBODAS,
  saveDetalle,
  type TareaDetalle,
  type Campo,
  type ChecklistItem,
  type ProveedorOpcion,
} from "@/lib/tareas";
import { ProveedorOpciones } from "@/components/proveedor-opciones";
import { PartidaLink } from "@/components/partida-link";

// Fichas que se pueden enlazar con una partida del presupuesto.
const LINK_LABELS: Record<string, { estimado: string; pagado: string }> = {
  proveedor: { estimado: "Presupuesto", pagado: "Pagado" },
  reserva: { estimado: "Importe total", pagado: "Señal / pagado" },
  lugarFecha: { estimado: "Coste", pagado: "Pagado" },
  compra: { estimado: "Precio", pagado: "Pagado" },
};

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export function TareaDetalleForm({
  id,
  tipo,
  titulo = "",
  inicial,
}: {
  id: string;
  tipo: string;
  titulo?: string;
  inicial: TareaDetalle;
}) {
  const campos = FIELD_SETS[tipo] ?? FIELD_SETS.simple;
  const esProveedor = tipo === "proveedor";
  const vacio = Object.keys(inicial).length === 0;
  const [d, setD] = useState<TareaDetalle>(inicial);
  const [guardado, setGuardado] = useState(false);
  const [editando, setEditando] = useState(vacio);

  const upd = (k: string, v: string | ChecklistItem[] | ProveedorOpcion[]) => {
    setD((prev) => ({ ...prev, [k]: v }));
    setGuardado(false);
  };

  // Guarda usando el valor recién calculado (evita estado obsoleto).
  const updSave = (k: string, v: string | ChecklistItem[] | ProveedorOpcion[]) => {
    setD((prev) => {
      const next = { ...prev, [k]: v };
      saveDetalle(id, next);
      return next;
    });
  };
  const persist = () => setD((prev) => (saveDetalle(id, prev), prev));

  const guardar = () => {
    saveDetalle(id, d);
    setGuardado(true);
    setEditando(false);
    setTimeout(() => setGuardado(false), 1800);
  };

  if (tipo === "invitados") {
    return <FichaInvitados id={id} d={d} upd={upd} persist={persist} />;
  }

  if (tipo === "webodas") {
    const ruta = RUTAS_WEBODAS[titulo];
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        {ruta && (
          <Link
            href={ruta.href}
            className="inline-block rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            {ruta.label} →
          </Link>
        )}
        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Notas</span>
          <textarea
            rows={2}
            value={(d.notas as string) ?? ""}
            onChange={(e) => upd("notas", e.target.value)}
            onBlur={persist}
            className={inputCls}
          />
        </label>
      </div>
    );
  }

  if (esProveedor) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4">
        <ProveedorOpciones
          opciones={(d.opciones as ProveedorOpcion[]) ?? []}
          contratado={(d.contratado as string) ?? ""}
          onOpciones={(v) => updSave("opciones", v)}
          onContratado={(v) => updSave("contratado", v)}
          onSave={persist}
        />
        <label className="mt-3 block">
          <span className="text-xs font-medium text-muted">Notas generales</span>
          <textarea
            rows={2}
            value={(d.notas as string) ?? ""}
            onChange={(e) => upd("notas", e.target.value)}
            onBlur={persist}
            className={inputCls}
          />
        </label>
        {d.contratado ? (
          <PartidaLink
            tareaId={id}
            conceptoSugerido={
              ((d.opciones as ProveedorOpcion[]) ?? []).find((o) => o.id === d.contratado)?.nombre ?? ""
            }
          />
        ) : (
          <p className="mt-3 border-t border-line pt-3 text-[11px] text-muted">
            Marca la opción contratada para añadirla al presupuesto.
          </p>
        )}
      </div>
    );
  }

  const link = LINK_LABELS[tipo] ?? { estimado: "Presupuesto", pagado: "Pagado" };

  return (
    <div className="relative rounded-lg border border-line bg-surface p-4">
      {!editando && (
        <button
          onClick={() => setEditando(true)}
          title="Editar"
          className="absolute right-2.5 top-2.5 text-xs text-muted hover:text-foreground"
        >
          ✎ editar
        </button>
      )}
      {editando ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {campos.map((c) => (
              <CampoInput
                key={c.key}
                campo={c}
                value={d[c.key] as string | ChecklistItem[] | undefined}
                onChange={(v) => upd(c.key, v)}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={guardar}
              className="rounded-md bg-foreground px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Guardar
            </button>
            {!vacio && (
              <button
                onClick={() => {
                  setD(inicial);
                  setEditando(false);
                }}
                className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-neutral-100"
              >
                Cancelar
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <DetalleLectura campos={campos} d={d} />
          {guardado && <span className="mt-2 block text-xs text-green-600">Guardado ✓</span>}
        </>
      )}

      <PartidaLink
        tareaId={id}
        conceptoSugerido={(d.lugar as string) || (d.tienda as string) || ""}
        labelEstimado={link.estimado}
        labelPagado={link.pagado}
      />
    </div>
  );
}

const fmt = (c: Campo, v: string) => {
  if (c.tipo === "date") {
    const d = new Date(v);
    return isNaN(d.getTime())
      ? v
      : d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
  if (c.tipo === "eur") return `${v} €`;
  return v;
};

function FichaInvitados({
  d,
  upd,
  persist,
}: {
  id: string;
  d: TareaDetalle;
  upd: (k: string, v: string) => void;
  persist: () => void;
}) {
  const [res, setRes] = useState({ grupos: 0, personas: 0, confirmadas: 0, pendientes: 0 });
  useEffect(() => {
    const sync = () => setRes(resumenInvitados());
    sync();
    window.addEventListener("webodas:invitados", sync);
    window.addEventListener("webodas:rsvp", sync);
    return () => {
      window.removeEventListener("webodas:invitados", sync);
      window.removeEventListener("webodas:rsvp", sync);
    };
  }, []);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      {res.personas > 0 ? (
        <div className="flex gap-8">
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-muted">Invitados</span>
            <span className="font-display text-2xl">{res.personas}</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wide text-muted">Confirmados</span>
            <span className="font-display text-2xl">{res.confirmadas}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">Todavía no has añadido invitados.</p>
      )}
      <Link
        href="/panel/gestion/invitados"
        className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
      >
        Gestionar la lista de invitados →
      </Link>
      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted">Notas</span>
        <textarea
          rows={2}
          value={(d.notas as string) ?? ""}
          onChange={(e) => upd("notas", e.target.value)}
          onBlur={persist}
          className={inputCls}
        />
      </label>
    </div>
  );
}

function DetalleLectura({ campos, d }: { campos: Campo[]; d: TareaDetalle }) {
  const filas = campos
    .filter((c) => c.tipo !== "checklist")
    .map((c) => [c, (d[c.key] as string) ?? ""] as const)
    .filter(([, v]) => v);
  const checklist = campos.find((c) => c.tipo === "checklist");
  const items = checklist ? ((d[checklist.key] as ChecklistItem[]) ?? []) : [];

  if (filas.length === 0 && items.length === 0) {
    return <p className="text-sm text-muted">Sin datos todavía. Pulsa «Editar» para rellenar.</p>;
  }

  return (
    <dl className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
      {filas.map(([c, v]) => (
        <div key={c.key} className={c.tipo === "textarea" ? "sm:col-span-2" : ""}>
          <dt className="text-[11px] uppercase tracking-wide text-muted">{c.label}</dt>
          <dd className="mt-0.5 whitespace-pre-wrap">{fmt(c, v)}</dd>
        </div>
      ))}
      {items.length > 0 && (
        <div className="sm:col-span-2">
          <dt className="text-[11px] uppercase tracking-wide text-muted">{checklist?.label}</dt>
          <ul className="mt-1 space-y-0.5">
            {items.map((i) => (
              <li key={i.label} className={i.done ? "text-muted line-through" : ""}>
                {i.done ? "☑" : "☐"} {i.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </dl>
  );
}

function CampoInput({
  campo,
  value,
  onChange,
}: {
  campo: Campo;
  value: string | ChecklistItem[] | undefined;
  onChange: (v: string | ChecklistItem[]) => void;
}) {
  if (campo.tipo === "checklist") {
    return <Checklist campo={campo} value={(value as ChecklistItem[]) ?? []} onChange={onChange} />;
  }

  const v = (value as string) ?? "";
  const wide = campo.tipo === "textarea";

  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-muted">{campo.label}</span>
      {campo.tipo === "textarea" ? (
        <textarea rows={2} value={v} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      ) : campo.tipo === "sino" ? (
        <select value={v} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          <option value="">—</option>
          <option>Sí</option>
          <option>No</option>
        </select>
      ) : (
        <input
          type={
            campo.tipo === "eur"
              ? "number"
              : campo.tipo === "date"
                ? "date"
                : campo.tipo === "email"
                  ? "email"
                  : campo.tipo === "tel"
                    ? "tel"
                    : "text"
          }
          value={v}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </label>
  );
}

function Checklist({
  campo,
  value,
  onChange,
}: {
  campo: Campo;
  value: ChecklistItem[];
  onChange: (v: ChecklistItem[]) => void;
}) {
  const [nuevo, setNuevo] = useState("");

  // Fusiona presets con lo guardado.
  const guardadas = new Map(value.map((i) => [i.label, i.done]));
  const items: ChecklistItem[] = [
    ...(campo.presets ?? []).map((label) => ({ label, done: guardadas.get(label) ?? false })),
    ...value.filter((i) => !(campo.presets ?? []).includes(i.label)),
  ];

  const toggle = (label: string) =>
    onChange(items.map((i) => (i.label === label ? { ...i, done: !i.done } : i)));
  const add = () => {
    if (!nuevo.trim()) return;
    onChange([...items, { label: nuevo.trim(), done: false }]);
    setNuevo("");
  };
  const remove = (label: string) => onChange(items.filter((i) => i.label !== label));

  return (
    <div className="sm:col-span-2">
      <span className="text-xs font-medium text-muted">{campo.label}</span>
      <ul className="mt-1 space-y-1">
        {items.map((i) => (
          <li key={i.label} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={i.done} onChange={() => toggle(i.label)} />
            <span className={i.done ? "text-muted line-through" : ""}>{i.label}</span>
            {!(campo.presets ?? []).includes(i.label) && (
              <button
                onClick={() => remove(i.label)}
                className="ml-auto text-xs text-muted hover:text-red-600"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-1.5 flex gap-1">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder="Añadir…"
          className="flex-1 rounded border border-line px-2 py-1 text-xs"
        />
        <button onClick={add} className="rounded border border-line px-2 text-xs">
          +
        </button>
      </div>
    </div>
  );
}

export function detalleResumen(d?: TareaDetalle): string | undefined {
  if (!d) return undefined;
  const parts: string[] = [];

  // Proveedor: mostrar la opción contratada
  const ops = d.opciones as ProveedorOpcion[] | undefined;
  if (Array.isArray(ops) && ops.length) {
    const c = ops.find((o) => o.id === d.contratado);
    if (c) {
      parts.push(`✓ ${c.nombre || "Contratado"}`);
      if (c.presupuesto) parts.push(`${c.presupuesto} €`);
    } else {
      parts.push(`${ops.length} opciones`);
    }
    return parts.join(" · ");
  }

  const nom = (d.nombre || d.lugar || d.tienda || d.destino) as string | undefined;
  if (nom) parts.push(nom);
  const eur = (d.presupuesto || d.precio) as string | undefined;
  if (eur) parts.push(`${eur} €`);
  const docs = d.docs as ChecklistItem[] | undefined;
  if (Array.isArray(docs) && docs.length) {
    parts.push(`${docs.filter((x) => x.done).length}/${docs.length} docs`);
  }
  return parts.length ? parts.join(" · ") : undefined;
}
