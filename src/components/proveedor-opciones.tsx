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
  };

  const cerrar = (o: ProveedorOpcion) => {
    // Descarta una opción recién creada que se queda sin nombre.
    if (!o.nombre.trim() && !o.email && !o.telefono && !o.presupuesto && !o.notas) {
      del(o.id);
    } else {
      onSave();
    }
    setAbierta(null);
  };

  return (
    <div className="space-y-2">
      {opciones.map((o) => {
        const contratada = contratado === o.id;
        const open = abierta === o.id;
        const contactos = [o.email, o.telefono].filter(Boolean).join(" · ");
        return (
          <div
            key={o.id}
            className={`overflow-hidden rounded-xl border ${
              contratada ? "border-accent bg-accent-soft/50" : "border-line bg-surface"
            }`}
          >
            <button
              onClick={() => (open ? cerrar(o) : setAbierta(o.id))}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate font-medium">
                    {o.nombre || <span className="text-muted">Nueva opción</span>}
                  </span>
                  {o.presupuesto && (
                    <span className="shrink-0 text-sm text-muted">{o.presupuesto} €</span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {contactos || (open ? "" : "Sin datos de contacto")}
                </span>
              </span>
              <span className="shrink-0 text-muted" aria-hidden>
                {open ? "▾" : "›"}
              </span>
            </button>

            <div
              className={`flex items-center justify-between gap-3 border-t px-3.5 py-2 ${
                contratada ? "border-accent/30" : "border-line"
              }`}
            >
              <button
                onClick={() => {
                  onContratado(contratada ? "" : o.id);
                  setTimeout(onSave, 0);
                }}
                className={`inline-flex items-center gap-1.5 text-xs font-medium transition ${
                  contratada ? "text-accent-deep" : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                    contratada ? "border-accent bg-accent text-white" : "border-current"
                  }`}
                >
                  {contratada ? "✓" : ""}
                </span>
                {contratada ? "Contratado" : "Marcar como contratado"}
              </button>
              {!open && (
                <button
                  onClick={() => setAbierta(o.id)}
                  className="text-xs text-muted underline hover:text-foreground"
                >
                  Ver datos
                </button>
              )}
            </div>

            {open && (
              <div className="border-t border-line px-3 py-3">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-muted">Nombre / empresa</span>
                    <input
                      className={inputCls}
                      value={o.nombre}
                      onChange={(e) => upd(o.id, { nombre: e.target.value })}
                      onBlur={onSave}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Email</span>
                    <input
                      type="email"
                      className={inputCls}
                      value={o.email}
                      onChange={(e) => upd(o.id, { email: e.target.value })}
                      onBlur={onSave}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Teléfono</span>
                    <input
                      type="tel"
                      className={inputCls}
                      value={o.telefono}
                      onChange={(e) => upd(o.id, { telefono: e.target.value })}
                      onBlur={onSave}
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-muted">Presupuesto (€)</span>
                    <input
                      type="number"
                      className={inputCls}
                      value={o.presupuesto}
                      onChange={(e) => upd(o.id, { presupuesto: e.target.value })}
                      onBlur={onSave}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-xs font-medium text-muted">Qué incluye / notas</span>
                    <textarea
                      rows={2}
                      className={inputCls}
                      value={o.notas}
                      onChange={(e) => upd(o.id, { notas: e.target.value })}
                      onBlur={onSave}
                    />
                  </label>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => cerrar(o)}
                    className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    Listo
                  </button>
                  <button
                    onClick={() => del(o.id)}
                    className="text-xs text-muted underline hover:text-red-600"
                  >
                    Quitar opción
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={add}
        className="w-full rounded-md border border-dashed border-line py-2 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
      >
        + Añadir opción de proveedor
      </button>
    </div>
  );
}
