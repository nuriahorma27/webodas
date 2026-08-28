"use client";

import { useEffect, useState } from "react";
import { Card, Stat } from "@/components/ui";
import { CampoBoda } from "@/components/campo-boda";
import {
  loadInvitados,
  loadColumnas,
  addInvitado,
  updateInvitado,
  updateInvitadoExtra,
  removeInvitado,
  addColumna,
  removeColumna,
  resumenInvitados,
  VIENE_OPCIONES,
  TIPO_OPCIONES,
  GRUPOS_SUGERIDOS,
  COLUMNAS_SUGERIDAS,
  type Invitado,
  type ColumnaInvitado,
  type Viene,
  type TipoInvitado,
} from "@/lib/invitados";

const cell =
  "w-full min-w-[7rem] bg-transparent px-2.5 py-2 text-sm outline-none focus:bg-accent-soft/30";

export default function InvitadosPage() {
  const [inv, setInv] = useState<Invitado[] | null>(null);
  const [cols, setCols] = useState<ColumnaInvitado[]>([]);
  const [filtro, setFiltro] = useState<"" | Viene>("");
  const [modalCol, setModalCol] = useState(false);

  useEffect(() => {
    const sync = () => {
      setInv(loadInvitados());
      setCols(loadColumnas());
    };
    sync();
    window.addEventListener("webodas:invitados", sync);
    return () => window.removeEventListener("webodas:invitados", sync);
  }, []);

  if (!inv) return null;

  const r = resumenInvitados();
  const filas = filtro ? inv.filter((i) => i.viene === filtro) : inv;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoBoda campo="invitadosAprox" label="Invitados aproximados" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Personas" value={String(r.personas)} sub={`${r.adultos} adultos · ${r.ninos} niños`} />
        <Stat label="Confirmadas" value={String(r.confirmadas)} tone="positive" />
        <Stat label="Pendientes" value={String(r.pendientes)} />
        <Stat label="No vienen" value={String(r.noVienen)} tone="negative" />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(["", ...VIENE_OPCIONES] as ("" | Viene)[]).map((e) => (
          <button
            key={e || "todos"}
            onClick={() => setFiltro(e)}
            className={`rounded-full px-3 py-1 text-xs ${
              filtro === e ? "bg-foreground text-white" : "border border-line text-muted"
            }`}
          >
            {e === "" ? "Todos" : e === "Sí" ? "Vienen" : e === "No" ? "No vienen" : "Pendientes"}
          </button>
        ))}
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr className="whitespace-nowrap">
                <th className="px-2.5 py-2.5">Nombre</th>
                <th className="px-2.5 py-2.5">Apellido</th>
                <th className="px-2.5 py-2.5">¿Viene?</th>
                <th className="px-2.5 py-2.5">Grupo</th>
                <th className="px-2.5 py-2.5">Subgrupo</th>
                <th className="px-2.5 py-2.5">Adulto/Niño</th>
                {cols.map((c) => (
                  <th key={c.id} className="px-2.5 py-2.5">
                    <span className="inline-flex items-center gap-1">
                      {c.nombre}
                      <button
                        onClick={() => {
                          if (confirm(`¿Quitar la columna "${c.nombre}"?`)) removeColumna(c.id);
                        }}
                        className="text-muted hover:text-red-600"
                        title="Quitar columna"
                      >
                        ×
                      </button>
                    </span>
                  </th>
                ))}
                <th className="w-16 px-2.5 py-2.5 text-center">
                  <button
                    onClick={() => setModalCol(true)}
                    className="text-accent hover:underline"
                    title="Añadir columna"
                  >
                    + col
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filas.map((i) => (
                <tr key={i.id} className="align-top">
                  <td className="px-0">
                    <input
                      defaultValue={i.nombre}
                      placeholder="Nombre"
                      onBlur={(e) => updateInvitado(i.id, { nombre: e.target.value })}
                      className={`${cell} font-medium`}
                    />
                  </td>
                  <td className="px-0">
                    <input
                      defaultValue={i.apellido}
                      placeholder="Apellido"
                      onBlur={(e) => updateInvitado(i.id, { apellido: e.target.value })}
                      className={cell}
                    />
                  </td>
                  <td className="px-0">
                    <select
                      value={i.viene}
                      onChange={(e) => updateInvitado(i.id, { viene: e.target.value as Viene })}
                      className={`${cell} ${
                        i.viene === "Sí"
                          ? "text-emerald-700"
                          : i.viene === "No"
                            ? "text-[#7b2233]"
                            : "text-amber-700"
                      }`}
                    >
                      {VIENE_OPCIONES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-0">
                    <input
                      list="grupos-invitados"
                      defaultValue={i.grupo}
                      placeholder="—"
                      onBlur={(e) => updateInvitado(i.id, { grupo: e.target.value })}
                      className={`${cell} text-muted`}
                    />
                  </td>
                  <td className="px-0">
                    <input
                      defaultValue={i.subgrupo}
                      placeholder="—"
                      onBlur={(e) => updateInvitado(i.id, { subgrupo: e.target.value })}
                      className={`${cell} text-muted`}
                    />
                  </td>
                  <td className="px-0">
                    <select
                      value={i.tipo}
                      onChange={(e) =>
                        updateInvitado(i.id, { tipo: e.target.value as TipoInvitado })
                      }
                      className={`${cell} text-muted`}
                    >
                      {TIPO_OPCIONES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  {cols.map((c) => (
                    <td key={c.id} className="px-0">
                      {c.tipo === "sino" ? (
                        <select
                          value={i.extra[c.id] ?? ""}
                          onChange={(e) => updateInvitadoExtra(i.id, c.id, e.target.value)}
                          className={`${cell} text-muted`}
                        >
                          <option value="">—</option>
                          <option value="Sí">Sí</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <input
                          defaultValue={i.extra[c.id] ?? ""}
                          onBlur={(e) => updateInvitadoExtra(i.id, c.id, e.target.value)}
                          className={`${cell} text-muted`}
                        />
                      )}
                    </td>
                  ))}
                  <td className="px-2.5 text-center">
                    <button
                      onClick={() => removeInvitado(i.id)}
                      className="text-muted hover:text-red-600"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={7 + cols.length} className="px-5 py-8 text-center text-sm text-muted">
                    {filtro ? "Nadie en este estado." : "Aún no has añadido invitados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <button onClick={() => addInvitado()} className="text-sm font-medium text-accent">
            + Añadir invitado
          </button>
        </div>
      </Card>

      <datalist id="grupos-invitados">
        {GRUPOS_SUGERIDOS.map((g) => (
          <option key={g} value={g} />
        ))}
      </datalist>

      {modalCol && (
        <ModalColumna
          existentes={cols.map((c) => c.nombre.toLowerCase())}
          onClose={() => setModalCol(false)}
          onAdd={(nombre, tipo) => {
            addColumna(nombre, tipo);
            setModalCol(false);
          }}
        />
      )}
    </div>
  );
}

function ModalColumna({
  existentes,
  onClose,
  onAdd,
}: {
  existentes: string[];
  onClose: () => void;
  onAdd: (nombre: string, tipo: "texto" | "sino") => void;
}) {
  const [nombre, setNombre] = useState("");
  const disponibles = COLUMNAS_SUGERIDAS.filter(
    (c) => !existentes.includes(c.nombre.toLowerCase()),
  );
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
          <h3 className="font-display text-lg">Añadir columna</h3>
          <button onClick={onClose} className="text-xl text-neutral-400 hover:text-foreground">
            ×
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Habituales:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {disponibles.map((c) => (
            <button
              key={c.nombre}
              onClick={() => onAdd(c.nombre, c.tipo)}
              className="rounded-full border border-line px-2.5 py-1 text-xs hover:border-accent hover:text-accent"
            >
              {c.nombre}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && nombre.trim() && onAdd(nombre.trim(), "texto")}
            placeholder="O escribe otra…"
            autoFocus
            className="flex-1 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={() => nombre.trim() && onAdd(nombre.trim(), "texto")}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
