"use client";

import { ACABADOS, FUENTES, type Invitacion } from "@/lib/invitacion";
import { SaveTheDateFrame } from "@/components/save-the-date-frame";
import { loadBoda, nombrePareja } from "@/lib/boda";

// La invitación clásica: padres en las esquinas, participación en el centro.
// Formato apaisado, como las de imprenta de toda la vida.
export function InvitacionView({ inv }: { inv: Invitacion }) {
  const boda = loadBoda();
  const nombres =
    inv.nombres.trim() || nombrePareja(boda).replace("Vuestra boda", "Vuestros nombres");
  const serif = FUENTES[inv.fuente]?.family ?? FUENTES.serif.family;
  const script = FUENTES.script.family;

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Great+Vibes&display=swap"
      />
      <div className="mx-auto w-full" style={{ maxWidth: 760, containerType: "inline-size" }}>
      <div
        className="relative flex w-full flex-col rounded-sm shadow-md"
        style={{
          minHeight: "62cqw",
          backgroundColor: inv.colorBg,
          color: inv.colorText,
          fontFamily: serif,
          ...ACABADOS[inv.acabado]?.style,
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <SaveTheDateFrame
            marco={inv.marco}
            colorHojas={inv.colorMarco}
            colorFrutos={inv.colorFrutos}
          />
        </div>

        {/* marcas de imprenta en las esquinas */}
        {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((pos) => (
          <span
            key={pos}
            className={`pointer-events-none absolute ${pos} h-3 w-3 border-current opacity-30`}
            style={{
              borderTopWidth: pos.includes("top") ? 1 : 0,
              borderBottomWidth: pos.includes("bottom") ? 1 : 0,
              borderLeftWidth: pos.includes("left") ? 1 : 0,
              borderRightWidth: pos.includes("right") ? 1 : 0,
            }}
          />
        ))}

        <div
          className="relative flex flex-1 flex-col justify-between gap-[3%] px-[7%] py-[6%] text-center"
          style={{ fontSize: "2.35cqw", lineHeight: 1.65 }}
        >
          {/* padres */}
          <div className="flex items-start justify-between gap-[6%]" style={{ lineHeight: 1.4 }}>
            <p className="whitespace-pre-line text-left">{inv.padresNovia}</p>
            <p className="whitespace-pre-line text-right">{inv.padresNovio}</p>
          </div>

          {/* centro */}
          <div className="flex flex-1 flex-col items-center justify-center">
            {inv.participan && <p className="italic">{inv.participan}</p>}
            <p
              className="my-[2%]"
              style={{ fontFamily: script, fontSize: "6cqw", lineHeight: 1.1 }}
            >
              {nombres}
            </p>
            {inv.cuerpo && <p className="whitespace-pre-line">{inv.cuerpo}</p>}
            {(inv.src || inv.ciudadAno) && (
              <div className="mt-[5%]">
                {inv.src && <p>{inv.src}</p>}
                {inv.ciudadAno && <p>{inv.ciudadAno}</p>}
              </div>
            )}
          </div>

          {/* direcciones */}
          <div
            className="flex items-end justify-between gap-[6%]"
            style={{ fontSize: "2.1cqw", lineHeight: 1.4 }}
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
