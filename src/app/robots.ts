import type { MetadataRoute } from "next";

/**
 * Демонстрационный магазин: цены, наличие и бренды вымышлены, заказ не оформляется.
 * Индексация закрыта, чтобы карточки несуществующих товаров не попадали в выдачу.
 * Для боевого запуска заменить на { allow: "/" } и добавить sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}
