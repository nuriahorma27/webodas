"use client";

import { useRef } from "react";
import { ACABADOS, FUENTES, type SaveTheDate } from "@/lib/savethedate";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";
import { SaveTheDateFrame } from "@/components/save-the-date-frame";

export function SaveTheDateView({
  std,
  editable = false,
  onMove,
}: {
  std: SaveTheDate;
  editable?: boolean;
  onMove?: (x: number, y: number) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const boda = loadBoda();
  const nombres = std.nombres.trim() || nombrePareja(boda).replace("Vuestra boda", "Vuestros nombres");
  const fecha = std.fecha.trim() || fechaLarga(boda);

  const onDown = (e: React.PointerEvent) => {
    if (!editable || !std.imagen) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: std.imgX, y: std.imgY };
  };
  const onMoveEv = (e: React.PointerEvent) => {
    if (!drag.current || !boxRef.current) return;
    const b = boxRef.current.getBoundingClientRect();
    const dx = ((e.clientX - drag.current.px) / b.width) * 100;
    const dy = ((e.clientY - drag.current.py) / b.height) * 100;
    const clamp = (n: number) => Math.max(-70, Math.min(70, n));
    onMove?.(clamp(drag.current.x + dx), clamp(drag.current.y + dy));
  };
  const onUp = () => {
    drag.current = null;
  };

  const family = FUENTES[std.fuente]?.family ?? FUENTES.serif.family;
  const justify =
    std.posTexto === "arriba" ? "flex-start" : std.posTexto === "centro" ? "center" : "flex-end";

  return (
    <>
      <div
        ref={boxRef}
        className="relative mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-lg shadow-md"
        style={{
          aspectRatio: "3 / 4",
          backgroundColor: std.colorBg,
          color: std.colorText,
          justifyContent: justify,
          ...ACABADOS[std.acabado]?.style,
        }}
      >
        {std.imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={std.imagen}
            alt=""
            onPointerDown={onDown}
            onPointerMove={onMoveEv}
            onPointerUp={onUp}
            draggable={false}
            className={`absolute left-1/2 top-1/2 max-w-none select-none ${
              editable ? "cursor-move" : ""
            }`}
            style={{
              width: "70%",
              transform: `translate(-50%, -50%) translate(${std.imgX}%, ${std.imgY}%) scale(${std.imgEscala})`,
            }}
          />
        )}

        <div
          className="relative z-10 p-6 text-center"
          style={{
            fontFamily: family,
            transform: `translate(${std.textoX}%, ${std.textoY}%)`,
          }}
        >
          {std.titulo && (
            <p
              className="text-[11px] uppercase tracking-[0.35em]"
              style={{ opacity: 0.75, fontFamily: "var(--font-geist-sans), sans-serif" }}
            >
              {std.titulo}
            </p>
          )}
          <p
            className="mt-1 leading-tight"
            style={{
              fontSize: `${2 * std.tamNombres}rem`,
              fontWeight: std.negrita ? 700 : 400,
              fontStyle: std.cursiva ? "italic" : "normal",
              textTransform: std.mayusculas ? "uppercase" : "none",
            }}
          >
            {nombres}
          </p>
          {fecha && <p className="mt-1 text-lg">{fecha}</p>}
          {std.mensaje && (
            <p className="mt-1 text-sm" style={{ opacity: 0.8 }}>
              {std.mensaje}
            </p>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 z-20">
          <SaveTheDateFrame marco={std.marco} tamano={std.tamMarco} margen={std.margenMarco} colorHojas={std.colorMarco} colorFrutos={std.colorFrutos} />
        </div>
      </div>
    </>
  );
}
