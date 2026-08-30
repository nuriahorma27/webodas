"use client";

import { ACABADOS, FUENTES_INV, type Invitacion } from "@/lib/invitacion";
import { loadBoda, nombrePareja } from "@/lib/boda";

// La invitación clásica española: apaisada, padres arriba en las esquinas,
// participación centrada, direcciones abajo en las esquinas.
export function InvitacionView({ inv }: { inv: Invitacion }) {
  const boda = loadBoda();
  const nombres =
    inv.nombres.trim() || nombrePareja(boda).replace("Vuestra boda", "Vuestros nombres");

  const anio = (() => {
    const y = new Date(boda.fecha).getFullYear();
    return Number.isFinite(y) ? y : new Date().getFullYear();
  })();
  const ciudadAno = inv.ciudadAno.trim() || `${boda.lugar?.trim() || "Madrid"}, ${anio}`;

  const f = FUENTES_INV[inv.fuente] ?? FUENTES_INV.imprenta;
  const k = f.escala;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Parisienne&display=swap"
      />
      <div className="mx-auto w-full" style={{ maxWidth: 920, containerType: "inline-size" }}>
        <div
          className="relative flex w-full flex-col rounded-sm shadow-md"
          style={{
            aspectRatio: "1.4 / 1",
            backgroundColor: inv.colorBg,
            color: inv.colorText,
            fontFamily: f.family,
            ...ACABADOS[inv.acabado]?.style,
          }}
        >
          {/* Marcas de corte en las esquinas, como en la imprenta */}
          {["left-[4%] top-[5%]", "right-[4%] top-[5%]", "left-[4%] bottom-[5%]", "right-[4%] bottom-[5%]"].map(
            (pos) => (
              <span
                key={pos}
                className={`pointer-events-none absolute ${pos}`}
                style={{
                  width: "2.2cqw",
                  height: "2.2cqw",
                  borderColor: "currentColor",
                  opacity: 0.3,
                  borderTopWidth: pos.includes("top") ? 1 : 0,
                  borderBottomWidth: pos.includes("bottom") ? 1 : 0,
                  borderLeftWidth: pos.includes("left") ? 1 : 0,
                  borderRightWidth: pos.includes("right") ? 1 : 0,
                }}
              />
            ),
          )}

          <div
            className="relative flex flex-1 flex-col justify-between px-[8%] py-[7%] text-center"
            style={{ fontSize: `${1.85 * k}cqw`, lineHeight: 1.55 }}
          >
            <div
              className="flex items-start justify-between gap-[10%]"
              style={{ fontSize: `${1.95 * k}cqw`, lineHeight: 1.4 }}
            >
              <p className="whitespace-pre-line text-left">{inv.padresNovia}</p>
              <p className="whitespace-pre-line text-right">{inv.padresNovio}</p>
            </div>

            <div className="flex flex-col items-center">
              {inv.participan && <p>{inv.participan}</p>}
              <p
                style={{ fontSize: `${4.6 * k}cqw`, lineHeight: 1.25, margin: "0.4em 0 0.5em" }}
              >
                {nombres}
              </p>
              {inv.cuerpo && <p className="whitespace-pre-line">{inv.cuerpo}</p>}
              {(inv.src || ciudadAno) && (
                <div style={{ marginTop: "1.4em" }}>
                  {inv.src && <p>{inv.src}</p>}
                  {ciudadAno && <p>{ciudadAno}</p>}
                </div>
              )}
            </div>

            <div
              className="flex items-end justify-between gap-[10%]"
              style={{ fontSize: `${1.9 * k}cqw`, lineHeight: 1.4 }}
            >
              <p className="whitespace-pre-line text-left">{inv.direccionNovia}</p>
              <p className="whitespace-pre-line text-right">{inv.direccionNovio}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
