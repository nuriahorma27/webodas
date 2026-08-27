import { NextResponse } from "next/server";
import { getStripe, SITE_URL } from "@/lib/stripe";

// Direct charge: la sesión de Checkout se crea EN la cuenta de la pareja.
// Sin application_fee → webodas no cobra nada.
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe no está configurado todavía." }, { status: 501 });
  }

  const { giftId, giftNombre, importe, nombre, email, mensaje, stripeAccountId } = await req.json();
  const cts = Math.round(Number(importe) * 100);
  if (!cts || cts < 100) return NextResponse.json({ error: "Importe no válido" }, { status: 400 });
  if (!stripeAccountId) {
    return NextResponse.json({ error: "La pareja aún no ha conectado su cuenta." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
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
        metadata: { giftId, nombre: nombre ?? "", email: email ?? "", mensaje: mensaje ?? "" },
        success_url: `${SITE_URL}/lista/ana-y-leo?pago=ok`,
        cancel_url: `${SITE_URL}/lista/ana-y-leo?pago=cancelado`,
      },
      { stripeAccount: stripeAccountId },
    );

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
