"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { eur } from "@/lib/mock";
import {
  loadProveedores,
  addManual,
  updateManual,
  removeManual,
  ESTADOS_PROVEEDOR,
  type Proveedor,
} from "@/lib/proveedores";

const tono = (estado: string) =>
  estado === "Contratado" ? "green" : estado === "Descartado" ? "red" : "amber";

const cell = "w-full bg-transparent outline-none focus:border-b focus:border-accent";

export default function ProveedoresPage() {
  const [lista, setLista] = useState<Proveedor[] | null>(null);

  useEffect(() => {
    const sync = () => setLista(loadProveedores());
    sync();
    for (const ev of ["webodas:proveedores", "webodas:tareas", "webodas:presupuesto"]) {
      window.addEventListener(ev, sync);
    }
    return () => {
      for (const ev of ["webodas:proveedores", "webodas:tareas", "webodas:presupuesto"]) {
        window.removeEventListener(ev, sync);
      }
    };
  }, []);

  if (!lista) return null;

  const contratados = lista.filter((p) => p.estado === "Contratado").length;
  const total = lista.reduce((s, p) => s + (p.importe || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Proveedores" value={String(lista.length)} />
        <Stat label="Contratados" value={String(contratados)} />
        <Stat label="Importe contratado" value={eur(total)} />
      </div>

      <p className="text-xs text-muted">
        Los que marcas como <span className="text-green-700">contratados</span> en una tarea aparecen
        aquí solos. Puedes añadir otros a mano.
      </p>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-2.5">Proveedor</th>
                <th className="px-5 py-2.5">Categoría</th>
                <th className="px-5 py-2.5">Contacto</th>
                <th className="px-3 py-2.5 text-right">Importe</th>
                <th className="px-5 py-2.5">Estado</th>
                <th className="w-8 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {lista.map((p) => (p.taskId ? <FilaAuto key={p.id} p={p} /> : <FilaManual key={p.id} p={p} />))}
              {lista.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted">
                    Aún no hay proveedores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3">
          <button onClick={() => addManual()} className="text-sm font-medium text-accent">
            + Añadir proveedor
          </button>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl">{value}</p>
    </Card>
  );
}

function FilaAuto({ p }: { p: Proveedor }) {
  return (
    <tr className="bg-green-50/40">
      <td className="px-5 py-3">
        <span className="font-medium">{p.nombre}</span>
        <Link
          href="/panel/gestion/tiempos"
          className="ml-2 text-xs text-muted underline hover:text-accent"
        >
          desde: {p.desdeTarea}
        </Link>
      </td>
      <td className="px-5 py-3 text-muted">{p.categoria}</td>
      <td className="px-5 py-3 text-muted">{p.contacto || "—"}</td>
      <td className="px-3 py-3 text-right">{p.importe ? eur(p.importe) : "—"}</td>
      <td className="px-5 py-3">
        <Badge tone="green">Contratado</Badge>
      </td>
      <td />
    </tr>
  );
}

function FilaManual({ p }: { p: Proveedor }) {
  return (
    <tr>
      <td className="px-5 py-3">
        <input
          defaultValue={p.nombre}
          placeholder="Nombre"
          onBlur={(e) => updateManual(p.id, { nombre: e.target.value })}
          className={`${cell} font-medium`}
        />
      </td>
      <td className="px-5 py-3">
        <input
          defaultValue={p.categoria}
          placeholder="—"
          onBlur={(e) => updateManual(p.id, { categoria: e.target.value })}
          className={`${cell} text-muted`}
        />
      </td>
      <td className="px-5 py-3">
        <input
          defaultValue={p.contacto}
          placeholder="tel / email"
          onBlur={(e) => updateManual(p.id, { contacto: e.target.value })}
          className={`${cell} text-muted`}
        />
      </td>
      <td className="px-3 py-3 text-right">
        <input
          type="text"
          inputMode="decimal"
          defaultValue={p.importe || ""}
          placeholder="0"
          onBlur={(e) => updateManual(p.id, { importe: Number(e.target.value.replace(",", ".")) || 0 })}
          className={`${cell} text-right`}
        />
      </td>
      <td className="px-5 py-3">
        <select
          value={p.estado}
          onChange={(e) => updateManual(p.id, { estado: e.target.value })}
          className="bg-transparent text-sm outline-none"
        >
          {ESTADOS_PROVEEDOR.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3 text-right">
        <button
          onClick={() => removeManual(p.id)}
          className="text-muted hover:text-red-600"
          title="Eliminar"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
