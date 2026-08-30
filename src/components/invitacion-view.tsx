"use client";

import { ACABADOS, FUENTES_INV, type Invitacion } from "@/lib/invitacion";
import { loadBoda, nombrePareja } from "@/lib/boda";

// La invitación clásica: padres en las esquinas, participación en el centro,
// todo en una columna estrecha y centrada como las de toda la vida.
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
        href="https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Petit+Formal+Script&family=Cormorant+Garamond:wght@400;500&family=Parisienne&family=Tangerine:wght@400;700&display=swap"
      />
      <div className="mx-auto w-full" style={{ maxWidth: 560, containerType: "inline-size" }}>
        <div
          className="relative flex w-full flex-col rounded-sm shadow-md"
          style={{
            minHeight: "132cqw",
            backgroundColor: inv.colorBg,
            color: inv.colorText,
            fontFamily: f.family,
            ...ACABADOS[inv.acabado]?.style,
          }}
        >
          {/* Marco de línea fina, clásico */}
          <span
            className="pointer-events-none absolute"
            style={{
              inset: "4cqw",
              border: "1px solid currentColor",
              opacity: 0.35,
            }}
          />

          <div
            className="relative flex flex-1 flex-col items-center justify-between gap-[4%] px-[12%] py-[13%] text-center"
            style={{ fontSize: `${3.2 * k}cqw`, lineHeight: 1.65 }}
          >
            <div
              className="flex w-full items-start justify-between gap-[8%]"
              style={{ lineHeight: 1.4 }}
            >
              <p className="whitespace-pre-line text-left">{inv.padresNovia}</p>
              <p className="whitespace-pre-line text-right">{inv.padresNovio}</p>
            </div>

            <div className="flex w-full flex-1 flex-col items-center justify-center gap-[4%]">
              {inv.participan && <p className="mx-auto max-w-[80%]">{inv.participan}</p>}
              <p
                className="mx-auto"
                style={{ fontSize: `${7 * k}cqw`, lineHeight: 1.2 }}
              >
                {nombres}
              </p>
              {inv.cuerpo && (
                <p className="mx-auto max-w-[92%] whitespace-pre-line">{inv.cuerpo}</p>
              )}
              {(inv.src || ciudadAno) && (
                <div className="mt-[6%]">
                  {inv.src && <p>{inv.src}</p>}
                  {ciudadAno && <p>{ciudadAno}</p>}
                </div>
              )}
            </div>

            <div
              className="flex w-full items-end justify-between gap-[8%]"
              style={{ fontSize: `${2.7 * k}cqw`, lineHeight: 1.4 }}
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
