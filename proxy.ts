import { NextRequest, NextResponse } from "next/server";

/**
 * Protección temporal del panel admin con usuario/contraseña simples
 * (HTTP Basic Auth) mientras conectamos un login real con Supabase Auth
 * en una fase posterior. No requiere ninguna cuenta externa para empezar
 * a usar el panel ya mismo.
 */
// Comparación que tarda lo mismo acierte o falle, para que nadie pueda
// adivinar la clave midiendo tiempos de respuesta.
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export function proxy(request: NextRequest) {
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
      let decoded = "";
      try {
        decoded = atob(encoded);
      } catch {
        // Cabecera mal formada: se trata como credenciales inválidas.
      }
      const separatorIndex = decoded.indexOf(":");
      const providedUser = decoded.slice(0, separatorIndex);
      const providedPass = decoded.slice(separatorIndex + 1);
      if (safeEqual(providedUser, user) && safeEqual(providedPass, pass)) {
        const response = NextResponse.next();
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
        response.headers.set("Cache-Control", "no-store");
        return response;
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
