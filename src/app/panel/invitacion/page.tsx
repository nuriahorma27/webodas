"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { InvitacionView } from "@/components/invitacion-view";
import { loadBoda, nombrePareja } from "@/lib/boda";
import {
  loadInvitacion,
  setInvitacion,
  INVITACION_CUERPO_EJEMPLO,
  FUENTES_INV,
  type Invitacion,
  type FuenteInv,
} from "@/lib/invitacion";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

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

  const descargar = () => {
    if (descargando) return;
    setDescargando(true);
    try {
      const boda = loadBoda();
      const f = FUENTES_INV[inv.fuente] ?? FUENTES_INV.imprenta;
      const k = f.escala;
      const nombres =
        inv.nombres.trim() || nombrePareja(boda).replace("Vuestra boda", "Vuestros nombres");
      const y = new Date(boda.fecha).getFullYear();
      const anio = Number.isFinite(y) ? y : new Date().getFullYear();
      const ciudadAno = inv.ciudadAno.trim() || `${boda.lugar?.trim() || "Madrid"}, ${anio}`;

      const html = `<!doctype html><html><head><meta charset="utf-8">
<title>Invitación de boda</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Parisienne&display=swap">
<style>
  @page { size: 317.8mm 230.8mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  .hoja { width: 317.8mm; height: 230.8mm; padding: 26mm 26mm; display: flex; flex-direction: column;
    justify-content: space-between; text-align: center; color: ${inv.colorText};
    font-family: ${f.family}; font-size: ${11 * k}pt; line-height: 1.6; }
  .fila { display: flex; justify-content: space-between; gap: 20mm; }
  .fila p { margin: 0; }
  .izq { text-align: left; } .der { text-align: right; }
  .padres { font-size: ${11.5 * k}pt; line-height: 1.4; }
  .centro { display: flex; flex-direction: column; align-items: center; margin: auto 0; }
  .centro p { margin: 0; }
  .nombres { font-size: ${29 * k}pt; line-height: 1.2; margin: 6mm 0 7mm; }
  .meta { margin-top: 12mm; }
</style></head><body>
  <div class="hoja">
    <div class="fila padres">
      <p class="izq">${esc(inv.padresNovia)}</p>
      <p class="der">${esc(inv.padresNovio)}</p>
    </div>
    <div class="centro">
      ${inv.participan ? `<p>${esc(inv.participan)}</p>` : ""}
      <p class="nombres">${esc(nombres)}</p>
      ${inv.cuerpo ? `<p>${esc(inv.cuerpo)}</p>` : ""}
      ${
        inv.src || ciudadAno
          ? `<div class="meta">${inv.src ? `<p>${esc(inv.src)}</p>` : ""}${
              ciudadAno ? `<p>${esc(ciudadAno)}</p>` : ""
            }</div>`
          : ""
      }
    </div>
    <div class="fila" style="font-size:${11 * k}pt;line-height:1.4">
      <p class="izq">${esc(inv.direccionNovia)}</p>
      <p class="der">${esc(inv.direccionNovio)}</p>
    </div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print();},500);};<\/script>
</body></html>`;

      const w = window.open("", "_blank");
      if (!w) {
        alert("Permite las ventanas emergentes para poder descargar el PDF.");
        return;
      }
      w.document.write(html);
      w.document.close();
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

          <Card className="space-y-3">
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
              Se abre el diálogo de impresión: elige <strong>“Guardar como PDF”</strong>. El PDF sale{" "}
              <strong>sin fondo</strong>, en A5 apaisado, listo para llevar a imprenta sobre el papel
              que elijas.
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
    </div>
  );
}
