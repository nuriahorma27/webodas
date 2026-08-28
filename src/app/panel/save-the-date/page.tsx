"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTitle, Card } from "@/components/ui";
import { SaveTheDateView } from "@/components/save-the-date-view";
import { CompartirEnlace } from "@/components/compartir-enlace";
import {
  loadStd,
  setStd,
  ACABADOS,
  FUENTES,
  type SaveTheDate,
  type AcabadoStd,
  type FuenteStd,
  type PosTextoStd,
} from "@/lib/savethedate";

const campo =
  "w-full rounded-md border border-line bg-surface px-2.5 py-1.5 text-sm outline-none focus:border-accent";

export default function SaveTheDatePage() {
  const [std, setStdState] = useState<SaveTheDate | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => setStdState(loadStd());
    sync();
    window.addEventListener("webodas:savethedate", sync);
    return () => window.removeEventListener("webodas:savethedate", sync);
  }, []);

  if (!std) return null;

  const subirImagen = (file: File) => {
    if (file.size > 6 * 1024 * 1024) {
      alert("La imagen no puede pasar de 6 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setStd({ imagen: String(reader.result) });
    reader.readAsDataURL(file);
  };

  const nudge = (dx: number, dy: number) => {
    const c = (n: number) => Math.max(-70, Math.min(70, n));
    setStd({ imgX: c(std.imgX + dx), imgY: c(std.imgY + dy) });
  };

  return (
    <div className="space-y-6">
      <PageTitle eyebrow="Servicio" title="Save the date" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
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
              <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-5">
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
                if (f) subirImagen(f);
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
          <SaveTheDateView std={std} editable onMove={(x, y) => setStd({ imgX: x, imgY: y })} />
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
