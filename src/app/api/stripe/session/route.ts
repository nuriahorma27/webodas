import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// Consulta una sesión de Checkout para confirmar el pago desde el navegador
// (mientras no haya webhook + BD).
export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "sin stripe" }, { status: 501 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "falta id" }, { status: 400 });

  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    return NextResponse.json({
      paid: s.payment_status === "paid",
      amount: (s.amount_total ?? 0) / 100,
      giftId: s.metadata?.giftId ?? "",
      nombre: s.metadata?.nombre ?? "",
      email: s.metadata?.email ?? s.customer_details?.email ?? "",
      mensaje: s.metadata?.mensaje ?? "",
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 400 });
  }
}
