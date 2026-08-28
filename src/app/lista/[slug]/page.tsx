"use client";

import { use, useEffect, useState } from "react";
import { parseInline } from "@/lib/rich-text";
import {
  loadLista,
  setListaOverride,
  contribuir,
  contribuirServer,
  type ListaRegalos,
  type Gift,
} from "@/lib/regalos";
import { ContribuirModal } from "@/components/contribuir-modal";
import { loadBoda, setBodaOverride, nombrePareja, fechaLarga } from "@/lib/boda";
import { fetchBundlePublico, pickBundle, getPublicWeddingId } from "@/lib/wedding";

const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;

export default function ListaPublicaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [lista, setLista] = useState<ListaRegalos | null>(null);
  const [gift, setGift] = useState<Gift | null>(null);
  const [gracias, setGracias] = useState<string | null>(null);
  const [noExiste, setNoExiste] = useState(false);
  const boda = loadBoda();

  useEffect(() => {
    let vivo = true;
    const sync = () => setLista(loadLista());
    (async () => {
      if ((slug === "ana-y-leo" || slug === "demo") && localStorage.getItem("webodas:regalos")) {
        sync();
        window.addEventListener("webodas:regalos", sync);
        return;
      }
      const res = await fetchBundlePublico(slug);
      if (!vivo) return;
      if (!res || !res.found) return setNoExiste(true);
      setBodaOverride(pickBundle(res.data, "webodas:boda", null));
      setListaOverride(pickBundle(res.data, "webodas:regalos", null));
      sync();
    })();
    return () => {
      vivo = false;
      window.removeEventListener("webodas:regalos", sync);
      setListaOverride(null);
      setBodaOverride(null);
    };
  }, [slug]);

  // Vuelta de Stripe Checkout: confirmar el pago y registrar la aportación.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("pago") !== "ok" || !p.get("session")) return;
    const sid = p.get("session")!;
    (async () => {
      try {
        const res = await fetch(`/api/stripe/session?id=${encodeURIComponent(sid)}`);
        const d = await res.json();
        if (!d.paid) return;
        const ap = {
          id: "sess-" + sid,
          nombre: d.nombre,
          email: d.email,
          mensaje: d.mensaje,
          importe: d.amount,
          estado: "confirmada" as const,
          metodo: "stripe" as const,
        };
        let wid = getPublicWeddingId();
        if (!wid) {
          const res = await fetchBundlePublico(slug);
          wid = res?.found ? res.id : null;
        }
        if (wid) await contribuirServer(wid, d.giftId, ap);
        else contribuir(d.giftId, ap);
        setGracias(`¡Gracias! Aportación de ${eur(d.amount)} registrada.`);
      } catch {
        /* noop */
      } finally {
        window.history.replaceState({}, "", window.location.pathname);
      }
    })();
  }, [slug]);

  if (noExiste)
    return (
      <div className="grid min-h-screen place-items-center p-8 text-center text-sm text-neutral-500">
        Esta lista de regalos no existe o todavía no se ha publicado.
      </div>
    );
  if (!lista) return null;

  const bg = lista.colorBg || undefined;
  const fg = lista.colorText || undefined;

  return (
    <div className="min-h-screen" style={{ background: bg, color: fg }}>
      <header
        className="border-b border-line py-10 text-center"
        style={{ background: bg ? "transparent" : "var(--color-surface)" }}
      >
        <p className="text-xs uppercase tracking-[0.25em] opacity-70">Lista de regalos</p>
        <h1 className="mt-2 font-display text-4xl">{nombrePareja(boda)}</h1>
        <p className="mt-1 text-sm opacity-70">{fechaLarga(boda)}</p>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <div className="text-center">
          <h2 className="font-display text-3xl">{parseInline(lista.titulo)}</h2>
          {lista.subtitulo && (
            <p className="mt-1 font-display text-xl text-accent">{parseInline(lista.subtitulo)}</p>
          )}
          {lista.texto && (
            <p className="mx-auto mt-3 max-w-lg text-sm opacity-75">{parseInline(lista.texto)}</p>
          )}
        </div>

        {gracias && (
          <p className="mt-6 rounded-md bg-green-50 px-4 py-3 text-center text-sm text-green-700">
            {gracias}
          </p>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.gifts.map((g) => {
            const pct = g.objetivo ? Math.min(100, (g.aportado / g.objetivo) * 100) : 60;
            const completo = g.objetivo > 0 && pct >= 100;
            return (
              <div
                key={g.id}
                className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface text-foreground"
              >
                <div className="h-48 shrink-0 bg-accent-soft">
                  {g.imagen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imagen} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="line-clamp-2 min-h-[2.6em] font-medium leading-tight">{g.nombre}</p>
                  <p className="text-xs text-muted">{g.tipo}</p>

                  <div className="mt-2 min-h-[1.9em]">
                    {g.objetivo > 0 && (
                      <>
                        <div className="h-1 overflow-hidden rounded-full bg-accent-soft">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1 text-[10px] text-muted">
                          {eur(g.aportado)} / {eur(g.objetivo)}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="mt-auto pt-3">
                    {completo ? (
                      <p className="text-center text-[11px] text-muted">¡Completado!</p>
                    ) : (
                      <button
                        onClick={() => setGift(g)}
                        className="w-full rounded-md bg-foreground py-1.5 text-xs font-medium text-white"
                      >
                        Contribuir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {gift && (
        <ContribuirModal
          gift={gift}
          cobro={lista.cobro ?? { metodo: "manual" }}
          onClose={() => setGift(null)}
        />
      )}
    </div>
  );
}
