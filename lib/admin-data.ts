import "server-only";
import { prisma } from "@/lib/prisma";

const REVENUE_STATUSES = ["paid", "fulfilled"] as const;

export async function getDashboardStats() {
  const [revenueAgg, orders, recentOrders, statusCounts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: [...REVENUE_STATUSES] } },
      _sum: { totalCop: true },
      _count: true,
    }),
    prisma.order.findMany({
      where: { status: { in: [...REVENUE_STATUSES] } },
      select: { utmSource: true, referrer: true },
    }),
    prisma.order.findMany({
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
    where: { order: { status: { in: [...REVENUE_STATUSES] } } },
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

  return {
    totalRevenueCop,
    paidOrderCount,
    avgOrderValueCop,
    recentOrders,
    trafficSources,
    topProducts,
    statusBreakdown,
  };
}
