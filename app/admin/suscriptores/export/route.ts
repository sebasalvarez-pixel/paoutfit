import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["email", "origen", "fecha"],
    ...subscribers.map((s) => [
      s.email,
      s.source,
      s.createdAt.toISOString(),
    ]),
  ];
  const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="suscriptores-paoutfit.csv"`,
    },
  });
}
