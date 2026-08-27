import { NextResponse } from "next/server";
import { getStripe, SITE_URL } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Connect API v2 · Express + "recipient" (solo recibe dinero, NO procesa pagos).
// El onboarding de la pareja es ligero (nombre, DNI, IBAN) — sin datos de empresa.
// webodas cobra el pago y transfiere el 100% a la pareja (sin comisión).
export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(`${SITE_URL}/panel/regalos?stripe=sinclave`);
  }

  try {
    const url = new URL(req.url);
    let accountId = url.searchParams.get("acct") ?? "";

    if (!accountId) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email ?? url.searchParams.get("email") ?? "pareja@webodas.app";

      const account = await stripe.v2.core.accounts.create({
        contact_email: email,
        dashboard: "express",
        identity: { country: "es", entity_type: "individual" },
        defaults: {
          currency: "eur",
          responsibilities: {
            fees_collector: "application",
            losses_collector: "application",
          },
        },
        configuration: {
          recipient: {
            capabilities: {
              stripe_balance: { stripe_transfers: { requested: true } },
            },
          },
        },
      });
      accountId = account.id;
    }

    const link = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          return_url: `${SITE_URL}/panel/regalos?stripe=ok&acct=${accountId}`,
          refresh_url: `${SITE_URL}/api/stripe/connect?acct=${accountId}`,
        },
      },
    });

    return NextResponse.redirect(link.url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.redirect(
      `${SITE_URL}/panel/regalos?stripe=error&msg=${encodeURIComponent(msg)}`,
    );
  }
}
