import "server-only";
import { prisma } from "@/lib/prisma";

const REVENUE_STATUSES = ["paid", "fulfilled"] as const;

export type DashboardRange = "today" | "week" | "month" | "all";

export function rangeStart(range: DashboardRange): Date | null {
  const now = new Date();
  if (range === "today") {
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (range === "week") {
    const day = now.getDay(); // 0 = domingo
    const diffToMonday = day === 0 ? 6 : day - 1;
    now.setDate(now.getDate() - diffToMonday);
    now.setHours(0, 0, 0, 0);
    return now;
  }
  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null; // "all"
}

export const RANGE_LABEL: Record<DashboardRange, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
  all: "Todo",
};

export async function getDashboardStats(range: DashboardRange = "month") {
  const since = rangeStart(range);
  const dateFilter = since ? { createdAt: { gte: since } } : {};

  const [revenueAgg, orders, recentOrders, statusCounts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [...REVENUE_STATUSES] }, ...dateFilter },
      _sum: { totalCop: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { status: { in: [...REVENUE_STATUSES] }, ...dateFilter },
      select: { utmSource: true, referrer: true },
    }),
    prisma.order.findMany({
      where: dateFilter,
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        totalCop: true,
        createdAt: true,
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: dateFilter,
      _count: true,
    }),
  ]);

  const totalRevenueCop = revenueAgg._sum.totalCop ?? 0;
  const paidOrderCount = revenueAgg._count;
  const avgOrderValueCop = paidOrderCount > 0 ? Math.round(totalRevenueCop / paidOrderCount) : 0;

  // "De dónde vienen las ventas": agrupamos por utm_source, o por el
  // dominio del referrer si no hay UTM, o "Directo" si no hay ninguno.
  const sourceCounts = new Map<string, number>();
  for (const order of orders) {
    let source = order.utmSource;
    if (!source && order.referrer) {
      try {
        source = new URL(order.referrer).hostname.replace(/^www\./, "");
      } catch {
        source = order.referrer;
      }
    }
    source ||= "Directo";
    sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }
  const trafficSources = Array.from(sourceCounts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ["productTitle"],
    where: { order: { status: { in: [...REVENUE_STATUSES] }, ...dateFilter } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
  const topProducts = topProductsRaw.map((p) => ({
    title: p.productTitle,
    quantity: p._sum.quantity ?? 0,
  }));

  const statusBreakdown = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count]),
  );

  // Pedidos pagados que TODAVÍA no se han despachado hoy — la cola de
  // despacho del día, sin mezclarse con pedidos de otros días.
  const todayStart = rangeStart("today")!;
  const pendingDispatchToday = await prisma.order.count({
    where: { status: "paid", createdAt: { gte: todayStart } },
  });
  const pendingDispatchTotal = await prisma.order.count({
    where: { status: "paid" },
  });

  return {
    totalRevenueCop,
    paidOrderCount,
    avgOrderValueCop,
    recentOrders,
    trafficSources,
    topProducts,
    statusBreakdown,
    pendingDispatchToday,
    pendingDispatchTotal,
  };
}

/** Ingresos por día, últimos `days` días (incluye días sin ventas en $0). */
export async function getRevenueByDay(days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: {
      status: { in: [...REVENUE_STATUSES] },
      createdAt: { gte: since },
    },
    select: { createdAt: true, totalCop: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + order.totalCop);
  }

  return Array.from(byDay.entries()).map(([date, revenueCop]) => ({
    date,
    revenueCop,
  }));
}
