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
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: isProduction ? 3 : 10,
  idleTimeoutMillis: isProduction ? 20000 : 1000,
  connectionTimeoutMillis: 15000,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
