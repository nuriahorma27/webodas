import type { CSSProperties } from "react";
import { MARCOS, type MarcoStd } from "@/lib/savethedate";

export function SaveTheDateFrame({
  marco,
  tamano = 1,
  margen = 1.5,
  colorHojas = "#6f7650",
  colorFrutos = "#c79a46",
}: {
  marco: MarcoStd;
  tamano?: number;
  margen?: number;
  colorHojas?: string;
  colorFrutos?: string;
}) {
  if (marco === "ninguno") return null;
  const layer = (src: string, color: string): CSSProperties => ({
    backgroundColor: color,
    maskImage: `url("${src}")`,
    WebkitMaskImage: `url("${src}")`,
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "100% 100%",
    WebkitMaskSize: "100% 100%",
    inset: `${margen}%`,
    transform: `scale(${tamano})`,
    transformOrigin: "center",
  });
  const detail = (mask: string): CSSProperties => ({
    ...layer(mask, "transparent"),
    backgroundColor: "transparent",
    backgroundImage: `url("${MARCOS[marco].detalle}")`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    filter: "grayscale(1) contrast(1.45)",
    mixBlendMode: "multiply",
    opacity: 0.42,
  });

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 block">
      <span className="absolute block" style={layer(MARCOS[marco].hojas, colorHojas)} />
      <span className="absolute block" style={layer(MARCOS[marco].frutos, colorFrutos)} />
      <span className="absolute block" style={detail(MARCOS[marco].hojas)} />
      <span className="absolute block" style={detail(MARCOS[marco].frutos)} />
    </span>
  );
}
