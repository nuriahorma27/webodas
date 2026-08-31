"use client";

import { useEffect, useState } from "react";
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

const tono = (estado: string): "green" | "red" | "amber" =>
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
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Proveedores" value={String(lista.length)} />
        <Stat label="Contratados" value={String(contratados)} />
        <Stat label="Importe contratado" value={eur(total)} />
      </div>

      <p className="rounded-xl border border-[#ddd4c7] bg-[#f3ede3] px-4 py-3 text-sm leading-relaxed text-muted">
        Los proveedores contratados desde una tarea aparecen aquí automáticamente. También podéis
        añadir cualquier otro y guardar sus datos de contacto.
      </p>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          {lista.map((p) => (p.taskId ? <TarjetaAuto key={p.id} p={p} /> : <TarjetaManual key={p.id} p={p} />))}
          {lista.length === 0 && (
            <p className="py-5 text-center text-sm text-muted md:col-span-2">Aún no hay proveedores.</p>
          )}
        </div>
        <div className="pt-4">
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

function contactoDe(p: Proveedor) {
  const legado = p.contacto || "";
  return {
    email: p.email || (legado.includes("@") ? legado : ""),
    telefono: p.telefono || (legado && !legado.includes("@") ? legado : ""),
  };
}

function TarjetaAuto({ p }: { p: Proveedor }) {
  const { email, telefono } = contactoDe(p);
  return (
    <article className="rounded-xl border border-green-200 bg-green-50/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-medium">{p.nombre}</h3>
        <Badge tone="green">Contratado</Badge>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Dato label="Importe" valor={p.importe ? eur(p.importe) : "—"} />
        <Dato label="Estado" valor="Contratado" />
        <Dato label="Correo" valor={email || "—"} href={email ? `mailto:${email}` : undefined} />
        <Dato label="Móvil" valor={telefono || "—"} href={telefono ? `tel:${telefono}` : undefined} />
      </div>
    </article>
  );
}

function TarjetaManual({ p }: { p: Proveedor }) {
  const { email, telefono } = contactoDe(p);
  return (
    <article className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <input
          defaultValue={p.nombre}
          placeholder="Nombre del proveedor"
          onBlur={(e) => updateManual(p.id, { nombre: e.target.value })}
          className={`${cell} min-w-0 flex-1 font-medium`}
        />
        <button
          onClick={() => removeManual(p.id)}
          className="shrink-0 text-muted hover:text-red-600"
          title="Eliminar"
        >
          ✕
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <Campo label="Importe">
          <input type="text" inputMode="decimal" defaultValue={p.importe || ""} placeholder="0 €" onBlur={(e) => updateManual(p.id, { importe: Number(e.target.value.replace(",", ".")) || 0 })} className={cell} />
        </Campo>
        <Campo label="Estado">
          <select value={p.estado} onChange={(e) => updateManual(p.id, { estado: e.target.value })} className={`${cell} text-sm`}>
            {ESTADOS_PROVEEDOR.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Campo>
        <Campo label="Correo">
          <input type="email" defaultValue={email} placeholder="correo@ejemplo.com" onBlur={(e) => updateManual(p.id, { email: e.target.value })} className={cell} />
        </Campo>
        <Campo label="Móvil">
          <input type="tel" defaultValue={telefono} placeholder="600 000 000" onBlur={(e) => updateManual(p.id, { telefono: e.target.value })} className={cell} />
        </Campo>
      </div>
      <div className="mt-4"><Badge tone={tono(p.estado)}>{p.estado}</Badge></div>
    </article>
  );
}

function Dato({ label, valor, href }: { label: string; valor: string; href?: string }) {
  return <div className="min-w-0"><p className="text-[.65rem] uppercase tracking-wider text-muted">{label}</p>{href ? <a href={href} className="mt-1 block truncate underline decoration-line underline-offset-2 hover:text-accent">{valor}</a> : <p className="mt-1 truncate">{valor}</p>}</div>;
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="block text-[.65rem] uppercase tracking-wider text-muted">{label}</span><span className="mt-1 block">{children}</span></label>;
}
