"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { loadTareas, FASES, loadEstados, type Tarea } from "@/lib/tareas";
import { loadInvitados, type Invitado } from "@/lib/invitados";
import { loadLista, loadAportaciones, type Aportacion } from "@/lib/regalos";
import { loadMesas } from "@/lib/mesas";
import { eur } from "@/lib/mock";

const nombreInv = (i: Invitado) => `${i.nombre} ${i.apellido}`.trim() || "(sin nombre)";

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out.length ? out : [[]];
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const BLOQUE_LABEL: Record<string, string> = {
  Hero: "Portada",
  Schedule: "Agenda del día",
  Countdown: "Cuenta atrás",
  Gallery: "Galería",
  Location: "Cómo llegar",
  RSVP: "Confirmación",
  MediaText: "Texto con foto",
  List: "Listado",
  RichText: "Texto",
};

type PageDef = { titulo?: string; roman?: string; cont?: boolean; body: ReactNode };

export default function RecuerdoPage() {
  const [boda, setBoda] = useState<BodaPerfil | null>(null);
  const [std, setStd] = useState<SaveTheDate | null>(null);
  const [inv, setInv] = useState<Invitacion | null>(null);
  const [partidas, setPartidas] = useState<Partida[]>([]);
  const [estados, setEstados] = useState<Record<string, string>>({});
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [site, setSite] = useState<Data | null>(null);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);
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
      setTareas(loadTareas());
      setInvitados(loadInvitados());
      setMesas(loadMesas());
      setAportaciones(loadAportaciones());
      try {
        const raw = localStorage.getItem("webodas:site:demo");
        setSite(raw ? (JSON.parse(raw) as Data) : (plantillaEditorial as Data));
      } catch {
        setSite(plantillaEditorial as Data);
      }
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
  const gifts = loadLista().gifts;

  /* ---- datos por sección ---- */

  const rellena = (p: Partida) =>
    (p.concepto && p.concepto.trim().length > 0) || estimadoDe(p) > 0 || (p.pagado || 0) > 0;

  type PptoRow =
    | { k: "cat"; cat: string }
    | { k: "p"; p: Partida }
    | { k: "sub"; e: number; g: number };
  const pptoRows: PptoRow[] = [];
  categoriasOrdenadas(partidas).forEach((cat) => {
    const filas = partidas.filter((p) => p.categoria === cat && rellena(p));
    if (filas.length === 0) return;
    pptoRows.push({ k: "cat", cat });
    filas.forEach((p) => pptoRows.push({ k: "p", p }));
    const ct = totales(filas);
    pptoRows.push({ k: "sub", e: ct.estimado, g: ct.pagado });
  });

  const tareasPorFase = FASES.map((f) => ({
    fase: f,
    items: tareas.filter((t) => t.fase === f),
  })).filter((x) => x.items.length > 0);
  type TareaRow = { k: "fase"; fase: string; n: number; hechas: number } | { k: "t"; t: Tarea };
  const tareaRows: TareaRow[] = [];
  tareasPorFase.forEach(({ fase, items }) => {
    tareaRows.push({
      k: "fase",
      fase,
      n: items.length,
      hechas: items.filter((t) => estados[t.id] === "hecho").length,
    });
    items.forEach((t) => tareaRows.push({ k: "t", t }));
  });

  const gruposInv = Array.from(
    invitados.reduce((m, i) => {
      const g = i.grupo || "Sin grupo";
      m.set(g, [...(m.get(g) ?? []), i]);
      return m;
    }, new Map<string, Invitado[]>()),
  );
  type InvRow = { k: "g"; g: string; n: number } | { k: "i"; i: Invitado };
  const invRows: InvRow[] = [];
  gruposInv.forEach(([g, gente]) => {
    invRows.push({ k: "g", g, n: gente.length });
    gente.forEach((i) => invRows.push({ k: "i", i }));
  });

  const invById = new Map(invitados.map((i) => [i.id, i]));
  const aportOrden = [...aportaciones].sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""));
  const aportPaginas = chunk(aportOrden, 22);

  /* ---- montaje de páginas ---- */

  const pages: PageDef[] = [];
  let romanIdx = 0;
  const nextRoman = () => ROMAN[romanIdx++] ?? "";

  // Portada
  pages.push({
    body: (
      <div className="flex h-full flex-col items-center justify-center px-16 text-center">
        <Logo />
        <p className="mt-14 text-[13px] uppercase tracking-[0.42em] text-(--doc-2) doc-sans">
          El libro de
        </p>
        <p
          className="mt-6 text-[62px] leading-[1.05] text-(--doc-ink)"
          style={{ fontFamily: "var(--font-parisienne), cursive" }}
        >
          {nombres}
        </p>
        <Divisor />
        <p className="font-display text-2xl text-(--doc-1)">{fechaLarga(boda)}</p>
        {boda.lugar && (
          <p className="mt-2 text-[13px] uppercase tracking-[0.28em] text-(--doc-2) doc-sans">
            {boda.lugar}
          </p>
        )}
      </div>
    ),
  });

  // Vuestra web — collage de las secciones
  {
    const bloques = site?.content ?? [];
    const rom = nextRoman();
    if (bloques.length === 0) {
      pages.push({
        titulo: "Vuestra web de boda",
        roman: rom,
        body: <VacioNota texto="Aún no habéis montado la web. Aparecerá aquí cuando la tengáis." />,
      });
    } else {
      chunk(bloques, 4).forEach((grupo, i) => {
        pages.push({
          titulo: "Vuestra web de boda",
          roman: rom,
          cont: i > 0,
          body: (
            <div className="grid flex-1 grid-cols-2 gap-5 px-14 pb-14 pt-6">
              {grupo.map((bloque, j) => (
                <div
                  key={j}
                  className="relative h-[62mm] overflow-hidden rounded-md border border-[#d3c8b1] bg-white shadow-sm"
                >
                  <div
                    style={{
                      width: "210mm",
                      transform: "scale(0.36)",
                      transformOrigin: "top left",
                    }}
                  >
                    <Render config={puckConfig} data={{ ...site!, content: [bloque] }} />
                  </div>
                  <span className="absolute bottom-1 left-1.5 rounded bg-white/85 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-(--doc-2) doc-sans">
                    {BLOQUE_LABEL[(bloque as { type: string }).type] ?? "Sección"}
                  </span>
                </div>
              ))}
            </div>
          ),
        });
      });
    }
  }

  // Save the date — con marco blanco
  pages.push({
    titulo: "El primer aviso",
    roman: nextRoman(),
    body: (
      <div className="flex flex-1 items-center justify-center px-16 pb-16">
        <div className="w-[64%] rounded-md border border-[#e0d6c1] bg-white p-6 shadow-sm">
          <SaveTheDateView std={std} />
        </div>
      </div>
    ),
  });

  // Invitación
  pages.push({
    titulo: "La invitación",
    roman: nextRoman(),
    body: (
      <div className="flex flex-1 items-center justify-center px-12 pb-16">
        {invitacionConfigurada(inv) ? (
          <div className="w-full max-w-[152mm] rounded-md border border-[#e0d6c1] bg-white p-4 shadow-sm">
            <div className="overflow-hidden rounded">
              <InvitacionView inv={inv} />
            </div>
          </div>
        ) : (
          <VacioNota texto="Aún no habéis creado la invitación. Aparecerá aquí cuando la tengáis." />
        )}
      </div>
    ),
  });

  // En números
  pages.push({
    titulo: "La boda en números",
    roman: nextRoman(),
    body: (
      <div className="grid flex-1 grid-cols-2 gap-x-14 gap-y-11 px-20 pb-20 pt-4">
        <Cifra n={invitados.filter((i) => i.viene === "Sí").length} etiqueta="invitados confirmados" />
        <Cifra
          n={`${invitados.filter((i) => i.tipo === "Adulto" && i.viene !== "No").length} + ${invitados.filter((i) => i.tipo === "Niño" && i.viene !== "No").length}`}
          etiqueta="adultos y niños"
        />
        <Cifra n={gruposInv.filter(([g]) => g !== "Sin grupo").length} etiqueta="grupos de invitados" />
        <Cifra n={mesas.mesas.length} etiqueta={mesas.mesas.length === 1 ? "mesa" : "mesas"} />
        <Cifra
          n={tareas.filter((t) => estados[t.id] === "hecho").length}
          etiqueta="tareas resueltas"
        />
        <Cifra
          n={aportaciones.filter((a) => a.estado === "confirmada").length}
          etiqueta="regalos recibidos"
        />
        <Cifra
          n={eur(gifts.reduce((s, g) => s + (g.aportado || 0), 0))}
          etiqueta="recaudado en regalos"
        />
        <Cifra n={eur(tot.pagado)} etiqueta="invertido en la boda" />
      </div>
    ),
  });

  // Presupuesto — solo lo relleno, paginado
  {
    const rom = nextRoman();
    const grupos = chunk(pptoRows, 26);
    grupos.forEach((rows, i) => {
      pages.push({
        titulo: "El presupuesto",
        roman: rom,
        cont: i > 0,
        body: (
          <div className="flex-1 px-16 pb-12 pt-3 text-(--doc-1)">
            <div className="mb-4 flex items-baseline justify-between border-b-2 border-(--doc-ink) pb-2 text-[10px] uppercase tracking-[0.22em] text-(--doc-2) doc-sans">
              <span>Partida</span>
              <div className="flex gap-14">
                <span className="w-24 text-right">Estimado</span>
                <span className="w-24 text-right">Pagado</span>
              </div>
            </div>
            {rows.map((r, k) =>
              r.k === "cat" ? (
                <p key={k} className="mt-3 font-display text-base text-(--doc-ink)">
                  {r.cat}
                </p>
              ) : r.k === "p" ? (
                <div
                  key={k}
                  className="flex items-baseline justify-between border-b border-[#e2d8c2] py-1 text-[13px]"
                >
                  <span>{r.p.concepto || "—"}</span>
                  <div className="flex gap-14 tabular-nums">
                    <span className="w-24 text-right">
                      {estimadoDe(r.p) ? eur(estimadoDe(r.p)) : "—"}
                    </span>
                    <span className="w-24 text-right font-medium text-(--doc-ink)">
                      {r.p.pagado ? eur(r.p.pagado) : "—"}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={k}
                  className="mb-1 flex items-baseline justify-between py-1 text-[11px] text-(--doc-2)"
                >
                  <span>Subtotal</span>
                  <div className="flex gap-14 tabular-nums">
                    <span className="w-24 text-right">{eur(r.e)}</span>
                    <span className="w-24 text-right">{eur(r.g)}</span>
                  </div>
                </div>
              ),
            )}
            {i === grupos.length - 1 && (
              <div className="mt-6 flex items-baseline justify-between border-t-2 border-(--doc-ink) pt-3">
                <span className="font-display text-lg text-(--doc-ink)">Total</span>
                <div className="flex gap-14 tabular-nums">
                  <span className="w-24 text-right font-display text-lg text-(--doc-ink)">
                    {eur(tot.estimado)}
                  </span>
                  <span className="w-24 text-right font-display text-lg text-(--doc-ink)">
                    {eur(tot.pagado)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ),
      });
    });
  }

  // Tareas — todas las que no se han quitado, paginado
  {
    const rom = nextRoman();
    chunk(tareaRows, 34).forEach((rows, i) => {
      pages.push({
        titulo: "Los preparativos",
        roman: rom,
        cont: i > 0,
        body: (
          <div className="flex-1 px-16 pb-12 pt-3 text-(--doc-1)">
            {rows.map((r, k) =>
              r.k === "fase" ? (
                <div
                  key={k}
                  className="mb-1 mt-3 flex items-baseline justify-between border-b border-[#e2d8c2] pb-1"
                >
                  <p className="font-display text-base text-(--doc-ink)">{r.fase}</p>
                  <span className="text-[11px] text-(--doc-2) doc-sans">
                    {r.hechas} de {r.n}
                  </span>
                </div>
              ) : (
                <div key={k} className="flex gap-2 py-0.5 text-[12px]">
                  <span
                    className={
                      estados[r.t.id] === "hecho" ? "text-[#7f7040]" : "text-(--doc-2) opacity-50"
                    }
                  >
                    {estados[r.t.id] === "hecho" ? "✓" : "○"}
                  </span>
                  <span>
                    {r.t.titulo}
                    {r.t.responsable ? (
                      <span className="text-(--doc-2)"> — {r.t.responsable}</span>
                    ) : null}
                  </span>
                </div>
              ),
            )}
          </div>
        ),
      });
    });
  }

  // Invitados — todos, paginado
  {
    const rom = nextRoman();
    if (invRows.length === 0) {
      pages.push({
        titulo: "Los invitados",
        roman: rom,
        body: <VacioNota texto="Aún no hay invitados en la lista." />,
      });
    } else {
      chunk(invRows, 48).forEach((rows, i) => {
        pages.push({
          titulo: "Los invitados",
          roman: rom,
          cont: i > 0,
          body: (
            <div className="flex-1 px-16 pb-12 pt-3 text-(--doc-1)">
              {rows.map((r, k) =>
                r.k === "g" ? (
                  <p
                    key={k}
                    className="mb-1 mt-3 border-b border-[#e2d8c2] pb-1 text-[11px] uppercase tracking-[0.16em] text-(--doc-2) doc-sans"
                  >
                    {r.g} · {r.n}
                  </p>
                ) : (
                  <p key={k} className="inline-block w-1/3 py-0.5 pr-3 align-top text-[12px]">
                    {nombreInv(r.i)}
                    {r.i.viene === "No" && <span className="text-(--doc-2)"> (no vino)</span>}
                  </p>
                ),
              )}
            </div>
          ),
        });
      });
    }
  }

  // Regalos — quién dio qué, paginado
  {
    const rom = nextRoman();
    if (aportOrden.length === 0) {
      pages.push({
        titulo: "Los regalos",
        roman: rom,
        body: <VacioNota texto="Todavía no hay regalos registrados." />,
      });
    } else {
      aportPaginas.forEach((rows, i) => {
        pages.push({
          titulo: "Los regalos",
          roman: rom,
          cont: i > 0,
          body: (
            <div className="flex-1 px-16 pb-12 pt-3 text-(--doc-1)">
              <div className="mb-3 flex items-baseline justify-between border-b-2 border-(--doc-ink) pb-2 text-[10px] uppercase tracking-[0.22em] text-(--doc-2) doc-sans">
                <span>De parte de</span>
                <span>Regalo</span>
                <span className="w-20 text-right">Aportación</span>
              </div>
              {rows.map((a) => (
                <div key={a.id} className="border-b border-[#e2d8c2] py-1.5 text-[12px]">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-(--doc-ink)">{a.nombre || "—"}</span>
                    <span className="min-w-0 flex-1 truncate text-center text-(--doc-2)">
                      {a.giftNombre}
                    </span>
                    <span className="w-20 text-right tabular-nums">{eur(a.importe)}</span>
                  </div>
                  {a.mensaje && (
                    <p className="mt-0.5 text-[11px] italic text-(--doc-2)">«{a.mensaje}»</p>
                  )}
                </div>
              ))}
              {i === aportPaginas.length - 1 && (
                <div className="mt-4 flex items-baseline justify-between border-t-2 border-(--doc-ink) pt-3">
                  <span className="font-display text-lg text-(--doc-ink)">Total recibido</span>
                  <span className="font-display text-lg text-(--doc-ink) tabular-nums">
                    {eur(aportOrden.reduce((s, a) => s + a.importe, 0))}
                  </span>
                </div>
              )}
            </div>
          ),
        });
      });
    }
  }

  // Mesas — paginado
  {
    const rom = nextRoman();
    if (mesas.mesas.length === 0) {
      pages.push({
        titulo: "Las mesas",
        roman: rom,
        body: <VacioNota texto="Aún no hay mesas organizadas." />,
      });
    } else {
      chunk(mesas.mesas, 6).forEach((grupo, i) => {
        pages.push({
          titulo: "Las mesas",
          roman: rom,
          cont: i > 0,
          body: (
            <div className="flex-1 columns-2 gap-12 px-16 pb-12 pt-3 text-(--doc-1)">
              {grupo.map((m) => (
                <div key={m.id} className="mb-5 break-inside-avoid">
                  <p className="font-display text-base text-(--doc-ink)">
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
                      <li className="italic text-(--doc-2)">Sin invitados</li>
                    )}
                  </ol>
                </div>
              ))}
            </div>
          ),
        });
      });
    }
  }

  // Cierre
  pages.push({
    body: (
      <div className="flex h-full flex-col items-center justify-center px-20 text-center">
        <p className="font-display text-3xl leading-relaxed text-(--doc-1)">Y así empezó todo.</p>
        <Divisor />
        <p className="text-[13px] uppercase tracking-[0.28em] text-(--doc-2) doc-sans">
          Gracias por acompañarnos
        </p>
        <p
          className="mt-10 text-[38px] text-(--doc-ink)"
          style={{ fontFamily: "var(--font-parisienne), cursive" }}
        >
          {nombres}
        </p>
        <div className="mt-16">
          <Logo />
        </div>
      </div>
    ),
  });

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
      const nodos = Array.from(cont.querySelectorAll<HTMLElement>("[data-pagina]"));
      const pdf = new jspdf.jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      for (let i = 0; i < nodos.length; i++) {
        const png = await toPng(nodos[i], {
          cacheBust: true,
          pixelRatio: 2.4,
          width: nodos[i].offsetWidth,
          height: nodos[i].offsetHeight,
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
          Un documento de recuerdo: vuestra web, el save the date, la invitación, los preparativos,
          los invitados, los regalos y el presupuesto.
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
      <div className="overflow-x-auto rounded-2xl border border-line bg-[#e2d9c9] p-4 sm:p-8">
        <div ref={paginasRef} className="mx-auto flex w-[210mm] flex-col gap-8">
          {pages.map((p, i) => (
            <Pagina key={i} idx={i + 1} total={pages.length}>
              {p.titulo && <Encabezado roman={p.roman} titulo={p.titulo} cont={p.cont} />}
              {p.body}
            </Pagina>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- piezas del documento ---------- */

function Pagina({ children, idx, total }: { children: ReactNode; idx: number; total: number }) {
  return (
    <div
      data-pagina
      className="relative mx-auto flex h-[297mm] w-[210mm] flex-col overflow-hidden bg-[#f8f3e6] shadow-[0_18px_50px_-24px_rgba(60,50,30,0.4)]"
      style={
        {
          fontFamily: "var(--font-cormorant), Georgia, serif",
          "--doc-ink": "#2c271f",
          "--doc-1": "#453d2e",
          "--doc-2": "#7c6c48",
        } as React.CSSProperties
      }
    >
      {/* textura de papel + marco rústico de doble línea */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage: "url('/textures/papel-algodon.png')",
          backgroundSize: "440px",
          mixBlendMode: "multiply",
        }}
      />
      <div className="pointer-events-none absolute inset-[9mm] border border-[#b09863]" />
      <div className="pointer-events-none absolute inset-[10.5mm] border border-[#cbb98c]" />

      <div className="relative flex flex-1 flex-col text-(--doc-1)">{children}</div>

      <div className="relative z-10 flex items-center justify-between px-16 pb-9 text-[10px] uppercase tracking-[0.22em] text-[#a1906a]">
        <span style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}>webodas</span>
        <span className="doc-sans">
          {idx} / {total}
        </span>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <span
      className="text-[22px] tracking-[0.02em] text-(--doc-ink)"
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

function Encabezado({ roman, titulo, cont }: { roman?: string; titulo: string; cont?: boolean }) {
  return (
    <div className="flex items-center gap-4 px-16 pt-16">
      <span className="font-display text-2xl text-[#c0ab7f]">{roman}</span>
      <span className="h-px flex-1 bg-[#dcd0b4]" />
      <span className="text-[12px] uppercase tracking-[0.28em] text-(--doc-2) doc-sans">
        {titulo}
        {cont ? " (continúa)" : ""}
      </span>
    </div>
  );
}

function Cifra({ n, etiqueta }: { n: number | string; etiqueta: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-[54px] leading-none text-(--doc-ink)">{n}</p>
      <p className="mt-2 text-[12px] uppercase tracking-[0.2em] text-(--doc-2) doc-sans">{etiqueta}</p>
    </div>
  );
}

function VacioNota({ texto }: { texto: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-16 text-center">
      <p className="max-w-xs text-sm italic text-(--doc-2)">{texto}</p>
    </div>
  );
}
