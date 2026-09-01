"use client";

import { useEffect, useRef, useState } from "react";
import { SaveTheDateView } from "@/components/save-the-date-view";
import { InvitacionView } from "@/components/invitacion-view";
import {
  loadBoda,
  nombrePareja,
  fechaLarga,
  type BodaPerfil,
} from "@/lib/boda";
import { loadStd, type SaveTheDate } from "@/lib/savethedate";
import { loadInvitacion, invitacionConfigurada, type Invitacion } from "@/lib/invitacion";
import {
  loadPartidas,
  estimadoDe,
  totales,
  categoriasOrdenadas,
  type Partida,
} from "@/lib/presupuesto";
import { TAREAS, loadEstados } from "@/lib/tareas";
import { resumenInvitados } from "@/lib/invitados";
import { loadLista, loadAportaciones } from "@/lib/regalos";
import { loadMesas } from "@/lib/mesas";
import { eur } from "@/lib/mock";

export default function RecuerdoPage() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [std, setStd] = useState<SaveTheDate | null>(null);
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [tareasHechas, setTareasHechas] = useState(0);
  const [resumen, setResumen] = useState<ReturnType<typeof resumenInvitados> | null>(null);
  const [regalos, setRegalos] = useState({ aportaciones: 0, recaudado: 0 });
  const [nMesas, setNMesas] = useState(0);
  const [descargando, setDescargando] = useState(false);
  const paginasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      setBoda(loadBoda());
      setStd(loadStd());
      setInv(loadInvitacion());
      setPartidas(loadPartidas());
      const est = loadEstados();
      setTareasHechas(TAREAS.filter((t) => est[t.id] === "hecho").length);
      setResumen(resumenInvitados());
      const aps = loadAportaciones().filter((a) => a.estado === "confirmada");
      const gifts = loadLista().gifts;
      setRegalos({
        aportaciones: aps.length,
        recaudado: gifts.reduce((s, g) => s + (g.aportado || 0), 0),
      });
      setNMesas(loadMesas().mesas.length);
    };
    sync();
    const ev = [
      "webodas:boda",
      "webodas:savethedate",
      "webodas:invitacion",
      "webodas:presupuesto",
      "webodas:tareas",
      "webodas:invitados",
      "webodas:regalos",
      "webodas:mesas",
    ];
    ev.forEach((e) => window.addEventListener(e, sync));
    return () => ev.forEach((e) => window.removeEventListener(e, sync));
  }, []);

  if (!boda || !std || !inv || !resumen) return null;

  const pareja = nombrePareja(boda);
  const nombres = pareja === "Vuestra boda" ? "Nuestra boda" : pareja;
  const tot = totales(partidas);

  const descargar = async () => {
    const cont = paginasRef.current;
    if (!cont || descargando) return;
    setDescargando(true);
    try {
      const [{ toPng }, jspdf] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      if (document.fonts?.ready) await document.fonts.ready;

      const paginas = Array.from(cont.querySelectorAll<HTMLElement>("[data-pagina]"));
      const pdf = new jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const W = 210;
      const H = 297;

      for (let i = 0; i < paginas.length; i++) {
        const nodo = paginas[i];
        const png = await toPng(nodo, {
          cacheBust: true,
          pixelRatio: 2.5,
          width: nodo.offsetWidth,
          height: nodo.offsetHeight,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(png, "PNG", 0, 0, W, H, undefined, "MEDIUM");
      }

      const slug = nombres
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      pdf.save(`libro-de-la-boda${slug ? `-${slug}` : ""}.pdf`);
    } catch {
      alert("No se ha podido generar el PDF. Vuelve a intentarlo.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="gestion-heading">
        <h1 className="font-display text-3xl leading-none sm:text-4xl">El libro de la boda</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Un documento de recuerdo con la portada, el save the date, la invitación, las cifras de la
          boda y el presupuesto. Se descarga en PDF cuando queráis.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={descargar}
          disabled={descargando}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          {descargando ? "Generando el PDF…" : "↓ Descargar el libro (PDF)"}
        </button>
        <p className="text-xs text-muted">
          Se genera con lo que tengáis ahora mismo. Podéis volver y descargarlo de nuevo cuando lo
          actualicéis.
        </p>
      </div>

      {/* Vista previa: las mismas páginas que van al PDF. */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-[#efe9dd] p-4 sm:p-8">
        <div ref={paginasRef} className="mx-auto flex w-[210mm] flex-col gap-8">
          {/* 1 · Portada */}
          <Pagina>
            <BordeBotanico />
            <div className="relative flex h-full flex-col items-center justify-center px-16 text-center text-[#3a352c]">
              <p
                className="text-[13px] uppercase tracking-[0.42em] text-[#8a7a55]"
                style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
              >
                El libro de
              </p>
              <p
                className="mt-8 text-[64px] leading-[1.05] text-[#4a4433]"
                style={{ fontFamily: "var(--font-parisienne), cursive" }}
              >
                {nombres}
              </p>
              <div className="my-10 h-px w-24 bg-[#c8b78c]" />
              <p className="font-display text-2xl text-[#5b5340]">{fechaLarga(boda)}</p>
              {boda.lugar && (
                <p
                  className="mt-2 text-[13px] uppercase tracking-[0.3em] text-[#8a7a55]"
                  style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                >
                  {boda.lugar}
                </p>
              )}
            </div>
          </Pagina>

          {/* 2 · Save the date */}
          <Pagina>
            <Encabezado numero="I" titulo="El primer aviso" />
            <div className="flex flex-1 items-center justify-center px-16 pb-16">
              <div className="w-[62%]">
                <SaveTheDateView std={std} />
              </div>
            </div>
          </Pagina>

          {/* 3 · Invitación */}
          <Pagina>
            <Encabezado numero="II" titulo="La invitación" />
            <div className="flex flex-1 items-center justify-center px-12 pb-16">
              {invitacionConfigurada(inv) ? (
                <div className="w-full max-w-[150mm] overflow-hidden rounded-md border border-[#e3dac6] shadow-sm">
                  <InvitacionView inv={inv} />
                </div>
              ) : (
                <p className="text-sm text-[#8a7a55]">
                  Aún no habéis creado la invitación. Aparecerá aquí cuando la tengáis.
                </p>
              )}
            </div>
          </Pagina>

          {/* 4 · En números */}
          <Pagina>
            <Encabezado numero="III" titulo="La boda en números" />
            <div className="grid flex-1 grid-cols-2 gap-x-14 gap-y-12 px-20 pb-20 pt-6">
              <Cifra n={resumen.confirmadas} etiqueta="invitados confirmados" />
              <Cifra n={`${resumen.adultos} + ${resumen.ninos}`} etiqueta="adultos y niños" />
              <Cifra n={resumen.grupos} etiqueta="grupos de invitados" />
              <Cifra n={nMesas} etiqueta={nMesas === 1 ? "mesa" : "mesas"} />
              <Cifra n={tareasHechas} etiqueta="tareas resueltas" />
              <Cifra n={regalos.aportaciones} etiqueta="regalos recibidos" />
              <Cifra n={eur(regalos.recaudado)} etiqueta="recaudado en regalos" />
              <Cifra n={eur(tot.pagado)} etiqueta="invertido en la boda" />
            </div>
          </Pagina>

          {/* 5 · Presupuesto */}
          <Pagina>
            <Encabezado numero="IV" titulo="El presupuesto" />
            <div className="flex-1 px-16 pb-14 pt-4">
              <div className="mb-6 flex items-baseline justify-between border-b-2 border-[#3a352c] pb-3">
                <span
                  className="text-[11px] uppercase tracking-[0.24em] text-[#8a7a55]"
                  style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
                >
                  Partida
                </span>
                <div className="flex gap-16 text-[11px] uppercase tracking-[0.24em] text-[#8a7a55]" style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}>
                  <span className="w-24 text-right">Estimado</span>
                  <span className="w-24 text-right">Pagado</span>
                </div>
              </div>

              {categoriasOrdenadas(partidas).map((cat) => {
                const filas = partidas.filter((p) => p.categoria === cat);
                const ct = totales(filas);
                return (
                  <div key={cat} className="mb-4">
                    <p className="font-display text-lg text-[#4a4433]">{cat}</p>
                    {filas.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-baseline justify-between border-b border-[#e6ddca] py-1.5 text-sm text-[#5b5340]"
                      >
                        <span>{p.concepto || "—"}</span>
                        <div className="flex gap-16 tabular-nums">
                          <span className="w-24 text-right">{estimadoDe(p) ? eur(estimadoDe(p)) : "—"}</span>
                          <span className="w-24 text-right font-medium text-[#4a4433]">
                            {p.pagado ? eur(p.pagado) : "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between py-1 text-xs text-[#8a7a55]">
                      <span>Subtotal {cat}</span>
                      <div className="flex gap-16 tabular-nums">
                        <span className="w-24 text-right">{eur(ct.estimado)}</span>
                        <span className="w-24 text-right">{eur(ct.pagado)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-8 flex items-baseline justify-between border-t-2 border-[#3a352c] pt-4">
                <span className="font-display text-xl text-[#4a4433]">Total</span>
                <div className="flex gap-16 tabular-nums">
                  <span className="w-24 text-right font-display text-xl text-[#4a4433]">
                    {eur(tot.estimado)}
                  </span>
                  <span className="w-24 text-right font-display text-xl text-[#4a4433]">
                    {eur(tot.pagado)}
                  </span>
                </div>
              </div>
            </div>
          </Pagina>

          {/* 6 · Cierre */}
          <Pagina>
            <BordeBotanico />
            <div className="relative flex h-full flex-col items-center justify-center px-20 text-center text-[#3a352c]">
              <p className="font-display text-3xl leading-relaxed text-[#5b5340]">
                Y así empezó todo.
              </p>
              <div className="my-8 h-px w-20 bg-[#c8b78c]" />
              <p
                className="text-[13px] uppercase tracking-[0.3em] text-[#8a7a55]"
                style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
              >
                Gracias por acompañarnos
              </p>
              <p
                className="mt-10 text-[40px] text-[#4a4433]"
                style={{ fontFamily: "var(--font-parisienne), cursive" }}
              >
                {nombres}
              </p>
            </div>
          </Pagina>
        </div>
      </div>
    </div>
  );
}

/* ---------- piezas del documento ---------- */

function Pagina({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-pagina
      className="relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-[#faf6ec] shadow-[0_18px_50px_-24px_rgba(60,50,30,0.35)]"
      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
    >
      {children}
    </div>
  );
}

function Encabezado({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div className="flex items-center gap-4 px-16 pt-16">
      <span className="font-display text-2xl text-[#c0ab7f]">{numero}</span>
      <span className="h-px flex-1 bg-[#dcd0b4]" />
      <span
        className="text-[12px] uppercase tracking-[0.3em] text-[#8a7a55]"
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        {titulo}
      </span>
    </div>
  );
}

function Cifra({ n, etiqueta }: { n: number | string; etiqueta: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-[56px] leading-none text-[#4a4433]">{n}</p>
      <p
        className="mt-2 text-[12px] uppercase tracking-[0.22em] text-[#8a7a55]"
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        {etiqueta}
      </p>
    </div>
  );
}

// Marco botánico suave en las esquinas (mismas ilustraciones del editor).
function BordeBotanico() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/frames/olivo.png"
        alt=""
        className="pointer-events-none absolute -left-10 -top-10 w-56 -scale-x-100 opacity-40 mix-blend-multiply"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/frames/olivo.png"
        alt=""
        className="pointer-events-none absolute -bottom-10 -right-10 w-56 rotate-180 -scale-x-100 opacity-40 mix-blend-multiply"
      />
    </>
  );
}
