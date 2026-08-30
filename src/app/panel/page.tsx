"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle, Card, Stat, Progress } from "@/components/ui";
import { EstadoControl } from "@/components/estado-control";
import { OnboardingBoda } from "@/components/onboarding-boda";
import {
  loadBoda,
  configurada,
  diasRestantes,
  mesesRestantes,
  fechaLarga,
  nombrePareja,
  type BodaPerfil,
} from "@/lib/boda";
import {
  TAREAS,
  FASE_MESES,
  loadEstados,
  setEstado,
  type Estado,
} from "@/lib/tareas";
import { eur } from "@/lib/mock";

const servicios = [
  { href: "/panel/webs", titulo: "Web e invitaciones", desc: "Vuestra web, el save the date y la invitación.", accion: "Abrir" },
  { href: "/panel/regalos", titulo: "Lista de regalos", desc: "Regalos y aportaciones online.", accion: "Ver lista" },
  { href: "/panel/gestion", titulo: "Gestión de la boda", desc: "Presupuesto, tareas, invitados, mesas.", accion: "Abrir panel" },
];

export default function PanelPage() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [estados, setEstados] = useState<Record<string, Estado>>({});

  useEffect(() => {
    const sync = () => {
      setBoda(loadBoda());
      setEstados(loadEstados());
    };
    sync();
    window.addEventListener("webodas:boda", sync);
    window.addEventListener("webodas:tareas", sync);
    return () => {
      window.removeEventListener("webodas:boda", sync);
      window.removeEventListener("webodas:tareas", sync);
    };
  }, []);

  if (!boda) return null;
  if (!configurada(boda)) return <OnboardingBoda inicial={boda} />;

  const estadoDe = (id: string): Estado => estados[id] ?? "sin";
  const dias = diasRestantes(boda);
  const meses = mesesRestantes(boda);

  // Tareas cuyo plazo ya ha llegado (o pasado) y no están hechas.
  const pend = TAREAS.filter((t) => {
    const e = estadoDe(t.id);
    if (e === "hecho") return false;
    if (meses == null) return t.fase !== "Sin fecha asignada";
    return (FASE_MESES[t.fase] ?? Infinity) >= meses;
  });
  const conRetraso = pend.filter((t) => meses != null && (FASE_MESES[t.fase] ?? Infinity) < meses - 1.5);
  const tocaAhora = pend.filter((t) => !conRetraso.includes(t));

  const totalRelevantes = TAREAS.filter((t) => {
    if (meses == null) return true;
    return (FASE_MESES[t.fase] ?? Infinity) >= meses;
  });
  const hechasRelev = totalRelevantes.filter((t) => estadoDe(t.id) === "hecho").length;

  const Fila = ({ id, titulo, fase, retraso }: { id: string; titulo: string; fase: string; retraso?: boolean }) => (
    <li className="flex items-start gap-3 py-2 text-sm">
      <EstadoControl value={estadoDe(id)} onChange={(v) => setEstado(id, v)} />
      <div className="min-w-0 flex-1">
        <p>{titulo}</p>
        <p className={`text-xs ${retraso ? "text-red-600" : "text-muted"}`}>
          {fase}
          {retraso ? " · con retraso" : ""}
        </p>
      </div>
    </li>
  );

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
        <PendienteStat
          label="Presupuesto"
          value={boda.presupuestoTotal}
          href="/panel/gestion/presupuesto"
          euro
        />
      </div>

      <div data-tour="panel-servicios">
        <h2 className="font-display text-xl">Tus servicios</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {servicios.map((s) => (
            <Link key={s.titulo} href={s.href} className="group">
              <Card className="flex h-full flex-col transition group-hover:border-accent">
                <h3 className="font-display text-lg">{s.titulo}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{s.desc}</p>
                <span className="mt-4 text-sm font-medium text-accent">{s.accion} →</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card data-tour="panel-tareas">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Lo que toca ya</h2>
          <Link href="/panel/gestion/tiempos" className="text-sm text-accent">
            Todas las tareas →
          </Link>
        </div>
        {meses != null ? (
          <p className="mt-1 text-sm text-muted">
            Quedan ~{Math.round(meses)} meses · {hechasRelev}/{totalRelevantes.length} de lo que ya debería
            estar hecho
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted">
            Sin fecha de boda no hay calendario. Añádela en tu web para ver qué toca cada mes.
          </p>
        )}
        <div className="mt-3">
          <Progress value={totalRelevantes.length ? (hechasRelev / totalRelevantes.length) * 100 : 0} />
        </div>

        {conRetraso.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
              Con retraso ({conRetraso.length})
            </p>
            <ul className="mt-1 divide-y divide-line">
              {conRetraso.map((t) => (
                <Fila key={t.id} id={t.id} titulo={t.titulo} fase={t.fase} retraso />
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Toca ahora ({tocaAhora.length})
          </p>
          {tocaAhora.length === 0 ? (
            <p className="mt-1 text-sm text-muted">Nada pendiente de este periodo. 🎉</p>
          ) : (
            <>
              <ul className="mt-1 divide-y divide-line">
                {tocaAhora.slice(0, 8).map((t) => (
                  <Fila key={t.id} id={t.id} titulo={t.titulo} fase={t.fase} />
                ))}
              </ul>
              {tocaAhora.length > 8 && (
                <Link
                  href="/panel/gestion/tiempos"
                  className="mt-2 inline-block text-sm font-medium text-accent"
                >
                  Ver las {tocaAhora.length - 8} tareas restantes →
                </Link>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
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
