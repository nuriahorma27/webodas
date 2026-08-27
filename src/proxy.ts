import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Autenticación real con Supabase: protege /panel y /editor.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/panel/:path*", "/editor/:path*", "/inicio", "/registro"],
};
