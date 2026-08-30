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

const gestion = [
  ["Presupuesto", "/panel/gestion/presupuesto"],
  ["Tareas", "/panel/gestion/tiempos"],
  ["Invitados", "/panel/gestion/invitados"],
  ["Mesas", "/panel/gestion/mesas"],
  ["Proveedores", "/panel/gestion/proveedores"],
  ["Confirmaciones", "/panel/gestion/confirmaciones"],
  ["Formulario", "/panel/gestion/formulario"],
] as const;

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

      <div data-tour="panel-resumen" className="grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <Stat label="Cuenta atrás" value={dias == null ? "Sin fecha" : dias < 0 ? "¡Es hoy o pasó!" : `${dias} días`} sub={boda.lugar || (dias == null ? "Añadid la fecha" : "")} />
          <PendienteStat label="Invitados" value={boda.invitadosAprox} href="/panel/gestion/invitados" />
        </div>
        <Link href="/panel/gestion/presupuesto" className="group">
          <div className="h-full rounded-2xl border border-[#d9c9ad] bg-[#eee4d3] p-5 transition group-hover:border-accent sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[.18em] text-[#7b694e]">Presupuesto de la boda</p><p className="mt-3 font-display text-4xl sm:text-5xl">{presupuestoTotal ? eur(presupuestoTotal) : "Por definir"}</p></div>
              <span className="hidden rounded-full border border-[#b9a889] px-3 py-1.5 text-xs text-[#6e5d43] sm:block">Ver presupuesto →</span>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#cfc0a7] pt-5">
              <DatoPresupuesto label="Asignado" value={asignado} />
              <DatoPresupuesto label="Gastado" value={gastado} />
              <DatoPresupuesto label="Sin asignar" value={sinAsignar} accent />
            </div>
          </div>
        </Link>
      </div>

      <div data-tour="panel-servicios">
        <p className="text-xs uppercase tracking-[.18em] text-accent">Vuestras herramientas</p>
        <h2 className="mt-1 font-display text-2xl">Todo en su sitio</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-12">
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:col-span-7">
            <p className="text-xs uppercase tracking-[.16em] text-muted">Diseño y comunicación</p>
            <h3 className="mt-3 max-w-md font-display text-2xl">Todo lo que compartiréis con vuestros invitados</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">Preparad la web, avisad de la fecha y cread la invitación con el mismo estilo.</p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <EnlaceHerramienta href="/panel/webs">Web de boda</EnlaceHerramienta>
              <EnlaceHerramienta href="/panel/save-the-date">Save the date</EnlaceHerramienta>
              <EnlaceHerramienta href="/panel/invitacion">Invitación</EnlaceHerramienta>
            </div>
          </section>
          <section className="flex flex-col rounded-2xl border border-[#d9c9ad] bg-[#f3ebde] p-5 sm:p-6 lg:col-span-5">
            <p className="text-xs uppercase tracking-[.16em] text-[#7b694e]">Lista de regalos</p>
            <h3 className="mt-3 font-display text-2xl">Regalos y aportaciones, reunidos</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted">Cread vuestra lista y consultad quién ha participado.</p>
            <Link href="/panel/regalos" className="mt-6 inline-flex w-fit rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-white">Abrir lista de regalos →</Link>
          </section>
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:col-span-12">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[.16em] text-muted">Organización</p><h3 className="mt-2 font-display text-2xl">La parte práctica de la boda</h3></div><Link href="/panel/gestion" className="text-sm text-accent">Ver resumen de gestión →</Link></div>
            <div className="mt-5 grid grid-cols-2 border-l border-t border-line sm:grid-cols-4">
              {gestion.map(([titulo, href]) => <Link key={titulo} href={href} className="group flex min-h-16 items-center justify-between gap-2 border-b border-r border-line px-3 py-3 text-sm transition hover:bg-accent-soft/60 sm:px-4"><span>{titulo}</span><span className="text-accent transition group-hover:translate-x-0.5">→</span></Link>)}
            </div>
          </section>
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

function DatoPresupuesto({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return <div><p className="text-[.62rem] uppercase tracking-wider text-[#786d5f]">{label}</p><p className={`mt-1 font-display text-lg sm:text-xl ${accent ? "text-accent" : ""}`}>{eur(value)}</p></div>;
}

function EnlaceHerramienta({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="flex items-center justify-between rounded-lg border border-line px-3.5 py-3 text-sm font-medium transition hover:border-accent hover:bg-accent-soft/50"><span>{children}</span><span className="text-accent">→</span></Link>;
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
