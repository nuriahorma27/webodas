"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { InvitacionView } from "@/components/invitacion-view";
import {
  loadInvitacion,
  setInvitacion,
  INVITACION_CUERPO_EJEMPLO,
  FUENTES_INV,
  type Invitacion,
  type FuenteInv,
} from "@/lib/invitacion";

// Tamaño real de la invitación (el del PDF de referencia), en mm.
const PDF_MM = { w: 317.8, h: 230.8 };

const campo =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export default function InvitacionPage() {
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [descargando, setDescargando] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

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
    if (!exportRef.current || descargando) return;
    setDescargando(true);
    try {
      const [{ toPng }, jspdf] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      // Esperar a que las tipografías estén cargadas para que el PNG salga bien.
      if (document.fonts?.ready) await document.fonts.ready;

      const nodo = exportRef.current;
      const png = await toPng(nodo, {
        cacheBust: true,
        pixelRatio: 3,
        width: nodo.offsetWidth,
        height: nodo.offsetHeight,
      });

      const pdf = new jspdf.jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [PDF_MM.w, PDF_MM.h],
        compress: true,
      });
      pdf.addImage(png, "PNG", 0, 0, PDF_MM.w, PDF_MM.h, undefined, "MEDIUM");
      pdf.save("invitacion-boda.pdf");
    } catch {
      alert("No se ha podido generar el PDF. Vuelve a intentarlo.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Invitación de boda" />

      <div className="rounded-xl border border-line bg-surface p-6 text-center lg:hidden">
        <p className="font-display text-xl">Prepárala desde el ordenador</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          La invitación es apaisada y con bastante texto: se ajusta mejor en pantalla grande. El
          enlace para compartir lo tienes en <strong>Webs</strong>.
        </p>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="space-y-4">
          <Card className="space-y-3" data-tour="inv-padres">
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
                placeholder={"Antonio García Ruiz\ny Carmen López Díaz"}
              />
              <Texto
                k="padresNovio"
                label="Padres del novio"
                area
                placeholder={"Manuel Fernández Soto\ny Isabel Moreno Gil"}
              />
              <Texto
                k="direccionNovia"
                label="Dirección (novia)"
                area
                placeholder={"Calle de la Rosa 12, 3ºA\n28001 Madrid"}
              />
              <Texto
                k="direccionNovio"
                label="Dirección (novio)"
                area
                placeholder={"Avenida del Parque 4, 2ºB\n28002 Madrid"}
              />
            </div>
          </Card>

          <Card className="space-y-3" data-tour="inv-texto">
            <h2 className="font-display text-lg">El texto central</h2>
            <Texto
              k="participan"
              label="Línea de arriba"
              placeholder="Participan el enlace de sus hijos"
            />
            <Texto
              k="nombres"
              label="Nombres de los novios"
              placeholder="Se coge del perfil si lo dejas vacío"
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

          <Card className="space-y-3" data-tour="inv-estilo">
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
                {(Object.keys(FUENTES_INV) as FuenteInv[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setInvitacion({ fuente: f })}
                    style={{ fontFamily: FUENTES_INV[f].family }}
                    className={`rounded-md border px-3 py-1.5 text-lg ${
                      inv.fuente === f
                        ? "border-foreground bg-foreground text-white"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    {FUENTES_INV[f].label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-3" data-tour="inv-descargar">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={descargar}
                disabled={descargando}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {descargando ? "Generando…" : "⬇ Descargar PDF"}
              </button>
              <Link href="/panel/webs" className="text-sm text-accent underline">
                ← Volver a webs
              </Link>
            </div>
            <p className="text-xs text-muted">
              Descarga un PDF <strong>sin fondo</strong>, apaisado y al{" "}
              <strong>tamaño exacto de la invitación</strong> (31,8 × 23,1 cm), listo para llevar a
              imprenta sobre el papel que elijas.
            </p>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Vista previa</p>
          <div ref={previewRef}>
            <InvitacionView inv={inv} />
          </div>
        </div>
      </div>

      {/* Copia oculta sin fondo, a tamaño fijo, para generar el PDF */}
      <div
        aria-hidden
        style={{ position: "fixed", left: "-10000px", top: 0, width: 920, pointerEvents: "none" }}
      >
        <div ref={exportRef} style={{ width: 920 }}>
          <InvitacionView inv={inv} sinFondo />
        </div>
      </div>
    </div>
  );
}
