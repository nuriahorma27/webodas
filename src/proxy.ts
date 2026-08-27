import { NextResponse, type NextRequest } from "next/server";

// La protección de /panel y /editor se hace en sus layouts (servidor).
// Aquí solo dejamos pasar; evita depender de env vars en el edge.
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = { matcher: [] };
