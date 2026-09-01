"use client";

import { useEffect, useRef, useState } from "react";
import type { Data } from "@measured/puck";
import { Render } from "@measured/puck";
import { SaveTheDateView } from "@/components/save-the-date-view";
import { InvitacionView } from "@/components/invitacion-view";
import { puckConfig, plantillaEditorial } from "@/lib/puck/config";
import {
  loadBoda,
  nombrePareja,
  fechaLarga,
  diasRestantes,
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
import { TAREAS, FASES, loadEstados } from "@/lib/tareas";
import { loadInvitados, type Invitado } from "@/lib/invitados";
import { loadLista, loadAportaciones } from "@/lib/regalos";
import { loadMesas } from "@/lib/mesas";
import { eur } from "@/lib/mock";

const nombreInv = (i: Invitado) => `${i.nombre} ${i.apellido}`.trim() || "(sin nombre)";

export default function RecuerdoPage() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [std, setStd] = useState<SaveTheDate | null>(null);
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [site, setSite] = useState<Data | null>(null);
  const [regalos, setRegalos] = useState({ aportaciones: 0, recaudado: 0 });
  const [mesas, setMesas] = useState<ReturnType<typeof loadMesas> | null>(null);
  const [descargando, setDescargando] = useState(false);
  const paginasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      setBoda(loadBoda());
      setStd(loadStd());
      setInv(loadInvitacion());
      setPartidas(loadPartidas());
      setEstados(loadEstados());
      setInvitados(loadInvitados());
      setMesas(loadMesas());
      try {
        const raw = localStorage.getItem("webodas:site:demo");
        setSite(raw ? (JSON.parse(raw) as Data) : (plantillaEditorial as Data));
      } catch {
        setSite(plantillaEditorial as Data);
      }
      const aps = loadAportaciones().filter((a) => a.estado === "confirmada");
      const gifts = loadLista().gifts;
      setRegalos({
        aportaciones: aps.length,
        recaudado: gifts.reduce((s, g) => s + (g.aportado || 0), 0),
      });
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

  if (!boda || !std || !inv || !mesas) return null;

  const pareja = nombrePareja(boda);
  const nombres = pareja === "Vuestra boda" ? "Nuestra boda" : pareja;
  const tot = totales(partidas);
  const dias = diasRestantes(boda);
  const puedeDescargar = dias != null && dias <= 7;

  const hechasDe = (fase: string) =>
    TAREAS.filter((t) => t.fase === fase && estados[t.id] === "hecho");
  const totalHechas = TAREAS.filter(
    (t) => t.fase !== "El día de la boda" && estados[t.id] === "hecho",
  ).length;

  const gruposInv = Array.from(
    invitados.reduce((m, i) => {
      const g = i.grupo || "Sin grupo";
      m.set(g, [...(m.get(g) ?? []), i]);
      return m;
    }, new Map<string, Invitado[]>()),
  );
  const invById = new Map(invitados.map((i) => [i.id, i]));

  const descargar = async () => {
    const cont = paginasRef.current;
    if (!cont || descargando || !puedeDescargar) return;
    setDescargando(true);
    try {
      const [{ toPng }, jspdf] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);
      if (document.fonts?.ready) await document.fonts.ready;
      const paginas = Array.from(cont.querySelectorAll<HTMLElement>("[data-pagina]"));
      const pdf = new jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      for (let i = 0; i < paginas.length; i++) {
        const nodo = paginas[i];
        const png = await toPng(nodo, {
          cacheBust: true,
          pixelRatio: 2.5,
          width: nodo.offsetWidth,
          height: nodo.offsetHeight,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(png, "PNG", 0, 0, 210, 297, undefined, "MEDIUM");
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
          Un documento de recuerdo con la portada de vuestra web, el save the date, la invitación, la
          organización y las cifras de la boda.
        </p>
      </header>

      {puedeDescargar ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={descargar}
            disabled={descargando}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
          >
            {descargando ? "Generando el PDF…" : "↓ Descargar el libro (PDF)"}
          </button>
          <p className="text-xs text-muted">Se genera con lo que tengáis ahora mismo.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-accent-soft/40 px-4 py-3 text-sm">
          <p className="font-medium">Aún no se puede descargar.</p>
          <p className="mt-0.5 text-muted">
            {dias == null
              ? "Añadid la fecha de la boda para saber cuándo estará listo."
              : `El libro se podrá descargar la semana antes de la boda (faltan ${dias} días). Mientras tanto podéis verlo aquí y seguir completándolo.`}
          </p>
        </div>
      )}

      {/* Vista previa: las mismas páginas que irán al PDF. */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-[#e7ded0] p-4 sm:p-8">
        <div ref={paginasRef} className="mx-auto flex w-[210mm] flex-col gap-8">
          {/* 1 · Portada */}
          <Pagina n="" total="">
            <div className="flex h-full flex-col items-center justify-center px-16 text-center text-[#3a352c]">
              <Logo />
              <p className="mt-14 text-[13px] uppercase tracking-[0.42em] text-[#8a7a55] doc-sans">
                El libro de
              </p>
              <p
                className="mt-6 text-[62px] leading-[1.05] text-[#4a4433]"
                style={{ fontFamily: "var(--font-parisienne), cursive" }}
              >
                {nombres}
              </p>
              <Divisor />
              <p className="font-display text-2xl text-[#5b5340]">{fechaLarga(boda)}</p>
              {boda.lugar && (
                <p className="mt-2 text-[13px] uppercase tracking-[0.28em] text-[#8a7a55] doc-sans">
                  {boda.lugar}
                </p>
              )}
            </div>
          </Pagina>

          {/* 2 · Vuestra web */}
          <Pagina n="1" total="8">
            <Encabezado numero="I" titulo="Vuestra web de boda" />
            <div className="flex flex-1 items-start justify-center px-12 pb-14">
              <div className="max-h-[190mm] w-full overflow-hidden rounded-md border border-[#d8ceba] bg-white shadow-sm">
                {site && site.content && site.content.length > 0 ? (
                  <Render config={puckConfig} data={{ ...site, content: site.content.slice(0, 1) }} />
                ) : (
                  <p className="p-10 text-center text-sm text-[#8a7a55]">
                    Aún no habéis montado la web. Aparecerá aquí cuando la tengáis.
                  </p>
                )}
              </div>
            </div>
          </Pagina>

          {/* 3 · Save the date */}
          <Pagina n="2" total="8">
            <Encabezado numero="II" titulo="El primer aviso" />
            <div className="flex flex-1 items-center justify-center px-16 pb-16">
              <div className="w-[60%]">
                <SaveTheDateView std={std} />
              </div>
            </div>
          </Pagina>

          {/* 4 · Invitación */}
          <Pagina n="3" total="8">
            <Encabezado numero="III" titulo="La invitación" />
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

          {/* 5 · En números */}
          <Pagina n="4" total="8">
            <Encabezado numero="IV" titulo="La boda en números" />
            <div className="grid flex-1 grid-cols-2 gap-x-14 gap-y-11 px-20 pb-20 pt-4">
              <Cifra n={invitados.filter((i) => i.viene === "Sí").length} etiqueta="invitados confirmados" />
              <Cifra
                n={`${invitados.filter((i) => i.tipo === "Adulto" && i.viene !== "No").length} + ${invitados.filter((i) => i.tipo === "Niño" && i.viene !== "No").length}`}
                etiqueta="adultos y niños"
              />
              <Cifra n={gruposInv.filter(([g]) => g !== "Sin grupo").length} etiqueta="grupos de invitados" />
              <Cifra n={mesas.mesas.length} etiqueta={mesas.mesas.length === 1 ? "mesa" : "mesas"} />
              <Cifra n={totalHechas} etiqueta="tareas resueltas" />
              <Cifra n={regalos.aportaciones} etiqueta="regalos recibidos" />
              <Cifra n={eur(regalos.recaudado)} etiqueta="recaudado en regalos" />
              <Cifra n={eur(tot.pagado)} etiqueta="invertido en la boda" />
            </div>
          </Pagina>

          {/* 6 · Presupuesto */}
          <Pagina n="5" total="8">
            <Encabezado numero="V" titulo="El presupuesto" />
            <div className="flex-1 px-16 pb-12 pt-3 text-[#5b5340]">
              <div className="mb-4 flex items-baseline justify-between border-b-2 border-[#3a352c] pb-2 text-[10px] uppercase tracking-[0.22em] text-[#8a7a55] doc-sans">
                <span>Partida</span>
                <div className="flex gap-14">
                  <span className="w-24 text-right">Estimado</span>
                  <span className="w-24 text-right">Pagado</span>
                </div>
              </div>
              {categoriasOrdenadas(partidas).map((cat) => {
                const filas = partidas.filter((p) => p.categoria === cat);
                const ct = totales(filas);
                return (
                  <div key={cat} className="mb-3">
                    <p className="font-display text-base text-[#4a4433]">{cat}</p>
                    {filas.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-baseline justify-between border-b border-[#e6ddca] py-1 text-[13px]"
                      >
                        <span>{p.concepto || "—"}</span>
                        <div className="flex gap-14 tabular-nums">
                          <span className="w-24 text-right">{estimadoDe(p) ? eur(estimadoDe(p)) : "—"}</span>
                          <span className="w-24 text-right font-medium text-[#4a4433]">
                            {p.pagado ? eur(p.pagado) : "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between py-1 text-[11px] text-[#8a7a55]">
                      <span>Subtotal {cat}</span>
                      <div className="flex gap-14 tabular-nums">
                        <span className="w-24 text-right">{eur(ct.estimado)}</span>
                        <span className="w-24 text-right">{eur(ct.pagado)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-6 flex items-baseline justify-between border-t-2 border-[#3a352c] pt-3">
                <span className="font-display text-lg text-[#4a4433]">Total</span>
                <div className="flex gap-14 tabular-nums">
                  <span className="w-24 text-right font-display text-lg text-[#4a4433]">{eur(tot.estimado)}</span>
                  <span className="w-24 text-right font-display text-lg text-[#4a4433]">{eur(tot.pagado)}</span>
                </div>
              </div>
            </div>
          </Pagina>

          {/* 7 · Tareas */}
          <Pagina n="6" total="8">
            <Encabezado numero="VI" titulo="Los preparativos" />
            <div className="flex-1 px-16 pb-12 pt-3 text-[#5b5340]">
              {FASES.filter((f) => f !== "Sin fecha asignada" && f !== "El día de la boda").map((f) => {
                const hechas = hechasDe(f);
                const total = TAREAS.filter((t) => t.fase === f).length;
                return (
                  <div key={f} className="mb-4">
                    <div className="flex items-baseline justify-between border-b border-[#e6ddca] pb-1">
                      <p className="font-display text-base text-[#4a4433]">{f}</p>
                      <span className="text-[11px] text-[#8a7a55] doc-sans">
                        {hechas.length} de {total}
                      </span>
                    </div>
                    {hechas.length > 0 ? (
                      <ul className="mt-1 columns-2 gap-10 text-[12px] [&>li]:mb-0.5">
                        {hechas.map((t) => (
                          <li key={t.id} className="break-inside-avoid">
                            <span className="mr-1.5 text-[#9a8b5f]">✓</span>
                            {t.titulo}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-[11px] italic text-[#a99a72]">Sin tareas marcadas.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Pagina>

          {/* 8 · Invitados */}
          <Pagina n="7" total="8">
            <Encabezado numero="VII" titulo="Los invitados" />
            <div className="flex-1 px-16 pb-12 pt-3 text-[#5b5340]">
              {invitados.length === 0 ? (
                <p className="text-sm italic text-[#a99a72]">Aún no hay invitados en la lista.</p>
              ) : (
                gruposInv.map(([g, gente]) => (
                  <div key={g} className="mb-4">
                    <p className="border-b border-[#e6ddca] pb-1 text-[11px] uppercase tracking-[0.16em] text-[#8a7a55] doc-sans">
                      {g} · {gente.length}
                    </p>
                    <ul className="mt-1.5 columns-3 gap-8 text-[12px] [&>li]:mb-0.5">
                      {gente.map((i) => (
                        <li key={i.id} className="break-inside-avoid">
                          {nombreInv(i)}
                          {i.viene === "No" && <span className="text-[#a99a72]"> (no vino)</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </Pagina>

          {/* 9 · Mesas */}
          <Pagina n="8" total="8">
            <Encabezado numero="VIII" titulo="Las mesas" />
            <div className="flex-1 px-16 pb-12 pt-3 text-[#5b5340]">
              {mesas.mesas.length === 0 ? (
                <p className="text-sm italic text-[#a99a72]">Aún no hay mesas organizadas.</p>
              ) : (
                <div className="columns-2 gap-12">
                  {mesas.mesas.map((m) => (
                    <div key={m.id} className="mb-5 break-inside-avoid">
                      <p className="font-display text-base text-[#4a4433]">
                        Mesa {m.numero}
                        {m.nombre ? ` · ${m.nombre}` : ""}
                        {m.presidencial && <span className="text-[#9a8b5f]"> ★</span>}
                      </p>
                      <ol className="mt-1 text-[12px] [&>li]:mb-0.5">
                        {m.invitados.map((id, idx) => (
                          <li key={id + idx}>
                            {idx + 1}. {invById.has(id) ? nombreInv(invById.get(id)!) : "—"}
                          </li>
                        ))}
                        {m.invitados.length === 0 && (
                          <li className="italic text-[#a99a72]">Sin invitados</li>
                        )}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Pagina>

          {/* 10 · Cierre */}
          <Pagina n="" total="">
            <div className="flex h-full flex-col items-center justify-center px-20 text-center text-[#3a352c]">
              <p className="font-display text-3xl leading-relaxed text-[#5b5340]">Y así empezó todo.</p>
              <Divisor />
              <p className="text-[13px] uppercase tracking-[0.28em] text-[#8a7a55] doc-sans">
                Gracias por acompañarnos
              </p>
              <p
                className="mt-10 text-[38px] text-[#4a4433]"
                style={{ fontFamily: "var(--font-parisienne), cursive" }}
              >
                {nombres}
              </p>
              <div className="mt-16">
                <Logo />
              </div>
            </div>
          </Pagina>
        </div>
      </div>
    </div>
  );
}

/* ---------- piezas del documento ---------- */

function Pagina({ children, n, total }: { children: React.ReactNode; n: string; total: string }) {
  return (
    <div
      data-pagina
      className="relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-[#f5efe0] shadow-[0_18px_50px_-24px_rgba(60,50,30,0.4)]"
      style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
    >
      {/* textura de papel + marco rústico de doble línea */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: "url('/textures/papel-algodon.png')",
          backgroundSize: "420px",
          mixBlendMode: "multiply",
        }}
      />
      <div className="pointer-events-none absolute inset-[9mm] border border-[#b39c6d]" />
      <div className="pointer-events-none absolute inset-[10.5mm] border border-[#cdbb8f]" />

      <div className="relative flex flex-1 flex-col">{children}</div>

      {(n || total) && (
        <div className="relative z-10 flex items-center justify-between px-16 pb-9 text-[10px] uppercase tracking-[0.22em] text-[#a1906a]">
          <span style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>webodas</span>
          <span className="doc-sans">
            {n} / {total}
          </span>
        </div>
      )}
    </div>
  );
}

function Logo() {
  return (
    <span
      className="text-[22px] tracking-[0.02em] text-[#4a4433]"
      style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
    >
      webodas
    </span>
  );
}

function Divisor() {
  return (
    <div className="my-9 flex items-center gap-3 text-[#c0ab7f]">
      <span className="h-px w-16 bg-current" />
      <span className="text-xs">✦</span>
      <span className="h-px w-16 bg-current" />
    </div>
  );
}

function Encabezado({ numero, titulo }: { numero: string; titulo: string }) {
  return (
    <div className="flex items-center gap-4 px-16 pt-16">
      <span className="font-display text-2xl text-[#c0ab7f]">{numero}</span>
      <span className="h-px flex-1 bg-[#dcd0b4]" />
      <span
        className="text-[12px] uppercase tracking-[0.28em] text-[#8a7a55]"
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
      <p className="font-display text-[54px] leading-none text-[#4a4433]">{n}</p>
      <p
        className="mt-2 text-[12px] uppercase tracking-[0.2em] text-[#8a7a55]"
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        {etiqueta}
      </p>
    </div>
  );
}
