import type { MetadataRoute } from "next";

/**
 * Решение D-15: индексация закрыта, пока цены, остатки и отзывы демонстрационные.
 * Снимается одной строкой при боевом запуске.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
