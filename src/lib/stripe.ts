import Stripe from "stripe";

// Devuelve el cliente de Stripe o null si no hay clave configurada.
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// Comisión de la plataforma (0 por ahora). Devuelve el importe en céntimos.
export function applicationFee(_importeCts: number): number {
  return 0;
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
