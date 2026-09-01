"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Progress, Button } from "@/components/ui";
import { ImagePicker } from "@/components/image-picker";
import { RichEditor } from "@/components/rich-editor";
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
  const [seccion, setSeccion] = useState<"seguimiento" | "config">("seguimiento");
  const wizardInicializado = useRef(false);

  useEffect(() => {
    const sync = () => {
      setLista(loadLista());
      if (!wizardInicializado.current) {
        setWizard(configurado(loadLista().cobro) ? null : "metodo");
        wizardInicializado.current = true;
      }
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
    } else if (p.get("stripe") === "sinclave") {
      alert("Stripe no está configurado: falta STRIPE_SECRET_KEY en el servidor.");
    } else if (p.get("stripe") === "error") {
      alert("Stripe: " + (p.get("msg") || "error"));
    }
  }, []);

  if (!lista) return null;

  const persist = (next: ListaRegalos) => {
    setLista(next);
    saveLista(next);
  };
  const setCampo = (k: "titulo" | "subtitulo" | "texto", v: string) =>
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
        <WorkflowHeading step="Paso 1 de 3" title="¿Cómo queréis recibir las aportaciones?" description="Elegid la opción que os resulte más cómoda. Podréis cambiarla después." />
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
        <WorkflowHeading step="Paso 2 de 3" title="Datos para recibir el dinero">
          <button onClick={() => setWizard("metodo")} className="text-sm text-muted underline">
            ← Cambiar método
          </button>
        </WorkflowHeading>

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
                {/* La ruta inicia un flujo externo de Stripe y necesita una navegación completa. */}
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
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

  /* ---------------- LISTA LISTA: seguimiento + configuración ---------------- */
  const recaudado = lista.gifts.reduce((s, g) => s + g.aportado, 0);
  const objetivo = lista.gifts.reduce((s, g) => s + g.objetivo, 0);
  const confirmadas = aportaciones.filter((a) => a.estado === "confirmada").length;
  const pendientes = aportaciones.filter((a) => a.estado === "pendiente").length;
  const metodoLabel = metodo === "stripe" ? "Con tarjeta (Stripe)" : "Transferencia / Bizum";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Lista de regalos</h2>
        <Button href="/lista/ana-y-leo" variant="ghost">
          Ver como lo ven los invitados →
        </Button>
      </div>

      <div className="inline-flex rounded-full border border-line bg-surface p-0.5 text-sm">
        {(
          [
            ["seguimiento", "Recaudación"],
            ["config", "Configuración"],
          ] as ["seguimiento" | "config", string][]
        ).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setSeccion(v)}
            className={`rounded-full px-4 py-1.5 transition ${
              seccion === v ? "bg-foreground text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {seccion === "seguimiento" ? (
        <div className="space-y-5">
          {/* total */}
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Recaudado hasta ahora</p>
            <p className="mt-2 font-display text-4xl sm:text-5xl">{eur(recaudado)}</p>
            <p className="mt-1 text-sm text-muted">
              {objetivo > 0 ? `de un objetivo de ${eur(objetivo)}` : "sin objetivo fijado"} ·{" "}
              {confirmadas} {confirmadas === 1 ? "aportación" : "aportaciones"}
              {pendientes > 0 ? ` · ${pendientes} sin confirmar` : ""}
            </p>
            {objetivo > 0 && (
              <div className="mt-4">
                <Progress value={(recaudado / objetivo) * 100} />
              </div>
            )}
          </div>

          {/* por regalo */}
          <div className="space-y-3">
            <h3 className="font-display text-lg">Cada regalo</h3>
            {lista.gifts.map((g) => {
              const falta = Math.max(0, g.objetivo - g.aportado);
              const pct = g.objetivo
                ? Math.min(100, (g.aportado / g.objetivo) * 100)
                : g.aportado > 0
                  ? 100
                  : 0;
              return (
                <div key={g.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{g.nombre}</p>
                    <p className="text-sm">
                      <span className="font-display text-lg">{eur(g.aportado)}</span>
                      {g.objetivo > 0 && (
                        <span className="text-muted"> de {eur(g.objetivo)}</span>
                      )}
                    </p>
                  </div>
                  <div className="mt-2">
                    <Progress value={pct} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    {g.objetivo > 0
                      ? falta > 0
                        ? `Faltan ${eur(falta)}`
                        : "¡Completo!"
                      : g.aportado > 0
                        ? "Aportación libre"
                        : "Sin aportaciones todavía"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* aportaciones recibidas */}
          <div className="space-y-3">
            <h3 className="font-display text-lg">Quién ha aportado</h3>
            {aportaciones.length === 0 ? (
              <p className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
                Todavía no hay aportaciones. Aparecerán aquí cuando los invitados aporten desde
                vuestra web.
              </p>
            ) : (
              <Card className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
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
                              <span className="text-xs text-green-700">Recibida</span>
                            ) : (
                              <button
                                onClick={async () => {
                                  confirmarAportacion(a.id);
                                  await confirmarAportacionServer(a.id, a.giftId, a.importe);
                                  setAportaciones((prev) =>
                                    prev.map((x) =>
                                      x.id === a.id ? { ...x, estado: "confirmada" } : x,
                                    ),
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
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* método de cobro */}
          <Card className="space-y-1.5">
            <h3 className="font-display text-lg">Cómo recibís el dinero</h3>
            <p className="text-sm">
              <strong className="text-foreground">{metodoLabel}</strong>
              {metodo === "manual" && (lista.cobro?.iban || lista.cobro?.bizum) && (
                <span className="text-muted"> · {lista.cobro?.iban || lista.cobro?.bizum}</span>
              )}
            </p>
            <button
              onClick={() => setWizard("metodo")}
              className="text-sm font-medium text-accent underline"
            >
              Cambiar método o datos
            </button>
          </Card>

          {/* mensaje para invitados */}
          <Card className="space-y-4">
            <h3 className="font-display text-lg">Lo que verán vuestros invitados</h3>
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Título de la sección</p>
              <RichEditor
                value={lista.titulo}
                onChange={(v) => setCampo("titulo", v)}
                label=""
                singleLine
                sinColor
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Frase de bienvenida</p>
              <RichEditor
                value={lista.subtitulo}
                onChange={(v) => setCampo("subtitulo", v)}
                label=""
                singleLine
                sinColor
              />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted">Explicación (opcional)</p>
              <RichEditor value={lista.texto} onChange={(v) => setCampo("texto", v)} label="" sinColor />
            </div>
            <p className="border-t border-line pt-3 text-xs text-muted">
              Los colores se toman de vuestra web de boda; todo va a juego sin que elijáis nada.
            </p>
          </Card>

          {/* editor de regalos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg">Vuestros regalos</h3>
              <Button variant="ghost" onClick={addGift}>
                + Añadir regalo
              </Button>
            </div>

            {lista.gifts.map((g) => (
              <Card key={g.id} className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="sm:w-56 sm:shrink-0">
                  <ImagePicker value={g.imagen} onChange={(v) => updGift(g.id, { imagen: v })} />
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    value={g.nombre}
                    onChange={(e) => updGift(g.id, { nombre: e.target.value })}
                    placeholder="Nombre del regalo"
                    className="w-full rounded-md border border-line px-2.5 py-2 text-base font-medium outline-none focus:border-accent"
                  />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <label className="flex items-center gap-2 text-muted">
                      Meta
                      <input
                        type="number"
                        value={g.objetivo || ""}
                        onChange={(e) => updGift(g.id, { objetivo: Number(e.target.value) || 0 })}
                        placeholder="libre"
                        className="w-24 rounded-md border border-line px-2 py-1 text-right text-foreground outline-none focus:border-accent"
                      />
                      €
                    </label>
                    <label className="flex items-center gap-2 text-muted">
                      Tipo
                      <select
                        value={g.tipo}
                        onChange={(e) => updGift(g.id, { tipo: e.target.value })}
                        className="rounded-md border border-line px-2 py-1 text-foreground outline-none focus:border-accent"
                      >
                        {TIPOS_REGALO.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => delGift(g.id)}
                  className="self-start text-xs text-muted hover:text-red-600"
                >
                  Quitar
                </button>
              </Card>
            ))}

            <button
              onClick={() => {
                if (confirm("¿Volver a la lista de regalos de ejemplo?"))
                  persist({ ...REGALOS_DEFAULT, cobro: lista.cobro });
              }}
              className="text-xs text-muted underline hover:text-foreground"
            >
              Restablecer a la lista de ejemplo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowHeading({ step, title, description, children }: { step: string; title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-accent-soft p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[.68rem] font-semibold uppercase tracking-[.18em] text-accent">{step}</p>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
