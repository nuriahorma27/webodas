"use client";

import { useState } from "react";
import { type ProveedorOpcion } from "@/lib/tareas";

const inputCls =
  "mt-1 w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export function ProveedorOpciones({
  opciones,
  contratado,
  onOpciones,
  onContratado,
  onSave,
}: {
  opciones: ProveedorOpcion[];
  contratado: string;
  onOpciones: (v: ProveedorOpcion[]) => void;
  onContratado: (v: string) => void;
  onSave: () => void;
}) {
  const [abierta, setAbierta] = useState<string | null>(null);
  const [editando, setEditando] = useState<string | null>(null);

  const upd = (optId: string, patch: Partial<ProveedorOpcion>) =>
    onOpciones(opciones.map((o) => (o.id === optId ? { ...o, ...patch } : o)));
  const del = (optId: string) => {
    onOpciones(opciones.filter((o) => o.id !== optId));
    if (contratado === optId) onContratado("");
    setTimeout(onSave, 0);
  };
  const add = () => {
    const nuevo: ProveedorOpcion = {
      id: crypto.randomUUID(),
      nombre: "",
      email: "",
      telefono: "",
      presupuesto: "",
      notas: "",
    };
    onOpciones([...opciones, nuevo]);
    setAbierta(nuevo.id);
    setEditando(nuevo.id);
  };

  return (
    <div className="space-y-2">
      {opciones.map((o) => {
        const isC = contratado === o.id;
        const open = abierta === o.id;
        const edit = editando === o.id;
        return (
          <div
            key={o.id}
            className={`overflow-hidden rounded-lg border ${isC ? "border-green-500" : "border-line"}`}
          >
            <div className={`flex items-center gap-3 px-3 py-2 ${isC ? "bg-green-50" : "bg-surface"}`}>
              <button
                onClick={() => {
                  setAbierta(open ? null : o.id);
                  setEditando(null);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <span className="text-sm font-medium">{o.nombre || "Sin nombre"}</span>
                {o.presupuesto && (
                  <span className="ml-2 text-sm text-muted">{o.presupuesto} €</span>
                )}
              </button>

              {isC ? (
                <button
                  onClick={() => onContratado("")}
                  title="Quitar como contratado"
                  className="rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700"
                >
                  ✓ CONTRATADO
                </button>
              ) : (
                <button
                  onClick={() => onContratado(o.id)}
                  className="rounded-full border border-green-600 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                >
                  Marcar contratado
                </button>
              )}

              <button
                onClick={() => {
                  setAbierta(open ? null : o.id);
                  setEditando(null);
                }}
                className="text-muted"
              >
                {open ? "▾" : "›"}
              </button>
            </div>

            {open && (
              <div className="border-t border-line px-3 py-3">
                {edit ? (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-muted">Nombre / empresa</span>
                        <input className={inputCls} value={o.nombre} onChange={(e) => upd(o.id, { nombre: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-muted">Email</span>
                        <input type="email" className={inputCls} value={o.email} onChange={(e) => upd(o.id, { email: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-muted">Teléfono</span>
                        <input type="tel" className={inputCls} value={o.telefono} onChange={(e) => upd(o.id, { telefono: e.target.value })} />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-muted">Presupuesto (€)</span>
                        <input type="number" className={inputCls} value={o.presupuesto} onChange={(e) => upd(o.id, { presupuesto: e.target.value })} />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-xs font-medium text-muted">Qué incluye / notas</span>
                        <textarea rows={2} className={inputCls} value={o.notas} onChange={(e) => upd(o.id, { notas: e.target.value })} />
                      </label>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSave();
                          setEditando(null);
                        }}
                        className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="rounded-md border border-line px-3 py-1.5 text-xs hover:bg-neutral-100"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => del(o.id)}
                        className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-red-600"
                      >
                        🗑️ Descartar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <dl className="space-y-1 text-sm">
                      {o.email && (
                        <div className="flex gap-2">
                          <dt className="text-muted">Email:</dt>
                          <dd>{o.email}</dd>
                        </div>
                      )}
                      {o.telefono && (
                        <div className="flex gap-2">
                          <dt className="text-muted">Teléfono:</dt>
                          <dd>{o.telefono}</dd>
                        </div>
                      )}
                      {o.presupuesto && (
                        <div className="flex gap-2">
                          <dt className="text-muted">Presupuesto:</dt>
                          <dd>{o.presupuesto} €</dd>
                        </div>
                      )}
                      {o.notas && <p className="whitespace-pre-wrap pt-1 text-muted">{o.notas}</p>}
                      {!o.email && !o.telefono && !o.notas && !o.presupuesto && (
                        <p className="text-muted">Sin datos. Pulsa editar para rellenar.</p>
                      )}
                    </dl>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => setEditando(o.id)}
                        className="flex items-center gap-1 rounded-md border border-line px-3 py-1.5 text-xs hover:bg-neutral-100"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => del(o.id)}
                        className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-red-600"
                      >
                        🗑️ Descartar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={add}
        className="w-full rounded-md border border-dashed border-neutral-300 py-2 text-xs text-neutral-600 hover:border-neutral-500"
      >
        + Añadir opción de proveedor
      </button>
    </div>
  );
}
