import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Evita crear una conexión nueva en cada hot-reload durante desarrollo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// El servidor local de "prisma dev" recicla conexiones inactivas de forma
// agresiva; sin este ajuste el pool de "pg" intenta reutilizar conexiones
// que el servidor ya cerró y falla con "Connection terminated unexpectedly".
// Siguiendo la recomendación que el propio `prisma dev` imprime al iniciar.
//
// En producción es al revés: la base está lejos (São Paulo) y abrir una
// conexión nueva cuesta varios viajes de ida y vuelta, así que se mantienen
// abiertas unos segundos para reutilizarlas entre visitas. El máximo es bajo
// porque cada instancia del servidor tiene su propio pool y el pooler de
// Supabase (plan gratuito) admite pocas conexiones a la vez.
const isProduction = process.env.NODE_ENV === "production";

// El pooler de Supabase ofrece dos puertos: 5432 ("modo sesión", solo 15
// clientes a la vez: se llena con unas pocas visitas simultáneas) y 6543
// ("modo transacción", pensado para servidores sin estado como Netlify, admite
// cientos). La app usa el segundo en producción; las migraciones locales
// siguen usando el 5432 de DATABASE_URL, que es lo que necesitan.
function resolveConnectionString() {
  const url = process.env.DATABASE_URL;
  if (isProduction && url?.includes("pooler.supabase.com:5432")) {
    return url.replace("pooler.supabase.com:5432", "pooler.supabase.com:6543");
  }
  return url;
}

const adapter = new PrismaPg({
  connectionString: resolveConnectionString(),
  max: isProduction ? 3 : 10,
  idleTimeoutMillis: isProduction ? 20000 : 1000,
  connectionTimeoutMillis: 15000,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
