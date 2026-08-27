import { NextResponse, type NextRequest } from "next/server";

// Prototipo visual: sin control de sesión. La lógica de auth vive en
// src/lib/supabase/middleware.ts y se reactivará más adelante.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
