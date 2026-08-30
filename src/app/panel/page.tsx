"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle, Card, Stat, Progress } from "@/components/ui";
import { OnboardingBoda } from "@/components/onboarding-boda";
import {
  loadBoda,
  configurada,
  diasRestantes,
  fechaLarga,
  nombrePareja,
  type BodaPerfil,
} from "@/lib/boda";
import {
  TAREAS,
  loadEstados,
  type Estado,
} from "@/lib/tareas";
import { estimadoDe, loadPartidas, type Partida } from "@/lib/presupuesto";
import { eur } from "@/lib/mock";

const accesos = [
  { href: "/panel/webs", titulo: "Web de boda", grupo: "Diseño" },
  { href: "/panel/save-the-date", titulo: "Save the date", grupo: "Diseño" },
  { href: "/panel/invitacion", titulo: "Invitación", grupo: "Diseño" },
  { href: "/panel/regalos", titulo: "Lista de regalos", grupo: "Regalos" },
  { href: "/panel/gestion/presupuesto", titulo: "Presupuesto", grupo: "Organización" },
  { href: "/panel/gestion/tiempos", titulo: "Tareas", grupo: "Organización" },
  { href: "/panel/gestion/invitados", titulo: "Invitados", grupo: "Organización" },
  { href: "/panel/gestion/mesas", titulo: "Mesas", grupo: "Organización" },
  { href: "/panel/gestion/proveedores", titulo: "Proveedores", grupo: "Organización" },
  { href: "/panel/gestion/confirmaciones", titulo: "Confirmaciones", grupo: "Organización" },
  { href: "/panel/gestion/formulario", titulo: "Formulario", grupo: "Organización" },
];

export default function PanelPage() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [estados, setEstados] = useState<Record<string, Estado>>({});
  const [partidas, setPartidas] = useState<Partida[]>([]);

  useEffect(() => {
    const sync = () => {
      setBoda(loadBoda());
      setEstados(loadEstados());
      setPartidas(loadPartidas());
    };
    sync();
    window.addEventListener("webodas:boda", sync);
    window.addEventListener("webodas:tareas", sync);
    window.addEventListener("webodas:presupuesto", sync);
    return () => {
      window.removeEventListener("webodas:boda", sync);
      window.removeEventListener("webodas:tareas", sync);
      window.removeEventListener("webodas:presupuesto", sync);
    };
  }, []);

  if (!boda) return null;
  if (!configurada(boda)) return <OnboardingBoda inicial={boda} />;

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const dias = diasRestantes(boda);
  const presupuestoTotal = boda.presupuestoTotal || 0;
  const asignado = partidas.reduce((s, p) => s + estimadoDe(p), 0);
  const gastado = partidas.reduce((s, p) => s + (p.pagado || 0), 0);
  const sinAsignar = Math.max(0, presupuestoTotal - asignado);
  const completadas = TAREAS.filter((t) => estadoDe(t.id) === "hecho").length;
  const enProceso = TAREAS.filter((t) => estadoDe(t.id) === "proceso").length;
  const pendientes = Math.max(0, TAREAS.length - completadas - enProceso);
  const avance = TAREAS.length ? (completadas / TAREAS.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <PageTitle eyebrow={fechaLarga(boda)} title={`Hola, ${nombrePareja(boda)}`} />

      <div data-tour="panel-resumen" className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Cuenta atrás"
          value={dias == null ? "Sin fecha" : dias < 0 ? "¡Es hoy o pasó!" : `${dias} días`}
          sub={boda.lugar || (dias == null ? "añade la fecha en tu web" : "")}
        />
        <PendienteStat
          label="Invitados (aprox.)"
          value={boda.invitadosAprox}
          href="/panel/gestion/invitados"
        />
        <Link href="/panel/gestion/presupuesto" className="group">
          <Card className="h-full transition group-hover:border-accent group-hover:shadow-sm">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">Presupuesto</p>
            <p className="mt-2 font-display text-3xl">{presupuestoTotal ? eur(presupuestoTotal) : "Pendiente"}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
              <div><p className="text-[.65rem] uppercase tracking-wider text-muted">Gastado</p><p className="mt-1 text-sm font-medium">{eur(gastado)}</p></div>
              <div><p className="text-[.65rem] uppercase tracking-wider text-muted">Sin asignar</p><p className="mt-1 text-sm font-medium text-accent">{eur(sinAsignar)}</p></div>
            </div>
          </Card>
        </Link>
      </div>

      <div data-tour="panel-servicios">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[.18em] text-accent">Todo vuestro panel</p><h2 className="mt-1 font-display text-2xl">Accesos directos</h2></div>
          <Link href="/panel/gestion" className="hidden text-sm text-accent hover:underline sm:block">Ver gestión completa →</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {accesos.map((s, index) => (
            <Link key={s.titulo} href={s.href} className="group relative min-h-28 overflow-hidden rounded-xl border border-line bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md">
              <p className="text-[.62rem] uppercase tracking-[.16em] text-muted">{s.grupo}</p>
              <h3 className="mt-3 pr-7 font-display text-lg leading-tight">{s.titulo}</h3>
              <span className="absolute bottom-3 right-3 grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-sm text-accent transition group-hover:bg-accent group-hover:text-white">→</span>
              <span className="absolute right-3 top-3 font-display text-xs text-[#c7b99f]">{String(index + 1).padStart(2, "0")}</span>
            </Link>
          ))}
        </div>
      </div>

      <Card data-tour="panel-tareas" className="overflow-hidden p-0 sm:p-0">
        <div className="grid md:grid-cols-[1.2fr_.8fr]">
          <div className="p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[.18em] text-accent">Planificación</p>
            <h2 className="mt-2 font-display text-2xl">Avance de la organización</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">Una visión rápida del trabajo realizado. El calendario completo sigue organizado por meses en la sección de tareas.</p>
            <div className="mt-6"><Progress value={avance} /></div>
            <p className="mt-2 text-xs text-muted">{Math.round(avance)}% de las tareas completadas</p>
            <Link href="/panel/gestion/tiempos" className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90">Abrir planificación →</Link>
          </div>
          <div className="grid grid-cols-3 border-t border-line bg-[#f7f2e9] md:grid-cols-1 md:border-l md:border-t-0">
            <ResumenEstado label="Completadas" value={completadas} color="bg-[#547052]" />
            <ResumenEstado label="En proceso" value={enProceso} color="bg-[#a9864d]" />
            <ResumenEstado label="Pendientes" value={pendientes} color="bg-[#c8c2b8]" />
          </div>
        </div>
      </Card>
    </div>
  );
}

function ResumenEstado({ label, value, color }: { label: string; value: number; color: string }) {
  return <div className="border-l border-line p-4 first:border-l-0 md:border-l-0 md:border-t md:first:border-t-0 sm:p-5"><span className={`block h-2 w-2 rounded-full ${color}`} /><p className="mt-3 font-display text-2xl">{value}</p><p className="mt-1 text-xs text-muted">{label}</p></div>;
}

function PendienteStat({
  label,
  value,
  href,
  euro,
}: {
  label: string;
  value: number | null;
  href: string;
  euro?: boolean;
}) {
  if (value == null || value === 0) {
    return (
      <Link href={href}>
        <Card className="transition hover:border-accent">
          <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
          <p className="mt-2 font-display text-2xl text-accent">Pendiente</p>
          <p className="mt-1 text-sm text-muted">Añádelo en Gestión →</p>
        </Card>
      </Link>
    );
  }
  return <Stat label={label} value={euro ? eur(value) : String(value)} />;
}
