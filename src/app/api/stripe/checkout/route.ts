import { NextResponse } from "next/server";
import { getStripe, applicationFee, SITE_URL } from "@/lib/stripe";

// Crea una sesión de Stripe Checkout para una aportación.
// TODO: leer el stripe_account_id de la boda desde Supabase y pasarlo en transfer_data.destination.
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe no está configurado todavía." },
      { status: 501 },
    );
  }

  const { giftId, giftNombre, importe, nombre, email, mensaje, stripeAccountId } = await req.json();
  const cts = Math.round(Number(importe) * 100);
  if (!cts || cts < 100) return NextResponse.json({ error: "Importe no válido" }, { status: 400 });

  const destino = stripeAccountId || process.env.STRIPE_DEMO_CONNECTED_ACCOUNT;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // Los métodos (tarjeta, Bizum…) se activan desde el dashboard de Stripe.
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: cts,
          product_data: { name: `Regalo de boda: ${giftNombre}` },
        },
      },
    ],
    customer_email: email,
    payment_intent_data: destino
      ? {
          application_fee_amount: applicationFee(cts),
          transfer_data: { destination: destino },
        }
      : undefined,
    metadata: { giftId, nombre, email, mensaje: mensaje ?? "" },
    success_url: `${SITE_URL}/lista/ana-y-leo?pago=ok`,
    cancel_url: `${SITE_URL}/lista/ana-y-leo?pago=cancelado`,
  });

  return NextResponse.json({ url: session.url });
}
