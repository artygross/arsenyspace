import type { MetadataRoute } from "next";
import { CULTURES, getProducts } from "@/lib/catalog";

const BASE = "https://svoya-gryadka.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const statics = ["", "/catalog", "/sale", "/delivery", "/guarantee", "/care", "/about"].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const cultures = CULTURES.map((c) => ({
    url: `${BASE}/catalog/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const products = getProducts().map((p) => ({
    url: `${BASE}/product/${p.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...statics, ...cultures, ...products];
}
