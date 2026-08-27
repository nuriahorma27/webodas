import { NextResponse } from "next/server";
import { getStripe, SITE_URL } from "@/lib/stripe";

// Crea una cuenta Express para la pareja y la manda al onboarding de Stripe.
// En el prototipo, el id de la cuenta vuelve en la URL (?acct=) para guardarlo
// en el navegador. Con backend real se guardaría en la boda (Supabase).
export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(`${SITE_URL}/panel/regalos?stripe=sinclave`);
  }

  try {
    const url = new URL(req.url);
    let accountId = url.searchParams.get("acct") ?? "";

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "ES",
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
      });
      accountId = account.id;
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${SITE_URL}/api/stripe/connect?acct=${accountId}`,
      return_url: `${SITE_URL}/panel/regalos?stripe=ok&acct=${accountId}`,
      type: "account_onboarding",
    });

    return NextResponse.redirect(link.url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.redirect(`${SITE_URL}/panel/regalos?stripe=error&msg=${encodeURIComponent(msg)}`);
  }
}
