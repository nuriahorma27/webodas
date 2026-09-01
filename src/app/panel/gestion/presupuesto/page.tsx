"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, Stat, Progress } from "@/components/ui";
import { CampoBoda } from "@/components/campo-boda";
import { loadBoda } from "@/lib/boda";
import { eur } from "@/lib/mock";
import { descargarPresupuestoExcel } from "@/lib/export-excel";
import {
  loadPartidas,
  addPartida,
  addCategoria,
  resetPartidas,
  estimadoDe,
  updatePartida,
  removePartida,
  removeCategoria,
  renameCategoria,
  moveCategoria,
  categoriasOrdenadas,
  totales,
  partidasEstandarQuitadas,
  CATEGORIAS_ESTANDAR,
  type Partida,
} from "@/lib/presupuesto";

export default function PresupuestoPage() {
  const [partidas, setPartidas] = useState<Partida[] | null>(null);
  const [presupuestoTotal, setPresupuestoTotal] = useState<number | null>(null);
  const [menuCat, setMenuCat] = useState(false);
  const [menuPartida, setMenuPartida] = useState<string | null>(null);
  const [cerradas, setCerradas] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!menuPartida) return;
    const cerrar = () => setMenuPartida(null);
    // Cierra al hacer clic fuera (en el siguiente tick para no cerrarse al abrir).
    const t = setTimeout(() => document.addEventListener("click", cerrar), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", cerrar);
    };
  }, [menuPartida]);

  useEffect(() => {
    const sync = () => {
      setPartidas(loadPartidas());
      setPresupuestoTotal(loadBoda().presupuestoTotal);
    };
    sync();
    window.addEventListener("webodas:presupuesto", sync);
    window.addEventListener("webodas:boda", sync);
    return () => {
      window.removeEventListener("webodas:presupuesto", sync);
      window.removeEventListener("webodas:boda", sync);
    };
  }, []);

  const categorias = useMemo(
    () => (partidas ? categoriasOrdenadas(partidas) : []),
    [partidas],
  );
  const tot = useMemo(() => totales(partidas ?? []), [partidas]);

  if (!partidas) return null;

  const referencia = presupuestoTotal ?? 0;
  const sinAsignar = referencia - tot.estimado;

  const estandarDisponibles = Object.keys(CATEGORIAS_ESTANDAR).filter(
    (c) => !categorias.includes(c),
  );

  const categoriaLibre = () => {
    setMenuCat(false);
    const nombre = prompt("Nombre de la nueva categoría");
    if (nombre?.trim()) addCategoria(nombre.trim());
  };

  return (
    <div className="space-y-6">
      <div data-tour="ppto-total" className="grid gap-4 lg:grid-cols-2">
        <CampoBoda campo="presupuestoTotal" label="Presupuesto total" euro />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
        <button
          onClick={() => descargarPresupuestoExcel(partidas, presupuestoTotal)}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          ↓ Descargar en Excel
        </button>
        <button
          onClick={() => {
            if (confirm("¿Volver al presupuesto estándar? Se pierden vuestros cambios."))
              resetPartidas();
          }}
          className="text-xs text-muted underline hover:text-foreground"
        >
          Restablecer al presupuesto estándar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat
          label="Estimado"
          value={eur(tot.estimado)}
          tone={referencia ? (sinAsignar >= 0 ? "positive" : "negative") : "muted"}
          sub={
            referencia
              ? `${eur(Math.abs(sinAsignar))} ${sinAsignar >= 0 ? "sin asignar" : "por encima"}`
              : "define el presupuesto total"
          }
        />
        <Card>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">Pagado</p>
          <p className="mt-2 font-display text-3xl">
            {eur(tot.pagado)}
            {tot.estimado > 0 && (
              <span className="ml-2 align-middle text-base text-muted">
                {Math.round((tot.pagado / tot.estimado) * 100)}%
              </span>
            )}
          </p>
          <div className="mt-2">
            <Progress value={tot.estimado ? (tot.pagado / tot.estimado) * 100 : 0} />
          </div>
        </Card>
        <Stat
          label="Pendiente de pago"
          value={eur(tot.estimado - tot.pagado)}
          sub="lo que queda por abonar"
        />
      </div>

      <div data-tour="ppto-categorias" className="space-y-4">
        {categorias.map((cat, ci) => {
          const filas = partidas.filter((p) => p.categoria === cat);
          const ct = totales(filas);
          const abierta = !(cerradas[cat] ?? false);
          return (
            <Card key={cat} className="p-0">
              <div
                className={`flex items-center gap-2 px-4 py-3 sm:px-5 ${
                  abierta ? "border-b border-line" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setCerradas((s) => ({ ...s, [cat]: abierta }))}
                  aria-label={abierta ? "Contraer" : "Desplegar"}
                  className="shrink-0 text-muted transition-transform"
                  style={{ transform: abierta ? "rotate(90deg)" : "none" }}
                >
                  ▸
                </button>
                <input
                  defaultValue={cat}
                  onBlur={(e) => {
                    const v = e.target.value.trim();
                    if (v && v !== cat) renameCategoria(cat, v);
                    else e.target.value = cat;
                  }}
                  className="min-w-0 flex-1 bg-transparent font-display text-lg outline-none focus:border-b focus:border-accent"
                />
                <span className="shrink-0 text-sm text-muted">
                  {eur(ct.pagado)} / {eur(ct.estimado)}
                </span>
                <div className="flex shrink-0 flex-col leading-none text-muted">
                  <button
                    onClick={() => moveCategoria(cat, -1)}
                    disabled={ci === 0}
                    className="text-[0.7rem] hover:text-foreground disabled:opacity-25"
                    title="Subir categoría"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveCategoria(cat, 1)}
                    disabled={ci === categorias.length - 1}
                    className="text-[0.7rem] hover:text-foreground disabled:opacity-25"
                    title="Bajar categoría"
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar la categoría "${cat}" y todas sus partidas?`))
                      removeCategoria(cat);
                  }}
                  className="shrink-0 text-xs text-muted hover:text-red-600"
                  title="Eliminar categoría"
                >
                  Eliminar
                </button>
              </div>

              {abierta && (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-left text-xs uppercase tracking-wider text-muted">
                        <tr>
                          <th className="px-3 py-2 font-medium sm:px-5">Concepto</th>
                          <th className="px-2 py-2 text-right font-medium sm:px-3">Estimado</th>
                          <th className="px-2 py-2 text-right font-medium sm:px-3">Pagado</th>
                          <th className="hidden w-32 px-3 py-2 font-medium lg:table-cell">Avance</th>
                          <th className="w-8 px-2 py-2 sm:px-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {filas.map((p) => (
                          <Fila key={p.id} p={p} />
                        ))}
                        {filas.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-5 py-3 text-muted">
                              Sin partidas todavía.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="relative px-4 py-2.5 sm:px-5">
                    {(() => {
                      const quitadas = partidasEstandarQuitadas(cat, partidas);
                      const abierto = menuPartida === cat;
                      return (
                        <>
                          <button
                            onClick={() => {
                              if (quitadas.length === 0) addPartida(cat);
                              else setMenuPartida(abierto ? null : cat);
                            }}
                            className="text-sm font-medium text-accent"
                          >
                            + Añadir partida
                          </button>
                          {abierto && (
                            <div className="absolute left-4 z-20 mt-1 w-64 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg sm:left-5">
                              <button
                                onClick={() => {
                                  addPartida(cat);
                                  setMenuPartida(null);
                                }}
                                className="block w-full px-3.5 py-2 text-left text-sm hover:bg-accent-soft"
                              >
                                Nueva partida (en blanco)
                              </button>
                              <p className="px-3.5 pb-1 pt-2 text-[0.62rem] uppercase tracking-wider text-muted">
                                Volver a añadir
                              </p>
                              {quitadas.map((c) => (
                                <button
                                  key={c}
                                  onClick={() => {
                                    addPartida(cat, c);
                                    setMenuPartida(null);
                                  }}
                                  className="block w-full px-3.5 py-2 text-left text-sm hover:bg-accent-soft"
                                >
                                  {c}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuCat((v) => !v)}
          className="w-full rounded-lg border border-dashed border-line py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent"
        >
          + Añadir categoría
        </button>
        {menuCat && (
          <div className="absolute bottom-full left-0 right-0 z-10 mb-2 overflow-hidden rounded-lg border border-line bg-surface shadow-lg">
            {estandarDisponibles.length > 0 && (
              <>
                <p className="px-4 pb-1 pt-3 text-xs uppercase tracking-wider text-muted">
                  Categorías habituales
                </p>
                {estandarDisponibles.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      addCategoria(c);
                      setMenuCat(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-accent-soft"
                  >
                    {c}
                  </button>
                ))}
                <div className="my-1 border-t border-line" />
              </>
            )}
            <button
              onClick={categoriaLibre}
              className="block w-full px-4 py-2 text-left text-sm text-accent hover:bg-accent-soft"
            >
              Otra categoría…
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Fila({ p }: { p: Partida }) {
  const num = (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  const est = estimadoDe(p);
  const pct = est ? Math.min(100, (p.pagado / est) * 100) : 0;

  const cell = "w-full bg-transparent outline-none focus:border-b focus:border-accent";
  const mini =
    "w-16 rounded border border-line bg-transparent px-1.5 py-0.5 text-right text-xs outline-none focus:border-accent";

  return (
    <tr>
      <td className="px-3 py-2 sm:px-5">
        <input
          defaultValue={p.concepto}
          placeholder="Concepto"
          onBlur={(e) => updatePartida(p.id, { concepto: e.target.value })}
          className={`${cell} font-medium`}
        />
      </td>
      <td className="px-2 py-2 text-right align-middle sm:px-3">
        {p.tipo === "menu" ? (
          <div className="flex items-center justify-end gap-1 whitespace-nowrap">
            <input
              type="text"
              inputMode="decimal"
              defaultValue={p.precioUnidad || ""}
              placeholder="€/pax"
              onBlur={(e) => updatePartida(p.id, { precioUnidad: num(e.target.value) })}
              className={mini}
            />
            <span className="text-xs text-muted">×</span>
            <input
              type="text"
              inputMode="numeric"
              defaultValue={p.cantidad || ""}
              placeholder="nº"
              onBlur={(e) => updatePartida(p.id, { cantidad: num(e.target.value) })}
              className={mini}
            />
            <span className="ml-1 w-16 text-right text-xs font-medium">{eur(est)}</span>
          </div>
        ) : (
          <input
            type="text"
            inputMode="decimal"
            defaultValue={p.estimado || ""}
            placeholder="0"
            onBlur={(e) => updatePartida(p.id, { estimado: num(e.target.value) })}
            className={`${cell} text-right`}
          />
        )}
      </td>
      <td className="px-2 py-2 text-right sm:px-3">
        <input
          type="text"
          inputMode="decimal"
          defaultValue={p.pagado || ""}
          placeholder="0"
          onBlur={(e) => updatePartida(p.id, { pagado: num(e.target.value) })}
          className={`${cell} text-right`}
        />
      </td>
      <td className="hidden px-3 py-2 lg:table-cell">
        <Progress value={pct} />
      </td>
      <td className="px-2 py-2 text-right sm:px-3">
        <button
          onClick={() => removePartida(p.id)}
          className="text-muted hover:text-red-600"
          title="Eliminar partida"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}
