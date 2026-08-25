import type { MetadataRoute } from "next";
import { CULTURES, getProducts } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/collections";
import { ARTICLES } from "@/lib/articles";

const BASE = "https://polesie.example";

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

  const collections = COLLECTIONS.map((c) => ({
    url: `${BASE}/collection/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articles = ARTICLES.map((a) => ({
    url: `${BASE}/care/${a.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...statics, ...cultures, ...collections, ...products, ...articles];
}
