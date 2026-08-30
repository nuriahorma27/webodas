"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { CompartirEnlace } from "@/components/compartir-enlace";
import { EditarEnlace } from "@/components/editar-enlace";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";
import { loadStd, stdConfigurada } from "@/lib/savethedate";
import { loadInvitacion, invitacionConfigurada } from "@/lib/invitacion";
import { getWedding } from "@/lib/wedding";
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
  const [hasStd, setHasStd] = useState(false);
  const [stdPublicada, setStdPublicada] = useState(false);
  const [hasInv, setHasInv] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const boda = loadBoda();

  useEffect(() => {
    getWedding().then((w) => w && setSlug(w.slug));
    const sync = () => {
      try {
        const raw = localStorage.getItem("webodas:site:demo");
        const parsed = raw ? JSON.parse(raw) : null;
        setHasWeb(!!parsed && Array.isArray(parsed.content) && parsed.content.length > 0);
      } catch {
        setHasWeb(false);
      }
      const s = loadStd();
      setHasStd(stdConfigurada(s));
      setStdPublicada(s.publicada);
      setHasInv(invitacionConfigurada(loadInvitacion()));
    };
    sync();
    window.addEventListener("webodas:savethedate", sync);
    window.addEventListener("webodas:invitacion", sync);
    return () => {
      window.removeEventListener("webodas:savethedate", sync);
      window.removeEventListener("webodas:invitacion", sync);
    };
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
      <PageTitle title="Webs para tus invitados" />

      {/* WEB DE BODA */}
      {hasWeb === null ? null : hasWeb ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl">Tu web de boda</h2>
          <Card className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-lg">{nombrePareja(boda)}</p>
                <p className="text-sm text-muted">{fechaLarga(boda)}</p>
              </div>
              <div className="flex items-center gap-4">
                {slug && (
                  <a
                    href={`/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted underline"
                  >
                    Ver
                  </a>
                )}
                <Link href="/editor/demo" className="text-sm font-medium text-accent">
                  Seguir editando →
                </Link>
              </div>
            </div>
            {slug ? (
              <div className="space-y-2">
                <CompartirEnlace path={`/${slug}`} label="Enlace para tus invitados" />
                <EditarEnlace slug={slug} onChange={setSlug} />
              </div>
            ) : (
              <p className="text-sm text-muted">Preparando tu enlace…</p>
            )}
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
          <h2 className="font-display text-xl">Crea tu web de boda</h2>
          <p className="mt-1 text-sm text-muted">
            Elige una plantilla para empezar (podrás cambiar todo) o parte de cero.
          </p>
          <div
            data-tour="webs-plantillas"
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
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

      {/* SAVE THE DATE */}
      <div data-tour="webs-std" className="space-y-3">
        <h2 className="font-display text-xl">Save the date</h2>
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Una sola hoja con vuestros nombres, la fecha y una imagen. Para avisar pronto.
            </p>
            <div className="flex shrink-0 items-center gap-4">
              {hasStd && slug && (
                <a
                  href={`/${slug}/save-the-date`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-muted underline"
                >
                  Ver
                </a>
              )}
              <Link href="/panel/save-the-date" className="text-sm font-medium text-accent">
                {hasStd ? "Seguir editando →" : "Crear Save the date →"}
              </Link>
            </div>
          </div>
          {stdPublicada && slug && (
            <CompartirEnlace path={`/${slug}/save-the-date`} label="Enlace para tus invitados" />
          )}
        </Card>
      </div>

      {/* INVITACIÓN */}
      <div data-tour="webs-inv" className="space-y-3">
        <h2 className="font-display text-xl">Invitación de boda</h2>
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              La invitación clásica: familias, ceremonia y celebración. Se descarga en PDF para
              llevar a imprenta.
            </p>
            <Link
              href="/panel/invitacion"
              className="shrink-0 text-sm font-medium text-accent"
            >
              {hasInv ? "Seguir editando →" : "Crear invitación →"}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
