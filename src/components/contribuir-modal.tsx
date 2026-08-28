"use client";

import { useState } from "react";
import { contribuir, contribuirServer, type Gift, type Cobro } from "@/lib/regalos";
import { getPublicWeddingId } from "@/lib/wedding";

const eur = (n: number) => `${Math.round(n).toLocaleString("es-ES")} €`;

export function ContribuirModal({
  gift,
  cobro,
  onClose,
}: {
  gift: Gift;
  cobro: Cobro;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [importe, setImporte] = useState(gift.objetivo && gift.objetivo < 200 ? String(gift.objetivo) : "50");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const esStripe = cobro.metodo === "stripe";

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const ap = {
      nombre,
      email,
      mensaje,
      importe: Number(importe) || 0,
      estado: "pendiente" as const,
      metodo: "manual" as const,
    };
    const wid = getPublicWeddingId();
    if (wid) contribuirServer(wid, gift.id, ap);
    else contribuir(gift.id, ap);
    setSent(true);
  };

  const pagarStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giftId: gift.id,
          giftNombre: gift.nombre,
          importe: Number(importe) || 0,
          nombre,
          email,
          mensaje,
          stripeAccountId: cobro.stripeAccountId ?? "",
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "No se pudo iniciar el pago.");
    } catch {
      alert("No se pudo conectar con el pago.");
    } finally {
      setCargando(false);
    }
  };

  const field =
    "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-accent";
  const lab = "text-sm font-medium";

  return (
    <div onClick={onClose} className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-lg bg-white p-6 text-foreground"
      >
        <button onClick={onClose} className="absolute right-3 top-3 text-xl text-neutral-400">
          ×
        </button>

        {sent ? (
          <div className="py-4">
            <h3 className="font-display text-2xl">¡Gracias!</h3>
            <p className="mt-1 text-sm text-muted">
              Hemos registrado tu aportación de {eur(Number(importe) || 0)} para «{gift.nombre}». La pareja
              la verá en su panel.
            </p>
            <button onClick={onClose} className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-white">
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={esStripe ? pagarStripe : submitManual} className="space-y-3">
            <h3 className="font-display text-2xl">Contribuir</h3>
            <p className="text-sm text-muted">{gift.nombre}</p>

            <label className="block">
              <span className={lab}>Importe (€)</span>
              <input type="number" min={1} value={importe} onChange={(e) => setImporte(e.target.value)} required className={field} />
            </label>
            <label className="block">
              <span className={lab}>Nombre</span>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className={field} />
            </label>
            <label className="block">
              <span className={lab}>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={field} />
            </label>
            <label className="block">
              <span className={lab}>Mensaje para los novios (opcional)</span>
              <textarea rows={2} value={mensaje} onChange={(e) => setMensaje(e.target.value)} className={field} />
            </label>

            {!esStripe && (
              <div className="rounded-md bg-accent-soft/50 p-3 text-xs">
                <p className="font-medium">Datos para el pago:</p>
                {cobro.titular && <p>Titular: {cobro.titular}</p>}
                {cobro.iban && <p>IBAN: {cobro.iban}</p>}
                {cobro.bizum && <p>Bizum: {cobro.bizum}</p>}
                <p className="mt-1 text-muted">
                  Concepto: «{gift.nombre}». Al pulsar abajo lo dejamos registrado y la pareja lo confirma
                  cuando reciba el pago.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              {esStripe
                ? cargando
                  ? "Redirigiendo…"
                  : `Pagar ${eur(Number(importe) || 0)} con tarjeta o Bizum`
                : "Ya he hecho el pago / lo haré ahora"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
