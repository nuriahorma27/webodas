"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OnboardingBoda } from "@/components/onboarding-boda";
import {
  loadBoda,
  saveBoda,
  configurada,
  diasRestantes,
  fechaLarga,
  nombrePareja,
  type BodaPerfil,
} from "@/lib/boda";
import { TAREAS, loadEstados, type Estado } from "@/lib/tareas";
import { estimadoDe, loadPartidas, type Partida } from "@/lib/presupuesto";
import { loadInvitados, type Invitado } from "@/lib/invitados";
import { loadAportaciones, loadLista, type Aportacion, type ListaRegalos } from "@/lib/regalos";
import { eur } from "@/lib/mock";

export default function PanelPage() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [estados, setEstados] = useState<Record<string, Estado>>({});
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [listaRegalos, setListaRegalos] = useState<ListaRegalos | null>(null);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);

  useEffect(() => {
    const sync = () => {
      setBoda(loadBoda());
      setEstados(loadEstados());
      setPartidas(loadPartidas());
      setInvitados(loadInvitados());
      setListaRegalos(loadLista());
      setAportaciones(loadAportaciones());
    };
    sync();
    const eventos = [
      "webodas:boda",
      "webodas:tareas",
      "webodas:presupuesto",
      "webodas:invitados",
      "webodas:regalos",
    ];
    eventos.forEach((e) => window.addEventListener(e, sync));
    return () => eventos.forEach((e) => window.removeEventListener(e, sync));
  }, []);

  if (!boda) return null;
  if (!configurada(boda)) return <OnboardingBoda inicial={boda} />;

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const dias = diasRestantes(boda);
  const presupuestoTotal = boda.presupuestoTotal || 0;
  const asignado = partidas.reduce((s, p) => s + estimadoDe(p), 0);
  const gastado = partidas.reduce((s, p) => s + (p.pagado || 0), 0);
  const sinAsignar = Math.max(0, presupuestoTotal - asignado);
  const avancePresupuesto = presupuestoTotal ? Math.min(100, (asignado / presupuestoTotal) * 100) : 0;

  // Las tareas del día de la boda solo se asignan, no se marcan; no cuentan para el %.
  const TAREAS_CONTABLES = TAREAS.filter((t) => t.fase !== "El día de la boda");
  const completadas = TAREAS_CONTABLES.filter((t) => estadoDe(t.id) === "hecho").length;
  const enProceso = TAREAS_CONTABLES.filter((t) => estadoDe(t.id) === "proceso").length;
  const pendientes = Math.max(0, TAREAS_CONTABLES.length - completadas - enProceso);
  const avanceTareas = TAREAS_CONTABLES.length ? (completadas / TAREAS_CONTABLES.length) * 100 : 0;

  const invitadosSi = invitados.filter((i) => i.viene === "Sí").length;
  const invitadosNo = invitados.filter((i) => i.viene === "No").length;
  const invitadosPendientes = invitados.filter((i) => i.viene === "Pendiente").length;
  const previstos = invitadosSi + invitadosPendientes;

  const totalAportado = (listaRegalos?.gifts ?? []).reduce((s, g) => s + (g.aportado || 0), 0);
  const aportacionesPendientes = aportaciones.filter((a) => a.estado === "pendiente").length;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{fechaLarga(boda)}</p>
        <h1 className="font-fraunces mt-2 text-3xl sm:text-4xl">Hola, {nombrePareja(boda)}</h1>
        <p className="mt-2 text-sm text-muted">
          {boda.lugar || "Todo lo importante de vuestra boda, de un vistazo."}
        </p>
      </header>

      {/* datos principales */}
      <div className="grid gap-4 sm:grid-cols-3">
        <CardShell>
          <Kicker>Cuenta atrás</Kicker>
          <p className="font-fraunces mt-2 text-3xl sm:text-4xl">
            {dias == null ? "Sin fecha" : dias < 0 ? "¡Es hoy!" : `${dias} días`}
          </p>
          <label className="mt-3 block">
            <span className="block text-xs font-medium text-muted">Fecha de la boda</span>
            <input
              type="date"
              value={boda.fecha}
              onChange={(e) => saveBoda({ fecha: e.target.value })}
              className="mt-1 w-full max-w-full border-0 border-b border-line bg-transparent p-0 pb-1 font-fraunces text-lg outline-none focus:border-[#5a6b4d]"
            />
          </label>
        </CardShell>

        <CardShell>
          <Kicker>Invitados previstos</Kicker>
          <p className="font-fraunces mt-2 text-3xl sm:text-4xl">{previstos}</p>
          <p className="mt-2 text-sm text-muted">
            {invitados.length} en la lista · {invitadosNo} {invitadosNo === 1 ? "no viene" : "no vienen"}
          </p>
        </CardShell>

        <CardShell>
          <Kicker>Regalos recibidos</Kicker>
          <p className="font-fraunces mt-2 text-3xl sm:text-4xl">{eur(totalAportado)}</p>
          <p className="mt-2 text-sm text-muted">
            {aportaciones.length} {aportaciones.length === 1 ? "aportación" : "aportaciones"}
            {aportacionesPendientes ? ` · ${aportacionesPendientes} por confirmar` : ""}
          </p>
        </CardShell>
      </div>

      {/* presupuesto */}
      <Link href="/panel/gestion/presupuesto" className="group block">
        <CardShell className="transition group-hover:border-[#c9bfa8]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Kicker>Presupuesto de la boda</Kicker>
              <p className="font-fraunces mt-2 text-4xl sm:text-5xl">
                {presupuestoTotal ? eur(presupuestoTotal) : "Por definir"}
              </p>
            </div>
            <span className="text-sm font-medium text-[#3f4d38] underline decoration-[#c3cbb6] underline-offset-4">
              Ver presupuesto →
            </span>
          </div>
          <Bar value={avancePresupuesto} className="mt-6" />
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
            <Figure label="Asignado" value={asignado} />
            <Figure label="Gastado" value={gastado} />
            <Figure label="Sin asignar" value={sinAsignar} tone="accent" />
          </div>
        </CardShell>
      </Link>

      {/* planificación */}
      <Link href="/panel/gestion/tiempos" className="group block">
        <CardShell className="transition group-hover:border-[#c9bfa8]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Kicker>Planificación</Kicker>
              <p className="font-fraunces mt-2 text-2xl sm:text-3xl">
                {Math.round(avanceTareas)}% de las tareas hechas
              </p>
            </div>
            <span className="text-sm font-medium text-[#3f4d38] underline decoration-[#c3cbb6] underline-offset-4">
              Abrir planificación →
            </span>
          </div>
          <Bar value={avanceTareas} className="mt-6" />
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
            <EstadoFigure label="Completadas" value={completadas} color="#5a6b4d" />
            <EstadoFigure label="En proceso" value={enProceso} color="#a9864d" />
            <EstadoFigure label="Pendientes" value={pendientes} color="#c8c2b8" />
          </div>
        </CardShell>
      </Link>

      {/* invitados y regalos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DetalleCard
          href="/panel/gestion/invitados"
          kicker="Invitados"
          titulo={`${invitados.length} en la lista`}
          filas={[
            ["Confirmados", invitadosSi],
            ["Pendientes", invitadosPendientes],
            ["No vienen", invitadosNo],
          ]}
        />
        <DetalleCard
          href="/panel/gestion/regalos"
          kicker="Lista de regalos"
          titulo={`${listaRegalos?.gifts.length ?? 0} ${
            (listaRegalos?.gifts.length ?? 0) === 1 ? "regalo" : "regalos"
          }`}
          filas={[
            ["Aportado", eur(totalAportado)],
            ["Aportaciones", aportaciones.length],
            ["Por confirmar", aportacionesPendientes],
          ]}
        />
      </div>

      <Link href="/panel/recuerdo" className="group block">
        <CardShell className="flex flex-wrap items-center justify-between gap-3 transition group-hover:border-[#c9bfa8]">
          <div>
            <Kicker>Recuerdo</Kicker>
            <p className="font-fraunces mt-2 text-2xl sm:text-3xl">El libro de la boda</p>
            <p className="mt-1 text-sm text-muted">
              Portada, save the date, invitación, cifras y presupuesto en un PDF de recuerdo.
            </p>
          </div>
          <span className="text-sm font-medium text-[#3f4d38] underline decoration-[#c3cbb6] underline-offset-4">
            Ver y descargar →
          </span>
        </CardShell>
      </Link>
    </div>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-ui="card"
      className={`rounded-xl border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-xs uppercase tracking-[0.16em] text-muted">{children}</p>;
}

function Bar({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-[#eee9df] ${className}`}>
      <div
        className="h-full rounded-full bg-[#5a6b4d]"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function Figure({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "accent";
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className={`font-fraunces mt-1.5 text-xl sm:text-2xl ${tone === "accent" ? "text-[#3f4d38]" : ""}`}>
        {eur(value)}
      </p>
    </div>
  );
}

function EstadoFigure({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <span className="block h-2 w-2 rounded-full" style={{ background: color }} />
      <p className="font-fraunces mt-2.5 text-xl sm:text-2xl">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{label}</p>
    </div>
  );
}

function DetalleCard({
  href,
  kicker,
  titulo,
  filas,
}: {
  href: string;
  kicker: string;
  titulo: string;
  filas: [string, number | string][];
}) {
  return (
    <Link href={href} className="group block">
      <CardShell className="h-full transition group-hover:border-[#c9bfa8]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Kicker>{kicker}</Kicker>
            <p className="font-fraunces mt-2 text-2xl sm:text-3xl">{titulo}</p>
          </div>
          <span className="text-xs font-medium text-[#3f4d38] underline decoration-[#c3cbb6] underline-offset-4">
            Ver detalle →
          </span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-line pt-4">
          {filas.map(([l, v]) => (
            <div key={l}>
              <p className="font-fraunces text-xl sm:text-2xl">{v}</p>
              <p className="mt-0.5 text-xs text-muted">{l}</p>
            </div>
          ))}
        </div>
      </CardShell>
    </Link>
  );
}
