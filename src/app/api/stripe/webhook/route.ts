import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Webhook de Stripe: al confirmarse un pago, registrar la aportación en la BD
// y sumar el importe al regalo.
// TODO (PENDIENTES.md): escribir en la tabla `contributions` de Supabase.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature") ?? "";
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    // s.metadata.giftId, s.amount_total, s.metadata.nombre/email/mensaje
    // -> insertar en Supabase `contributions` + incrementar gift.aportado
    console.log("Pago confirmado", s.id, s.amount_total, s.metadata);
  }

  return NextResponse.json({ received: true });
}
