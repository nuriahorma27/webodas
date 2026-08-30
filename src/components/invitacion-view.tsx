"use client";

import { ACABADOS, FUENTES_INV, type Invitacion } from "@/lib/invitacion";
import { loadBoda, nombrePareja } from "@/lib/boda";

// La invitación clásica española: apaisada, padres arriba en las esquinas,
// participación centrada, direcciones abajo en las esquinas.
export function InvitacionView({ inv, sinFondo = false }: { inv: Invitacion; sinFondo?: boolean }) {
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
          className={`relative flex w-full flex-col rounded-sm ${sinFondo ? "" : "shadow-md"}`}
          style={{
            aspectRatio: "1.377 / 1",
            backgroundColor: sinFondo ? "transparent" : inv.colorBg,
            color: inv.colorText,
            fontFamily: f.family,
            ...(sinFondo ? {} : ACABADOS[inv.acabado]?.style),
          }}
        >
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
