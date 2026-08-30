"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { InvitacionView } from "@/components/invitacion-view";
import {
  loadInvitacion,
  setInvitacion,
  INVITACION_CUERPO_EJEMPLO,
  ACABADOS,
  FUENTES,
  MARCOS,
  type Invitacion,
  type AcabadoStd,
  type FuenteStd,
  type MarcoStd,
} from "@/lib/invitacion";

const campo =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export default function InvitacionPage() {
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [descargando, setDescargando] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setInv(loadInvitacion());
    sync();
    window.addEventListener("webodas:invitacion", sync);
    return () => window.removeEventListener("webodas:invitacion", sync);
  }, []);

  if (!inv) return null;

  const Texto = ({
    k,
    label,
    placeholder,
    area,
    rows = 2,
  }: {
    k: keyof Invitacion;
    label: string;
    placeholder?: string;
    area?: boolean;
    rows?: number;
  }) => (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      {area ? (
        <textarea
          rows={rows}
          className={`${campo} mt-1`}
          defaultValue={inv[k] as string}
          placeholder={placeholder}
          onBlur={(e) => setInvitacion({ [k]: e.target.value })}
        />
      ) : (
        <input
          className={`${campo} mt-1`}
          defaultValue={inv[k] as string}
          placeholder={placeholder}
          onBlur={(e) => setInvitacion({ [k]: e.target.value })}
        />
      )}
    </label>
  );

  const descargar = async () => {
    if (!previewRef.current || descargando) return;
    setDescargando(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: inv.colorBg,
      });
      const a = document.createElement("a");
      a.download = "invitacion-boda.png";
      a.href = dataUrl;
      a.click();
    } catch {
      alert("No se ha podido generar la imagen. Vuelve a intentarlo.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Servicio" title="Invitación de boda" />

      <div className="rounded-xl border border-line bg-surface p-6 text-center lg:hidden">
        <p className="font-display text-xl">Prepárala desde el ordenador</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          La invitación es apaisada y con bastante texto: se ajusta mejor en pantalla grande. El
          enlace para compartir lo tienes en <strong>Webs</strong>.
        </p>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-lg">Los padres</h2>
            <p className="text-xs text-muted">
              Como en las de toda la vida: los padres de la novia arriba a la izquierda, los del
              novio arriba a la derecha, y sus direcciones abajo.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Texto
                k="padresNovia"
                label="Padres de la novia"
                area
                placeholder={"Juan Hormaechea Escós\nPilar Pérez del Yerro Núñez"}
              />
              <Texto
                k="padresNovio"
                label="Padres del novio"
                area
                placeholder={"Javier Velasco Pascual de Zulueta\nAna Orihuela Moreno"}
              />
              <Texto
                k="direccionNovia"
                label="Dirección (novia)"
                area
                placeholder={"Calle de Mateo Inurria 35, 2B,\n28036, Madrid"}
              />
              <Texto
                k="direccionNovio"
                label="Dirección (novio)"
                area
                placeholder={"Calle de Pastora Imperio 1, 13C,\n28036, Madrid"}
              />
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">El texto central</h2>
            <Texto
              k="participan"
              label="Línea de arriba"
              placeholder="Participan el enlace de sus hijos"
            />
            <Texto
              k="nombres"
              label="Nombres de los novios"
              placeholder="Nuria y Javier (o se coge del perfil)"
            />
            <label className="block text-sm">
              <span className="flex items-center justify-between text-xs font-medium text-muted">
                Ceremonia y celebración
                <button
                  onClick={() => setInvitacion({ cuerpo: INVITACION_CUERPO_EJEMPLO })}
                  className="text-accent hover:underline"
                >
                  usar texto de ejemplo
                </button>
              </span>
              <textarea
                key={inv.cuerpo}
                rows={4}
                className={`${campo} mt-1`}
                defaultValue={inv.cuerpo}
                placeholder={INVITACION_CUERPO_EJEMPLO}
                onBlur={(e) => setInvitacion({ cuerpo: e.target.value })}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Texto k="src" label="Confirmación" placeholder="S. R. C." />
              <Texto k="ciudadAno" label="Ciudad y año" placeholder="Madrid, 2025" />
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Estilo</h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  value={inv.colorBg}
                  onChange={(e) => setInvitacion({ colorBg: e.target.value })}
                  className="h-8 w-10 rounded border border-line"
                />
                Fondo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  value={inv.colorText}
                  onChange={(e) => setInvitacion({ colorText: e.target.value })}
                  className="h-8 w-10 rounded border border-line"
                />
                Tinta
              </label>
            </div>
            <div>
              <span className="text-xs font-medium text-muted">Tipo de letra</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {(Object.keys(FUENTES) as FuenteStd[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setInvitacion({ fuente: f })}
                    style={{ fontFamily: FUENTES[f].family }}
                    className={`rounded-md border px-3 py-1.5 text-base ${
                      inv.fuente === f
                        ? "border-foreground bg-foreground text-white"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    {FUENTES[f].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted">Acabado</span>
              <div className="mt-1 flex gap-2">
                {(Object.keys(ACABADOS) as AcabadoStd[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setInvitacion({ acabado: a })}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      inv.acabado === a ? "border-foreground" : "border-line hover:border-accent"
                    }`}
                  >
                    {ACABADOS[a].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted">Marco decorativo</span>
              <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {(Object.keys(MARCOS) as MarcoStd[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setInvitacion({ marco: m })}
                    className={`rounded-md border p-1.5 text-xs ${
                      inv.marco === m ? "border-foreground" : "border-line hover:border-accent"
                    }`}
                  >
                    {MARCOS[m].label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={inv.publicada}
                onChange={(e) => setInvitacion({ publicada: e.target.checked })}
              />
              Publicar la invitación
            </label>
            <p className="text-xs text-muted">
              {inv.publicada
                ? "Publicada. El enlace para compartir lo tienes en Webs."
                : "Al publicarla obtendrás un enlace en Webs. También puedes descargarla como imagen para imprimir o enviar."}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={descargar}
                disabled={descargando}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {descargando ? "Generando…" : "⬇ Descargar imagen"}
              </button>
              <Link href="/panel/webs" className="text-sm text-accent underline">
                ← Volver a webs
              </Link>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Vista previa</p>
          <div ref={previewRef}>
            <InvitacionView inv={inv} />
          </div>
        </div>
      </div>
    </div>
  );
}
