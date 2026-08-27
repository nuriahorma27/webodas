"use client";

import { useEffect, useState } from "react";
import { parseInline } from "@/lib/rich-text";
import { loadLista, type ListaRegalos, type Gift } from "@/lib/regalos";
import { ContribuirModal } from "@/components/contribuir-modal";
import { boda, eur } from "@/lib/mock";

export default function ListaPublicaPage() {
  const [lista, setLista] = useState<ListaRegalos | null>(null);
  const [gift, setGift] = useState<Gift | null>(null);

  useEffect(() => {
    const sync = () => setLista(loadLista());
    sync();
    window.addEventListener("webodas:regalos", sync);
    return () => window.removeEventListener("webodas:regalos", sync);
  }, []);
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
        <h1 className="mt-2 font-display text-4xl">{boda.pareja}</h1>
        <p className="mt-1 text-sm opacity-70">{boda.fechaLarga}</p>
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

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.gifts.map((g) => {
            const pct = g.objetivo ? Math.min(100, (g.aportado / g.objetivo) * 100) : 60;
            const completo = g.objetivo > 0 && pct >= 100;
            return (
              <div key={g.id} className="overflow-hidden rounded-xl border border-line bg-surface text-foreground">
                <div className="h-48 bg-accent-soft">
                  {g.imagen && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={g.imagen} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium leading-tight">{g.nombre}</p>
                  <p className="text-xs text-muted">{g.tipo}</p>
                  {g.objetivo > 0 && (
                    <div className="mt-2">
                      <div className="h-1 overflow-hidden rounded-full bg-accent-soft">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-muted">
                        {eur(g.aportado)} / {eur(g.objetivo)}
                      </p>
                    </div>
                  )}
                  {completo ? (
                    <p className="mt-2 text-[11px] text-muted">¡Completado!</p>
                  ) : (
                    <button
                      onClick={() => setGift(g)}
                      className="mt-2 w-full rounded-md bg-foreground py-1.5 text-xs font-medium text-white"
                    >
                      Contribuir
                    </button>
                  )}
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
