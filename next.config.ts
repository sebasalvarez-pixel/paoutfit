import type { NextConfig } from "next";

// Cabeceras de seguridad para todas las páginas. No se define CSP estricta
// a propósito: las pasarelas (Wompi/Addi) redirigen y podrían romperse.
const securityHeaders = [
  // Obliga a usar HTTPS durante 2 años (los datos siempre viajan cifrados).
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Nadie puede incrustar la tienda en un iframe (evita clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self)",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    // Turbopack guarda en su caché de compilación (.next/cache) los valores de
    // las variables de entorno que lee mientras compila, incluidas las claves
    // secretas. Esa caché no se publica, pero el escáner de secretos de
    // Netlify la ve y cancela el despliegue ("Exposed secrets detected").
    // Sin caché de compilación en disco, ningún secreto queda escrito ahí.
    turbopackFileSystemCacheForBuild: false,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
