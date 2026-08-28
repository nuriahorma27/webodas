"use client";

import { useRef } from "react";
import { PAPEL_BG, type SaveTheDate } from "@/lib/savethedate";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";

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
    const clamp = (n: number) => Math.max(-60, Math.min(60, n));
    onMove?.(clamp(drag.current.x + dx), clamp(drag.current.y + dy));
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div
      ref={boxRef}
      className="relative mx-auto w-full max-w-sm overflow-hidden rounded-lg shadow-md"
      style={{
        aspectRatio: "3 / 4",
        backgroundColor: std.colorBg,
        backgroundImage: std.textura === "papel" ? PAPEL_BG : undefined,
        color: std.colorText,
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

      <div className="absolute inset-x-0 bottom-0 p-6 text-center">
        {std.titulo && (
          <p className="text-[11px] uppercase tracking-[0.35em]" style={{ opacity: 0.75 }}>
            {std.titulo}
          </p>
        )}
        <p className="mt-1 font-display text-3xl leading-tight">{nombres}</p>
        {fecha && <p className="mt-1 font-display text-lg">{fecha}</p>}
        {std.mensaje && <p className="mt-1 text-sm" style={{ opacity: 0.8 }}>{std.mensaje}</p>}
      </div>
    </div>
  );
}
