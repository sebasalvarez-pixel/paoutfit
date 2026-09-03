import { NextRequest, NextResponse } from "next/server";

/**
 * Protección temporal del panel admin con usuario/contraseña simples
 * (HTTP Basic Auth) mientras conectamos un login real con Supabase Auth
 * en una fase posterior. No requiere ninguna cuenta externa para empezar
 * a usar el panel ya mismo.
 */
export function middleware(request: NextRequest) {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse(
      "El panel admin no está configurado. Define ADMIN_USERNAME y ADMIN_PASSWORD en .env.",
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(":");
      const providedUser = decoded.slice(0, separatorIndex);
      const providedPass = decoded.slice(separatorIndex + 1);
      if (providedUser === user && providedPass === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Autenticación requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="PAOUTFIT Admin"' },
  });
}

export const config = {
  matcher: "/admin/:path*",
};
