"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { InvitacionView } from "@/components/invitacion-view";
import {
  loadInvitacion,
  setInvitacion,
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
  }: {
    k: keyof Invitacion;
    label: string;
    placeholder?: string;
    area?: boolean;
  }) => (
    <label className="block text-sm">
      <span className="text-xs font-medium text-muted">{label}</span>
      {area ? (
        <textarea
          rows={2}
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

      {/* En móvil no se edita cómodamente: pantalla grande */}
      <div className="rounded-xl border border-line bg-surface p-6 text-center lg:hidden">
        <p className="font-display text-xl">Prepárala desde el ordenador</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          La invitación tiene bastante texto y se ajusta mejor en una pantalla grande. El enlace
          para compartir lo tienes en <strong>Webs</strong>.
        </p>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Controles */}
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-lg">Familias y texto</h2>
            <Texto k="encabezado" label="Encabezado (opcional)" placeholder="p. ej. Con la bendición de Dios" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Texto
                k="familiaNovia"
                label="Familia de la novia"
                area
                placeholder={"D. Juan Pérez\ny Dña. María López"}
              />
              <Texto
                k="familiaNovio"
                label="Familia del novio"
                area
                placeholder={"D. Luis Gómez\ny Dña. Ana Martín"}
              />
            </div>
            <Texto
              k="textoInvitacion"
              label="Texto de invitación"
              area
              placeholder="tienen el gusto de invitaros a la boda de sus hijos"
            />
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Novios y fecha</h2>
            <Texto k="nombres" label="Nombres de los novios" placeholder="Se coge del perfil si lo dejas vacío" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Texto k="fecha" label="Fecha" placeholder="Se coge del perfil si lo dejas vacío" />
              <Texto k="hora" label="Hora" placeholder="13:00 h" />
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Ceremonia</h2>
            <Texto k="ceremoniaLugar" label="Lugar" placeholder="Iglesia de San Juan Bautista" />
            <Texto k="ceremoniaDireccion" label="Dirección" placeholder="Calle Mayor, 1 · Madrid" />
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Celebración</h2>
            <Texto k="celebracionLugar" label="Lugar" placeholder="Finca Los Olivos" />
            <Texto k="celebracionDireccion" label="Dirección" placeholder="Ctra. de la Sierra, km 4 · Madrid" />
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Cierre</h2>
            <Texto
              k="confirmacion"
              label="Confirmación"
              placeholder="Se ruega confirmación antes del 1 de agosto · 600 000 000"
            />
            <Texto k="nota" label="Nota (opcional)" placeholder="Etiqueta rigurosa · Se ruega puntualidad" />
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
                Letra
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
            <div className="flex flex-wrap gap-2">
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

        {/* Vista previa */}
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
