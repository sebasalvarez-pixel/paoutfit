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
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 1000,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
