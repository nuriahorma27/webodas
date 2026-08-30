"use client";

import { ACABADOS, FUENTES, type Invitacion } from "@/lib/invitacion";
import { SaveTheDateFrame } from "@/components/save-the-date-frame";
import { loadBoda, nombrePareja, fechaLarga } from "@/lib/boda";

// La invitación clásica: familias, texto formal, novios, ceremonia y convite.
export function InvitacionView({ inv }: { inv: Invitacion }) {
  const boda = loadBoda();
  const nombres =
    inv.nombres.trim() || nombrePareja(boda).replace("Vuestra boda", "Vuestros nombres");
  const fecha = inv.fecha.trim() || fechaLarga(boda);
  const family = FUENTES[inv.fuente]?.family ?? FUENTES.serif.family;
  const sans = "var(--font-geist-sans), system-ui, sans-serif";

  const Linea = ({ children }: { children: React.ReactNode }) =>
    children ? <p className="mt-1 text-sm leading-relaxed">{children}</p> : null;

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" />
      <div
        className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg px-8 py-12 text-center shadow-md"
        style={{
          backgroundColor: inv.colorBg,
          color: inv.colorText,
          fontFamily: family,
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

        <div className="relative">
          {inv.encabezado && (
            <p
              className="text-[11px] uppercase tracking-[0.3em]"
              style={{ opacity: 0.7, fontFamily: sans }}
            >
              {inv.encabezado}
            </p>
          )}

          {(inv.familiaNovia || inv.familiaNovio) && (
            <div className="mt-4 grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
              <div className="whitespace-pre-line">{inv.familiaNovia}</div>
              <div className="whitespace-pre-line">{inv.familiaNovio}</div>
            </div>
          )}

          {inv.textoInvitacion && (
            <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed">{inv.textoInvitacion}</p>
          )}

          <p className="mt-4 font-display text-3xl leading-tight">{nombres}</p>

          {(fecha || inv.hora) && (
            <p className="mt-4 text-base">
              {fecha}
              {fecha && inv.hora ? " · " : ""}
              {inv.hora}
            </p>
          )}

          {inv.ceremoniaLugar && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ opacity: 0.6, fontFamily: sans }}>
                Ceremonia
              </p>
              <Linea>{inv.ceremoniaLugar}</Linea>
              <Linea>{inv.ceremoniaDireccion}</Linea>
            </div>
          )}

          {inv.celebracionLugar && (
            <div className="mt-4">
              <p className="text-[11px] uppercase tracking-[0.2em]" style={{ opacity: 0.6, fontFamily: sans }}>
                Celebración
              </p>
              <Linea>{inv.celebracionLugar}</Linea>
              <Linea>{inv.celebracionDireccion}</Linea>
            </div>
          )}

          {inv.confirmacion && (
            <p className="mt-5 text-xs" style={{ opacity: 0.8 }}>
              {inv.confirmacion}
            </p>
          )}
          {inv.nota && (
            <p className="mt-2 text-xs italic" style={{ opacity: 0.75 }}>
              {inv.nota}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
