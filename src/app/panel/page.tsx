"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Progress } from "@/components/ui";
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
    window.addEventListener("webodas:boda", sync);
    window.addEventListener("webodas:tareas", sync);
    window.addEventListener("webodas:presupuesto", sync);
    window.addEventListener("webodas:invitados", sync);
    window.addEventListener("webodas:regalos", sync);
    return () => {
      window.removeEventListener("webodas:boda", sync);
      window.removeEventListener("webodas:tareas", sync);
      window.removeEventListener("webodas:presupuesto", sync);
      window.removeEventListener("webodas:invitados", sync);
      window.removeEventListener("webodas:regalos", sync);
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
  const invitadosSi = invitados.filter((i) => i.viene === "Sí").length;
  const invitadosNo = invitados.filter((i) => i.viene === "No").length;
  const invitadosPendientes = invitados.filter((i) => i.viene === "Pendiente").length;
  const totalAportado = (listaRegalos?.gifts ?? []).reduce((s, g) => s + (g.aportado || 0), 0);
  const aportacionesPendientes = aportaciones.filter((a) => a.estado === "pendiente").length;

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-[2rem_2rem_.8rem_2rem] bg-[#39322c] px-6 py-8 text-[#f8f2e8] sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute inset-0 bg-[url('/textures/papel-algodon.png')] bg-cover opacity-[.07] mix-blend-screen" />
        <span className="pointer-events-none absolute -bottom-16 right-5 font-display text-[11rem] leading-none text-white/[.045]">&</span>
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[.24em] text-[#d6bf98]">{fechaLarga(boda)}</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">Hola, {nombrePareja(boda)}</h1>
          <p className="mt-3 text-sm text-white/60">{boda.lugar || "Todo lo importante de vuestra boda, de un vistazo."}</p>
        </div>
      </header>

      <div data-tour="panel-resumen" className="grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <DatoPrincipal label="Cuenta atrás" value={dias == null ? "Sin fecha" : dias < 0 ? "¡Es hoy!" : `${dias} días`} sub={dias == null ? "Añadid la fecha" : "para la boda"} className="rounded-[1.6rem_1.6rem_.65rem_1.6rem] bg-[#eadfce]" />
          <DatoPrincipal label="Invitados previstos" value={boda.invitadosAprox ? String(boda.invitadosAprox) : "Por definir"} sub={boda.invitadosAprox ? "personas aproximadamente" : "Podéis añadirlos después"} className="rounded-[.65rem_1.6rem_1.6rem_1.6rem] bg-[#e4e6dc]" />
        </div>
        <Link href="/panel/gestion/presupuesto" className="group">
          <div className="relative h-full overflow-hidden rounded-[2rem_.8rem_2rem_2rem] border border-[#d2bd99] bg-[#d9c7a8] p-5 transition group-hover:border-[#927444] sm:p-7">
            <span className="pointer-events-none absolute -bottom-12 -right-1 font-display text-[9rem] leading-none text-[#6f5832]/[.08]">€</span>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[.18em] text-[#7b694e]">Presupuesto de la boda</p><p className="mt-3 font-display text-4xl sm:text-5xl">{presupuestoTotal ? eur(presupuestoTotal) : "Por definir"}</p></div>
              <span className="hidden rounded-full border border-[#b9a889] px-3 py-1.5 text-xs text-[#6e5d43] sm:block">Ver presupuesto →</span>
            </div>
            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/40"><div className="h-full rounded-full bg-[#745d38]" style={{width: `${presupuestoTotal ? Math.min(100, (asignado / presupuestoTotal) * 100) : 0}%`}} /></div>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[#cfc0a7] pt-5">
              <DatoPresupuesto label="Asignado" value={asignado} />
              <DatoPresupuesto label="Gastado" value={gastado} />
              <DatoPresupuesto label="Sin asignar" value={sinAsignar} accent />
            </div>
          </div>
        </Link>
      </div>

      <div data-tour="panel-servicios">
        <p className="text-xs uppercase tracking-[.18em] text-accent">Información general</p>
        <h2 className="mt-1 font-display text-2xl">Así va vuestra boda</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <section className="relative overflow-hidden rounded-[2rem_.75rem_2rem_2rem] border border-[#dfcfc0] bg-[#eee4da] p-5 sm:p-6">
            <span className="pointer-events-none absolute -right-5 -top-10 font-display text-[9rem] text-[#8e6955]/[.07]">○</span>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.16em] text-muted">Invitados</p><p className="mt-3 font-display text-4xl">{invitados.length}</p><p className="mt-1 text-sm text-muted">personas en la lista</p></div><Link href="/panel/gestion/invitados" className="text-xs text-accent">Ver detalle →</Link></div>
            <div className="mt-6 grid grid-cols-3 border-t border-line pt-4">
              <MiniDato label="Confirmados" value={invitadosSi} />
              <MiniDato label="Pendientes" value={invitadosPendientes} />
              <MiniDato label="No vienen" value={invitadosNo} />
            </div>
          </section>
          <section className="relative overflow-hidden rounded-[.75rem_2rem_2rem_2rem] border border-[#ccd1c1] bg-[#e4e8dc] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[.16em] text-muted">Lista de regalos</p><p className="mt-3 font-display text-4xl">{eur(totalAportado)}</p><p className="mt-1 text-sm text-muted">aportado hasta ahora</p></div><Link href="/panel/regalos" className="text-xs text-accent">Ver detalle →</Link></div>
            <div className="mt-6 grid grid-cols-3 border-t border-line pt-4">
              <MiniDato label="Regalos" value={listaRegalos?.gifts.length ?? 0} />
              <MiniDato label="Aportaciones" value={aportaciones.length} />
              <MiniDato label="Por confirmar" value={aportacionesPendientes} />
            </div>
          </section>
        </div>
      </div>

      <Card data-tour="panel-tareas" className="overflow-hidden rounded-[2rem_.8rem_2rem_2rem] p-0 sm:p-0">
        <div className="grid md:grid-cols-[1.2fr_.8fr]">
          <div className="bg-[#403831] p-5 text-[#f8f2e8] sm:p-7">
            <p className="text-xs uppercase tracking-[.18em] text-[#d3b77f]">Planificación</p>
            <h2 className="mt-2 font-display text-2xl">Avance de la organización</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/60">Una visión rápida del trabajo realizado. El calendario completo sigue organizado por meses en la sección de tareas.</p>
            <div className="mt-6"><Progress value={avance} /></div>
            <p className="mt-2 text-xs text-white/55">{Math.round(avance)}% de las tareas completadas</p>
            <Link href="/panel/gestion/tiempos" className="mt-6 inline-flex rounded-full bg-[#eee3cf] px-5 py-2.5 text-sm font-medium text-[#3b342e] transition hover:bg-white">Abrir planificación →</Link>
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

function MiniDato({ label, value }: { label: string; value: number }) {
  return <div className="min-w-0 pr-2"><p className="font-display text-xl">{value}</p><p className="mt-1 truncate text-[.65rem] text-muted sm:text-xs">{label}</p></div>;
}

function DatoPrincipal({ label, value, sub, className }: { label: string; value: string; sub: string; className: string }) {
  return <div className={`border border-black/[.06] p-4 sm:p-5 ${className}`}><p className="text-[.62rem] uppercase tracking-[.16em] text-[#766c60]">{label}</p><p className="mt-2 font-display text-2xl sm:text-3xl">{value}</p><p className="mt-1 text-xs text-muted sm:text-sm">{sub}</p></div>;
}
