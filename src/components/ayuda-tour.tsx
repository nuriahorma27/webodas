"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  TOURS,
  TOUR_POR_RUTA,
  tourVisto,
  marcarTourVisto,
  type PasoTour,
} from "@/lib/tour";
import { loadBoda, configurada } from "@/lib/boda";
import "driver.js/dist/driver.css";
import "./ayuda-tour.css";

function claveDeRuta(pathname: string): string | null {
  if (TOUR_POR_RUTA[pathname]) return TOUR_POR_RUTA[pathname];
  return null;
}

export function AyudaTour() {
  const pathname = usePathname();
  const key = claveDeRuta(pathname);
  const corriendo = useRef(false);
  const [bodaTick, setBodaTick] = useState(0);

  useEffect(() => {
    const on = () => setBodaTick((t) => t + 1);
    window.addEventListener("webodas:boda", on);
    return () => window.removeEventListener("webodas:boda", on);
  }, []);

  const lanzar = useCallback(async (k: string) => {
    const tour = TOURS[k];
    if (!tour || corriendo.current) return;
    corriendo.current = true;

    const { driver } = await import("driver.js");

    const steps = tour.pasos.map((p: PasoTour) => {
      const existe = p.el ? document.querySelector(p.el) : null;
      return {
        element: existe ? p.el : undefined,
        popover: {
          title: p.titulo,
          description: p.texto,
          side: (existe && p.lado && p.lado !== "over" ? p.lado : "bottom") as
            | "top"
            | "bottom"
            | "left"
            | "right",
          align: "start" as const,
        },
      };
    });

    const d = driver({
      showProgress: true,
      progressText: "{{current}} de {{total}}",
      nextBtnText: "Siguiente",
      prevBtnText: "Atrás",
      doneBtnText: "Entendido",
      overlayColor: "#211d1a",
      overlayOpacity: 0.55,
      stagePadding: 6,
      stageRadius: 10,
      popoverClass: "webodas-tour",
      steps,
      onDestroyed: () => {
        marcarTourVisto(k);
        corriendo.current = false;
      },
    });
    d.drive();
  }, []);

  // Auto-lanzar la primera vez que se visita una pantalla con tour.
  useEffect(() => {
    if (!key || tourVisto(key)) return;
    // No arrancar mientras el alta de la boda sigue pendiente (modal encima).
    if (!configurada(loadBoda())) return;
    // Save the date e invitación son de escritorio: sus elementos están
    // ocultos en móvil, no lanzamos su tour ahí.
    const soloEscritorio = key === "savethedate" || key === "invitacion";
    if (soloEscritorio && window.innerWidth < 1024) return;
    const t = setTimeout(() => lanzar(key), 900);
    return () => clearTimeout(t);
  }, [key, lanzar, bodaTick]);

  if (!key) return null;

  return (
    <button
      type="button"
      data-tour="ayuda"
      onClick={() => lanzar(key)}
      aria-label="Ver la guía de esta pantalla"
      title="Ver la guía de esta pantalla"
      className="group fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full border border-line bg-surface py-2 pl-2.5 pr-3.5 text-sm text-muted shadow-[0_6px_24px_rgba(33,29,26,0.12)] transition hover:border-accent hover:text-accent sm:bottom-6 sm:right-6"
    >
      <span className="grid h-6 w-6 place-items-center rounded-full border border-current font-display text-sm leading-none">
        ?
      </span>
      <span className="hidden sm:inline">Guía</span>
    </button>
  );
}
