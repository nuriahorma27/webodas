"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Progress } from "@/components/ui";
import { loadBoda, diasRestantes, fechaLarga } from "@/lib/boda";
import { resumenInvitados } from "@/lib/invitados";
import { loadResponses } from "@/lib/rsvp";
import { loadPartidas, totales } from "@/lib/presupuesto";
import { loadTareas, loadEstados } from "@/lib/tareas";
import { exportarDatos, importarDatos } from "@/lib/cloud-sync";

const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;

type Datos = {
  dias: number | null;
  fecha: string;
  inv: ReturnType<typeof resumenInvitados>;
  respHoy: number;
  sinVolcar: number;
  totalResp: number;
  gastado: number;
  estimado: number;
  refTotal: number | null;
  tareasPend: number;
  tareasTotal: number;
};

function leer(): Datos {
  const boda = loadBoda();
  const respuestas = loadResponses("demo");
  const hoy = new Date().toDateString();
  const partidas = loadPartidas();
  const t = totales(partidas);
  const tareas = loadTareas();
  const estados = loadEstados();
  const hechas = tareas.filter((x) => (estados[x.id] ?? "sin") === "hecho").length;
  return {
    dias: diasRestantes(boda),
    fecha: fechaLarga(boda),
    inv: resumenInvitados(),
    respHoy: respuestas.filter((r) => {
      const d = new Date(r.fecha);
      return !isNaN(d.getTime()) && d.toDateString() === hoy;
    }).length,
    sinVolcar: respuestas.filter((r) => !r.aplicada).length,
    totalResp: respuestas.length,
    gastado: t.pagado,
    estimado: t.estimado,
    refTotal: boda.presupuestoTotal,
    tareasPend: tareas.length - hechas,
    tareasTotal: tareas.length,
  };
}

export default function ResumenPage() {
  const [d, setD] = useState<Datos | null>(null);

  useEffect(() => {
    const sync = () => setD(leer());
    sync();
    const evs = [
      "webodas:boda",
      "webodas:invitados",
      "webodas:rsvp",
      "webodas:presupuesto",
      "webodas:tareas",
    ];
    evs.forEach((e) => window.addEventListener(e, sync));
    return () => evs.forEach((e) => window.removeEventListener(e, sync));
  }, []);

  if (!d) return null;

  const baseBudget = d.refTotal && d.refTotal > 0 ? d.refTotal : d.estimado;
  const pctBudget = baseBudget > 0 ? Math.min(100, (d.gastado / baseBudget) * 100) : 0;
  const pctTareas = d.tareasTotal > 0 ? ((d.tareasTotal - d.tareasPend) / d.tareasTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="py-2">
        {d.dias === null ? (
          <div>
            <p className="font-display text-3xl">Sin fecha aún</p>
            <Link
              href="/panel"
              className="text-sm text-accent hover:underline"
            >
              Añadir la fecha de la boda →
            </Link>
          </div>
        ) : (
          <div className="flex items-baseline gap-3">
            <span className="font-display text-6xl leading-none">{d.dias}</span>
            <span className="text-lg text-muted">
              {d.dias === 1 ? "día para la boda" : "días para la boda"}
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Formulario de confirmación</h2>
            <Link
              href="/panel/gestion/invitados"
              className="text-sm text-accent hover:underline"
            >
              Ver respuestas →
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-lg border border-line bg-surface p-3">
              <p className="font-display text-2xl">{d.respHoy}</p>
              <p className="text-xs text-muted">respuestas hoy</p>
            </div>
            <div className="rounded-lg border border-line bg-surface p-3">
              <p className="font-display text-2xl">{d.totalResp}</p>
              <p className="text-xs text-muted">respuestas en total</p>
            </div>
            <div
              className={`rounded-lg border p-3 ${
                d.sinVolcar > 0 ? "border-amber-300 bg-amber-50" : "border-line bg-surface"
              }`}
            >
              <p className="font-display text-2xl">{d.sinVolcar}</p>
              <p className="text-xs text-muted">sin volcar a tu lista</p>
            </div>
          </div>
          {d.sinVolcar > 0 && (
            <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Tienes {d.sinVolcar} respuesta{d.sinVolcar === 1 ? "" : "s"} del formulario sin pasar a
              la lista de gestión.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-lg">Invitados</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Fila label="Confirmados" valor={d.inv.confirmadas} color="text-emerald-700" />
            <Fila label="Pendientes de responder" valor={d.inv.pendientes} color="text-amber-700" />
            <Fila label="No vienen" valor={d.inv.noVienen} color="text-[#7b2233]" />
            <div className="border-t border-line pt-2">
              <Fila label="Total en la lista" valor={d.inv.personas} />
              <p className="mt-1 text-xs text-muted">
                {d.inv.adultos} adultos · {d.inv.ninos} niños
              </p>
            </div>
          </div>
          <Link
            href="/panel/gestion/invitados"
            className="mt-3 inline-block text-sm text-accent hover:underline"
          >
            Ir a la lista →
          </Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Presupuesto</h2>
            <span className="text-sm text-muted">{Math.round(pctBudget)}%</span>
          </div>
          <div className="mt-3">
            <Progress value={pctBudget} />
          </div>
          <p className="mt-2 text-sm text-muted">
            Pagado <strong className="text-foreground">{eur(d.gastado)}</strong> · Estimado{" "}
            {eur(d.estimado)}
            {d.refTotal ? ` · Referencia ${eur(d.refTotal)}` : ""}
          </p>
          <Link
            href="/panel/gestion/presupuesto"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            Ver presupuesto →
          </Link>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Tareas</h2>
            <span className="text-sm text-muted">{Math.round(pctTareas)}%</span>
          </div>
          <div className="mt-3">
            <Progress value={pctTareas} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {d.tareasTotal - d.tareasPend} hechas de {d.tareasTotal} · {d.tareasPend} pendientes
          </p>
          <Link
            href="/panel/gestion/tiempos"
            className="mt-2 inline-block text-sm text-accent hover:underline"
          >
            Ver tareas →
          </Link>
        </Card>
      </div>

      <CopiaSeguridad />
    </div>
  );
}

function CopiaSeguridad() {
  const [aviso, setAviso] = useState<string | null>(null);

  const descargar = () => {
    const blob = new Blob([exportarDatos()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webodas-copia-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const subir = async (file: File) => {
    const ok = importarDatos(await file.text());
    setAviso(ok ? "Datos restaurados." : "No se ha podido leer el archivo.");
    setTimeout(() => setAviso(null), 3000);
  };

  return (
    <Card className="space-y-2">
      <h2 className="font-display text-lg">Copia de seguridad</h2>
      <p className="text-sm text-muted">
        Tus datos se guardan en tu cuenta automáticamente. Aun así, puedes descargar una copia o
        restaurar una que tengas guardada.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={descargar}
          className="rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent"
        >
          ⬇ Descargar copia
        </button>
        <label className="cursor-pointer rounded-md border border-line px-3 py-1.5 text-sm hover:border-accent">
          ↑ Restaurar copia
          <input
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) subir(f);
              e.target.value = "";
            }}
          />
        </label>
        {aviso && <span className="text-sm text-emerald-700">{aviso}</span>}
      </div>
    </Card>
  );
}

function Fila({
  label,
  valor,
  color = "text-foreground",
}: {
  label: string;
  valor: number;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`font-display text-lg ${color}`}>{valor}</span>
    </div>
  );
}
