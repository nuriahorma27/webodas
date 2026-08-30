"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { SaveTheDateView } from "@/components/save-the-date-view";
import { SaveTheDateFrame } from "@/components/save-the-date-frame";
import { CompartirEnlace } from "@/components/compartir-enlace";
import { subirImagen } from "@/lib/media";
import {
  loadStd,
  setStd,
  ACABADOS,
  FUENTES,
  MARCOS,
  type SaveTheDate,
  type AcabadoStd,
  type FuenteStd,
  type PosTextoStd,
  type MarcoStd,
} from "@/lib/savethedate";

const campo =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export default function SaveTheDatePage() {
  const [std, setStdState] = useState<SaveTheDate | null>(null);
  const [descargando, setDescargando] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setStdState(loadStd());
    sync();
    window.addEventListener("webodas:savethedate", sync);
    return () => window.removeEventListener("webodas:savethedate", sync);
  }, []);

  if (!std) return null;

  const subirFoto = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      alert("La imagen no puede pasar de 15 MB.");
      return;
    }
    try {
      setStd({ imagen: await subirImagen(file) });
    } catch {
      alert("No se ha podido subir la imagen. Vuelve a intentarlo.");
    }
  };

  const nudge = (dx: number, dy: number) => {
    const c = (n: number) => Math.max(-70, Math.min(70, n));
    setStd({ imgX: c(std.imgX + dx), imgY: c(std.imgY + dy) });
  };

  const nudgeTexto = (dx: number, dy: number) => {
    const c = (n: number) => Math.max(-80, Math.min(80, n));
    setStd({ textoX: c(std.textoX + dx), textoY: c(std.textoY + dy) });
  };

  const descargarImagen = async () => {
    if (!previewRef.current || descargando) return;
    setDescargando(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(previewRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: std.colorBg,
      });
      const nombres = std.nombres.trim().toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, "-").replace(/^-|-$/g, "");
      const enlace = document.createElement("a");
      enlace.download = `save-the-date${nombres ? `-${nombres}` : ""}.png`;
      enlace.href = dataUrl;
      enlace.click();
    } catch {
      alert("No se ha podido generar la imagen. Vuelve a intentarlo.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Save the date" />

      {/* En móvil no se edita: hace falta pantalla grande para colocar la imagen. */}
      <div className="rounded-xl border border-line bg-surface p-6 text-center lg:hidden">
        <p className="font-display text-xl">Diséñalo desde el ordenador</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          El editor del Save the date necesita una pantalla más grande para colocar la imagen y el
          texto. El enlace para compartir lo tienes en <strong>Webs</strong>.
        </p>
      </div>

      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Controles */}
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-display text-lg">Textos</h2>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Rótulo de arriba</span>
              <input
                className={`${campo} mt-1`}
                defaultValue={std.titulo}
                onBlur={(e) => setStd({ titulo: e.target.value })}
                placeholder="Save the date"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Nombres</span>
              <input
                className={`${campo} mt-1`}
                defaultValue={std.nombres}
                onBlur={(e) => setStd({ nombres: e.target.value })}
                placeholder="Se coge del perfil de la boda si lo dejas vacío"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Fecha</span>
              <input
                className={`${campo} mt-1`}
                defaultValue={std.fecha}
                onBlur={(e) => setStd({ fecha: e.target.value })}
                placeholder="Se coge del perfil de la boda si lo dejas vacío"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">Mensaje (opcional)</span>
              <input
                className={`${campo} mt-1`}
                defaultValue={std.mensaje}
                onBlur={(e) => setStd({ mensaje: e.target.value })}
                placeholder="p. ej. Invitación formal a continuación"
              />
            </label>

            <div>
              <span className="text-xs font-medium text-muted">Posición del texto</span>
              <div className="mt-1 flex gap-2">
                {(
                  [
                    ["arriba", "Arriba"],
                    ["centro", "Centro"],
                    ["abajo", "Abajo"],
                  ] as [PosTextoStd, string][]
                ).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setStd({ posTexto: v })}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      std.posTexto === v
                        ? "border-foreground bg-foreground text-white"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xs font-medium text-muted">Mover el texto</span>
                <div className="mt-1 grid grid-cols-3 grid-rows-3 gap-1">
                  <span />
                  <Flecha onClick={() => nudgeTexto(0, -4)}>↑</Flecha>
                  <span />
                  <Flecha onClick={() => nudgeTexto(-4, 0)}>←</Flecha>
                  <Flecha onClick={() => setStd({ textoX: 0, textoY: 0 })}>•</Flecha>
                  <Flecha onClick={() => nudgeTexto(4, 0)}>→</Flecha>
                  <span />
                  <Flecha onClick={() => nudgeTexto(0, 4)}>↓</Flecha>
                  <span />
                </div>
              </div>
              <p className="text-xs text-muted">El punto vuelve a la posición inicial.</p>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Contorno decorativo</h2>
            <p className="text-xs text-muted">Elige uno de los cinco dibujos o deja el diseño sin marco.</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {(Object.keys(MARCOS) as MarcoStd[]).map((marco) => (
                <button
                  key={marco}
                  onClick={() => setStd({ marco })}
                  aria-pressed={std.marco === marco}
                  className={`rounded-md border p-1.5 text-xs ${std.marco === marco ? "border-foreground" : "border-line hover:border-accent"}`}
                >
                  <span className="relative mb-1 block aspect-[3/4] overflow-hidden rounded bg-[#f4efe6]">
                    <SaveTheDateFrame marco={marco} colorHojas={std.colorMarco} colorFrutos={std.colorFrutos} />
                  </span>
                  {MARCOS[marco].label}
                </button>
              ))}
            </div>
            {std.marco !== "ninguno" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="color" value={std.colorMarco} onChange={(e) => setStd({ colorMarco: e.target.value })} className="h-8 w-10 rounded border border-line" />
                    Color de las hojas
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="color" value={std.colorFrutos} onChange={(e) => setStd({ colorFrutos: e.target.value })} className="h-8 w-10 rounded border border-line" />
                    Frutos y flores
                  </label>
                </div>
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Tamaño proporcional ({Math.round(std.tamMarco * 100)}%)</span>
                  <input type="range" min={0.65} max={1.12} step={0.01} value={Math.max(0.65, std.tamMarco)} onChange={(e) => setStd({ tamMarco: Number(e.target.value) })} className="mt-1 w-full" />
                </label>
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">Distancia al borde ({std.margenMarco.toFixed(1)}%)</span>
                  <input type="range" min={-25} max={12} step={0.5} value={std.margenMarco} onChange={(e) => setStd({ margenMarco: Number(e.target.value) })} className="mt-1 w-full" />
                  <span className="mt-1 block text-[11px] text-muted">Hacia la izquierda queda más pegado a las esquinas.</span>
                </label>
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Tipografía</h2>
            <div>
              <span className="text-xs font-medium text-muted">Tipo de letra</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {(Object.keys(FUENTES) as FuenteStd[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStd({ fuente: f })}
                    style={{ fontFamily: FUENTES[f].family }}
                    className={`rounded-md border px-3 py-1.5 text-base ${
                      std.fuente === f
                        ? "border-foreground bg-foreground text-white"
                        : "border-line hover:border-accent"
                    }`}
                  >
                    {FUENTES[f].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={std.negrita}
                  onChange={(e) => setStd({ negrita: e.target.checked })}
                />
                Nombres en negrita
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={std.cursiva}
                  onChange={(e) => setStd({ cursiva: e.target.checked })}
                />
                Nombres en cursiva
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={std.mayusculas}
                  onChange={(e) => setStd({ mayusculas: e.target.checked })}
                />
                Nombres en mayúsculas
              </label>
            </div>
            <label className="block text-sm">
              <span className="text-xs font-medium text-muted">
                Tamaño de los nombres ({Math.round(std.tamNombres * 100)}%)
              </span>
              <input
                type="range"
                min={0.7}
                max={1.8}
                step={0.05}
                value={std.tamNombres}
                onChange={(e) => setStd({ tamNombres: Number(e.target.value) })}
                className="mt-1 w-full"
              />
            </label>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Fondo</h2>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  value={std.colorBg}
                  onChange={(e) => setStd({ colorBg: e.target.value })}
                  className="h-8 w-10 rounded border border-line"
                />
                Color de fondo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="color"
                  value={std.colorText}
                  onChange={(e) => setStd({ colorText: e.target.value })}
                  className="h-8 w-10 rounded border border-line"
                />
                Color de la letra
              </label>
            </div>
            <div>
              <span className="text-xs font-medium text-muted">Acabado</span>
              <div className="mt-1 grid grid-cols-2 gap-2 sm:max-w-sm">
                {(Object.keys(ACABADOS) as AcabadoStd[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setStd({ acabado: a })}
                    className={`rounded-md border p-1.5 text-xs ${
                      std.acabado === a ? "border-foreground" : "border-line hover:border-accent"
                    }`}
                  >
                    <span
                      className="mb-1 block h-8 w-full rounded"
                      style={{ backgroundColor: std.colorBg, ...ACABADOS[a].style }}
                    />
                    {ACABADOS[a].label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-display text-lg">Imagen</h2>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) subirFoto(f);
                e.target.value = "";
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                {std.imagen ? "Cambiar imagen" : "Subir imagen"}
              </button>
              {std.imagen && (
                <button
                  onClick={() => setStd({ imagen: "" })}
                  className="text-sm text-muted underline hover:text-red-600"
                >
                  Quitar
                </button>
              )}
            </div>
            {std.imagen && (
              <>
                <label className="block text-sm">
                  <span className="text-xs font-medium text-muted">
                    Tamaño ({Math.round(std.imgEscala * 100)}%)
                  </span>
                  <input
                    type="range"
                    min={0.3}
                    max={2.5}
                    step={0.05}
                    value={std.imgEscala}
                    onChange={(e) => setStd({ imgEscala: Number(e.target.value) })}
                    className="mt-1 w-full"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-xs font-medium text-muted">Mover</span>
                    <div className="mt-1 grid grid-cols-3 grid-rows-3 gap-1">
                      <span />
                      <Flecha onClick={() => nudge(0, -4)}>↑</Flecha>
                      <span />
                      <Flecha onClick={() => nudge(-4, 0)}>←</Flecha>
                      <Flecha onClick={() => setStd({ imgX: 0, imgY: 0 })}>•</Flecha>
                      <Flecha onClick={() => nudge(4, 0)}>→</Flecha>
                      <span />
                      <Flecha onClick={() => nudge(0, 4)}>↓</Flecha>
                      <span />
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    …o arrastra la imagen directamente sobre la vista previa.
                  </p>
                </div>
              </>
            )}
          </Card>

          <Card className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={std.publicada}
                onChange={(e) => setStd({ publicada: e.target.checked })}
              />
              Publicar el Save the date
            </label>
            {std.publicada ? (
              <CompartirEnlace path="/std/ana-y-leo" />
            ) : (
              <p className="text-xs text-muted">
                Al publicarlo obtendrás un enlace para enviar a tus invitados.
              </p>
            )}
            <Link href="/panel/webs" className="inline-block text-sm text-accent hover:underline">
              ← Volver a webs
            </Link>
          </Card>
        </div>

        {/* Vista previa */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Vista previa</p>
          <div ref={previewRef}>
            <SaveTheDateView std={std} editable onMove={(x, y) => setStd({ imgX: x, imgY: y })} />
          </div>
          <button
            type="button"
            onClick={descargarImagen}
            disabled={descargando}
            className="mt-3 w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {descargando ? "Generando imagen…" : "Descargar como imagen"}
          </button>
          <p className="mt-1.5 text-center text-[11px] text-muted">Se descargará un PNG en alta resolución.</p>
        </div>
      </div>
    </div>
  );
}

function Flecha({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-8 w-8 rounded border border-line text-sm hover:bg-accent-soft/40"
    >
      {children}
    </button>
  );
}
