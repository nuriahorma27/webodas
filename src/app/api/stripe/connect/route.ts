import { NextResponse } from "next/server";
import { getStripe, SITE_URL } from "@/lib/stripe";

// Connect API v2 · Express + direct charges.
// El pago se hace en la cuenta de la pareja (son el "merchant of record"),
// webodas NO cobra comisión (sin application_fee).
export async function GET(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(`${SITE_URL}/panel/regalos?stripe=sinclave`);
  }

  try {
    const url = new URL(req.url);
    let accountId = url.searchParams.get("acct") ?? "";

    if (!accountId) {
      const account = await stripe.v2.core.accounts.create({
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
          merchant: {
            capabilities: { card_payments: { requested: true } },
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
          configurations: ["merchant"],
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
