"use client";

import { useEffect, useState } from "react";
import { PageTitle, Card, Stat, Progress, Button } from "@/components/ui";
import { ImagePicker } from "@/components/image-picker";
import { RichEditor } from "@/components/rich-editor";
import { ColorField } from "@/components/color-field";
import {
  loadLista,
  saveLista,
  loadAportaciones,
  fetchAportacionesServer,
  confirmarAportacion,
  confirmarAportacionServer,
  REGALOS_DEFAULT,
  TIPOS_REGALO,
  type ListaRegalos,
  type Gift,
  type Aportacion,
  type Cobro,
} from "@/lib/regalos";
import { eur } from "@/lib/mock";

const inp =
  "mt-1 w-full rounded-md border border-line px-2.5 py-1.5 text-sm outline-none focus:border-accent";

function configurado(c?: Cobro) {
  if (!c) return false;
  return c.metodo === "stripe" ? !!c.stripeConnected : !!(c.iban || c.bizum);
}

export default function RegalosPage() {
  const [lista, setLista] = useState<ListaRegalos | null>(null);
  const [aportaciones, setAportaciones] = useState<Aportacion[]>([]);
  const [wizard, setWizard] = useState<"metodo" | "cuenta" | null>("metodo");
  const [wizardInit, setWizardInit] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLista(loadLista());
      const locales = loadAportaciones();
      setAportaciones(locales);
      // + las que han hecho los invitados por la web (servidor)
      fetchAportacionesServer().then((srv) => {
        if (srv.length) setAportaciones([...srv, ...locales.filter((l) => l.metodo === "manual" && l.id.startsWith("seed"))]);
      });
    };
    sync();
    window.addEventListener("webodas:regalos", sync);
    return () => window.removeEventListener("webodas:regalos", sync);
  }, []);

  // Vuelta del onboarding de Stripe: ?stripe=ok&acct=acct_xxx
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("stripe") === "ok" && p.get("acct")) {
      const l = loadLista();
      saveLista({
        ...l,
        cobro: { metodo: "stripe", ...l.cobro, stripeConnected: true, stripeAccountId: p.get("acct")! },
      });
      window.history.replaceState({}, "", "/panel/gestion/regalos");
      setLista(loadLista());
    } else if (p.get("stripe") === "sinclave") {
      alert("Stripe no está configurado: falta STRIPE_SECRET_KEY en el servidor.");
    } else if (p.get("stripe") === "error") {
      alert("Stripe: " + (p.get("msg") || "error"));
    }
  }, []);

  useEffect(() => {
    if (lista && !wizardInit) {
      setWizard(configurado(lista.cobro) ? null : "metodo");
      setWizardInit(true);
    }
  }, [lista, wizardInit]);

  if (!lista) return null;

  const persist = (next: ListaRegalos) => {
    setLista(next);
    saveLista(next);
  };
  const setCampo = (k: "titulo" | "subtitulo" | "texto" | "colorBg" | "colorText", v: string) =>
    persist({ ...lista, [k]: v });
  const setCobro = (patch: Partial<Cobro>) =>
    persist({ ...lista, cobro: { metodo: "manual", ...lista.cobro, ...patch } });
  const updGift = (id: string, patch: Partial<Gift>) =>
    persist({ ...lista, gifts: lista.gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  const delGift = (id: string) => persist({ ...lista, gifts: lista.gifts.filter((g) => g.id !== id) });
  const addGift = () =>
    persist({
      ...lista,
      gifts: [
        ...lista.gifts,
        { id: crypto.randomUUID(), nombre: "Nuevo regalo", imagen: "", tipo: "Producto", objetivo: 0, aportado: 0 },
      ],
    });

  const metodo = lista.cobro?.metodo ?? "manual";
  const puedeSeguir = metodo === "stripe" ? !!lista.cobro?.stripeConnected : !!(lista.cobro?.iban || lista.cobro?.bizum);

  /* ---------------- PASO 1: elegir método ---------------- */
  if (wizard === "metodo") {
    return (
      <div className="space-y-6">
        <PageTitle eyebrow="Lista de regalos · Paso 1 de 3" title="¿Cómo queréis recibir las aportaciones?" />
        <div data-tour="regalos-cobro" className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => {
              setCobro({ metodo: "manual" });
              setWizard("cuenta");
            }}
            className="rounded-xl border border-line bg-surface p-6 text-left transition hover:border-accent"
          >
            <h3 className="font-display text-xl">Transferencia / Bizum</h3>
            <p className="mt-2 text-sm text-muted">
              Ponéis vuestro IBAN y Bizum. Los invitados os pagan directamente y vosotros confirmáis
              cada aportación en el panel. Sin comisiones, sin cuentas.
            </p>
          </button>
          <button
            onClick={() => {
              setCobro({ metodo: "stripe" });
              setWizard("cuenta");
            }}
            className="rounded-xl border border-line bg-surface p-6 text-left transition hover:border-accent"
          >
            <h3 className="font-display text-xl">Stripe (tarjeta + Bizum)</h3>
            <p className="mt-2 text-sm text-muted">
              Los invitados pagan con tarjeta, Bizum o Apple/Google Pay en una página segura. El dinero
              llega solo a vuestra cuenta. Necesita crear una cuenta gratuita de Stripe (5 min).
            </p>
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- PASO 2: crear la cuenta ---------------- */
  if (wizard === "cuenta") {
    return (
      <div className="space-y-6">
        <PageTitle eyebrow="Lista de regalos · Paso 2 de 3" title="Datos para recibir el dinero">
          <button onClick={() => setWizard("metodo")} className="text-sm text-muted underline">
            ← Cambiar método
          </button>
        </PageTitle>

        {metodo === "manual" ? (
          <Card className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-muted">IBAN</span>
                <input
                  value={lista.cobro?.iban ?? ""}
                  onChange={(e) => setCobro({ iban: e.target.value })}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  className={inp}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted">Bizum (teléfono)</span>
                <input value={lista.cobro?.bizum ?? ""} onChange={(e) => setCobro({ bizum: e.target.value })} className={inp} />
              </label>
              <label className="block sm:col-span-3">
                <span className="text-xs font-medium text-muted">Titular de la cuenta</span>
                <input value={lista.cobro?.titular ?? ""} onChange={(e) => setCobro({ titular: e.target.value })} className={inp} />
              </label>
            </div>
            <p className="text-xs text-muted">Con poner el IBAN o el Bizum es suficiente para continuar.</p>
          </Card>
        ) : (
          <Card className="space-y-3">
            <p className="text-sm text-muted">
              Cada pareja crea <strong>su propia cuenta de Stripe</strong> (gratuita, sin coste de
              alta). Es un formulario de Stripe de unos 5 minutos con vuestros datos y una cuenta
              bancaria. El dinero de las aportaciones va <strong>directo a vosotros</strong>; webodas
              no lo toca.
            </p>
            {lista.cobro?.stripeConnected ? (
              <p className="text-sm text-green-700">✓ Cuenta de Stripe conectada.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                <a
                  href="/api/stripe/connect"
                  className="inline-flex rounded-md bg-[#635bff] px-4 py-2 text-sm font-medium text-white"
                >
                  Crear / conectar mi cuenta de Stripe
                </a>
                <button
                  onClick={() => setCobro({ stripeConnected: true })}
                  className="rounded-md border border-line px-4 py-2 text-sm text-muted"
                >
                  (Prototipo) simular que ya está conectada
                </button>
              </div>
            )}
          </Card>
        )}

        <Button onClick={() => puedeSeguir && setWizard(null)}>
          Continuar a los regalos →
        </Button>
        {!puedeSeguir && (
          <p className="text-xs text-muted">
            {metodo === "manual" ? "Añade un IBAN o Bizum para continuar." : "Conecta la cuenta de Stripe para continuar."}
          </p>
        )}
      </div>
    );
  }

  /* ---------------- PASO 3: la lista ---------------- */
  const recaudado = lista.gifts.reduce((s, g) => s + g.aportado, 0);
  const objetivo = lista.gifts.reduce((s, g) => s + g.objetivo, 0);

  return (
    <div className="space-y-8">
      <PageTitle title="Lista de regalos">
        <Button href="/lista/ana-y-leo" variant="ghost">
          Ver como invitado
        </Button>
      </PageTitle>

      <div className="flex items-center gap-2 text-sm text-muted">
        Cobro: <strong className="text-foreground">{metodo === "stripe" ? "Stripe" : "Transferencia / Bizum"}</strong>
        <button onClick={() => setWizard("metodo")} className="underline">
          Cambiar
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Recaudado" value={eur(recaudado)} sub={`objetivo ${eur(objetivo)}`} />
        <Stat label="Regalos" value={`${lista.gifts.length}`} sub="en la lista" />
        <Stat
          label="Aportaciones"
          value={`${aportaciones.filter((a) => a.estado === "confirmada").length}`}
          sub={`${aportaciones.filter((a) => a.estado === "pendiente").length} por confirmar`}
        />
      </div>

      <Card className="space-y-4">
        <h2 className="font-display text-lg">Texto de la sección</h2>
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Texto principal</p>
          <RichEditor value={lista.titulo} onChange={(v) => setCampo("titulo", v)} label="" singleLine />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Subtexto</p>
          <RichEditor value={lista.subtitulo} onChange={(v) => setCampo("subtitulo", v)} label="" singleLine />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted">Texto</p>
          <RichEditor value={lista.texto} onChange={(v) => setCampo("texto", v)} label="" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField value={lista.colorBg} onChange={(v) => setCampo("colorBg", v)} label="Color de fondo" />
          <ColorField value={lista.colorText} onChange={(v) => setCampo("colorText", v)} label="Color del texto" />
        </div>
      </Card>

      {aportaciones.length > 0 && (
        <Card className="p-0">
          <div className="flex items-center justify-between p-5">
            <h2 className="font-display text-lg">Aportaciones</h2>
            <span className="text-sm text-muted">
              {eur(aportaciones.filter((a) => a.estado === "confirmada").reduce((s, a) => s + a.importe, 0))} confirmadas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-line text-left text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-2.5">Nombre</th>
                  <th className="px-5 py-2.5">Regalo</th>
                  <th className="px-5 py-2.5 text-right">Importe</th>
                  <th className="px-5 py-2.5">Mensaje</th>
                  <th className="px-5 py-2.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {aportaciones.map((a) => (
                  <tr key={a.id}>
                    <td className="px-5 py-3 font-medium">{a.nombre}</td>
                    <td className="px-5 py-3 text-muted">{a.giftNombre}</td>
                    <td className="px-5 py-3 text-right">{eur(a.importe)}</td>
                    <td className="px-5 py-3 text-muted">{a.mensaje || "—"}</td>
                    <td className="px-5 py-3">
                      {a.estado === "confirmada" ? (
                        <span className="text-xs text-green-700">Confirmada</span>
                      ) : (
                        <button
                          onClick={async () => {
                            confirmarAportacion(a.id);
                            await confirmarAportacionServer(a.id, a.giftId, a.importe);
                            setAportaciones((prev) =>
                              prev.map((x) => (x.id === a.id ? { ...x, estado: "confirmada" } : x)),
                            );
                          }}
                          className="rounded-md border border-green-600 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
                        >
                          Marcar recibida
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Regalos</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={addGift}>
              Añadir regalo
            </Button>
            <button onClick={() => persist({ ...REGALOS_DEFAULT, cobro: lista.cobro })} className="text-xs text-muted underline">
              Restablecer
            </button>
          </div>
        </div>

        {lista.gifts.map((g) => {
          const pct = g.objetivo ? (g.aportado / g.objetivo) * 100 : 100;
          return (
            <Card key={g.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <ImagePicker value={g.imagen} onChange={(v) => updGift(g.id, { imagen: v })} className="flex-1" />
                <button onClick={() => delGift(g.id)} className="text-xs text-muted hover:text-red-600">
                  🗑️ Quitar
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-6">
                <label className="block sm:col-span-3">
                  <span className="text-xs font-medium text-muted">Nombre</span>
                  <input value={g.nombre} onChange={(e) => updGift(g.id, { nombre: e.target.value })} className={inp} />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted">Tipo</span>
                  <select value={g.tipo} onChange={(e) => updGift(g.id, { tipo: e.target.value })} className={inp}>
                    {TIPOS_REGALO.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted">Objetivo (€)</span>
                  <input
                    type="number"
                    value={g.objetivo || ""}
                    onChange={(e) => updGift(g.id, { objetivo: Number(e.target.value) || 0 })}
                    className={inp}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted">Aportado (€)</span>
                  <input
                    type="number"
                    value={g.aportado || ""}
                    onChange={(e) => updGift(g.id, { aportado: Number(e.target.value) || 0 })}
                    className={inp}
                  />
                </label>
              </div>
              {g.objetivo > 0 && (
                <div>
                  <Progress value={pct} />
                  <p className="mt-1 text-xs text-muted">
                    {eur(g.aportado)} de {eur(g.objetivo)}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
