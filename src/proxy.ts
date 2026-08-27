import { NextResponse, type NextRequest } from "next/server";

// Puerta de acceso ligera (prototipo): protege /panel y /editor con una cookie
// que pone la pantalla de login. La landing "/" y las webs públicas quedan abiertas.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protegido = pathname.startsWith("/panel") || pathname.startsWith("/editor");
  const tieneSesion = request.cookies.get("wb_session")?.value === "1";

  if (protegido && !tieneSesion) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/editor/:path*"],
};
