import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { handle: true, updatedAt: true },
  });

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    ...getCategories().map((category) => ({
      url: `${baseUrl}/coleccion/${category.toLowerCase()}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${baseUrl}/producto/${p.handle}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
