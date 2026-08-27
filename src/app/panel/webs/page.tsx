"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";
import { TEMPLATES } from "@/lib/puck/config";

const previews: Record<string, React.ReactNode> = {
  editorial: (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-[#fbf9f6] font-display text-[#8a6d3b]">
      <span className="text-[10px] tracking-[0.3em]">NOS CASAMOS</span>
      <span className="text-lg">Ana &amp; Leo</span>
      <span className="text-[10px] tracking-widest">12·09·2026</span>
    </div>
  ),
  jardin: (
    <div className="flex h-full bg-[#f6f7f1]">
      <div className="flex flex-1 flex-col justify-center pl-3 font-display text-[#4b6b43]">
        <span className="text-[9px] tracking-widest">NOS CASAMOS</span>
        <span className="text-base leading-tight">Marta &amp; Julen</span>
      </div>
      <div className="w-1/3 bg-[#c7d2bd]" />
    </div>
  ),
  moderna: (
    <div className="flex h-full flex-col justify-center gap-1 bg-[#111] pl-3 text-white">
      <span className="text-[9px] tracking-[0.3em] text-white/60">12.09.2026</span>
      <span className="text-lg font-semibold tracking-tight">ANA + LEO</span>
      <span className="text-[9px] tracking-widest text-white/60">MADRID</span>
    </div>
  ),
  cero: (
    <div className="flex h-full items-center justify-center border-2 border-dashed border-neutral-300 bg-white text-3xl text-neutral-300">
      +
    </div>
  ),
};

export default function WebsPage() {
  const [hasWeb, setHasWeb] = useState<boolean | null>(null);
  const boda = loadBoda();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("webodas:site:demo");
      const parsed = raw ? JSON.parse(raw) : null;
      setHasWeb(!!parsed && Array.isArray(parsed.content) && parsed.content.length > 0);
    } catch {
      setHasWeb(false);
    }
  }, []);

  const empezarDeNuevo = () => {
    if (!confirm("Vas a descartar tu web actual y volver a elegir plantilla. ¿Seguro?")) return;
    try {
      localStorage.removeItem("webodas:site:demo");
    } catch {
      /* noop */
    }
    setHasWeb(false);
  };

  return (
    <div className="space-y-8">
      <PageTitle eyebrow="Servicio" title="Web de boda" />

      {hasWeb === null ? null : hasWeb ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl">Tu web</h2>
          <Card className="flex items-center justify-between">
            <div>
              <p className="font-display text-lg">{nombrePareja(boda)}</p>
              <p className="text-sm text-muted">{fechaLarga(boda)}</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/w/ana-y-leo"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted underline"
              >
                Ver
              </a>
              <Link href="/editor/demo" className="text-sm font-medium text-accent">
                Seguir editando →
              </Link>
            </div>
          </Card>
          <button
            onClick={empezarDeNuevo}
            className="text-xs text-muted underline hover:text-foreground"
          >
            Descartar y empezar otra web
          </button>
        </div>
      ) : (
        <div>
          <h2 className="font-display text-xl">Crea tu web</h2>
          <p className="mt-1 text-sm text-muted">
            Elige una plantilla para empezar (podrás cambiar todo) o parte de cero.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <Link key={key} href={`/editor/demo?t=${key}`} className="group">
                <Card className="h-full p-0 transition group-hover:border-accent">
                  <div className="h-32 overflow-hidden rounded-t-xl">{previews[key]}</div>
                  <div className="p-4">
                    <p className="font-display text-lg">{t.nombre}</p>
                    <p className="mt-1 text-sm text-muted">{t.desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
