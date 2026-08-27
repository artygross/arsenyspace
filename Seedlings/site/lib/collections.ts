/**
 * Тематические подборки. Отвечают на главный способ покупки в нише:
 * покупают не «один саженец малины», а «малину на всё лето» (docs/02-analysis.md §1).
 * Правило отбора — предикат, а не список слагов: подборка не рассыпется при смене ассортимента.
 */
import { getProducts, type Product } from "./catalog";

export type Collection = {
  slug: string;
  title: string;
  h1: string;
  lead: string;
  /** Что даёт комплект — обещание, которое проверяется составом */
  promise: string;
  seo: string;
  pick: (products: Product[]) => Product[];
};

/** Один сорт на каждый срок созревания — чтобы урожай шёл волнами, а не одной неделей */
function oneOfEachRipening(pool: Product[]): Product[] {
  const order = ["early", "mid", "late", "everbearing"] as const;
  const out: Product[] = [];
  for (const ripening of order) {
    const found = pool
      .filter((p) => p.ripening === ripening && p.availability !== "out_of_season")
      .sort((a, b) => Number(b.isHit) - Number(a.isHit) || b.rating - a.rating)[0];
    if (found) out.push(found);
  }
  return out;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "malina-na-vsyo-leto",
    title: "Малина на всё лето",
    h1: "Малина на всё лето: ягода с конца июня до заморозков",
    lead: "Летние сорта отдают урожай в июне и июле, ремонтантные подхватывают в августе и держат до морозов. Вместе они закрывают весь сезон, а по отдельности — только его треть.",
    promise: "Ягода без перерывов с конца июня до первых заморозков",
    seo: "Готовый набор сортов малины с разным сроком: ранние и поздние летние плюс ремонтантные. Закрытая корневая система, посадка с апреля по октябрь, урожай с конца июня до заморозков.",
    pick: (products) =>
      oneOfEachRipening(products.filter((p) => p.culture.startsWith("raspberry"))),
  },
  {
    slug: "yagoda-bez-shipov",
    title: "Ягода без шипов",
    h1: "Ягода без шипов: собирать без перчаток",
    lead: "Сорта, у которых шипов нет вовсе или они не мешают сбору. Тот случай, когда урожай перестаёт быть испытанием — особенно если ягоду собирают дети.",
    promise: "Сбор урожая без царапин и перчаток",
    seo: "Бесшипные и слабошиповатые сорта малины и ежевики из питомника: Джоан Джей, Глен Ампл, Гусар, Вошито. Удобный сбор, закрытая корневая система.",
    pick: (products) =>
      products
        .filter(
          (p) =>
            /бесшипн|слабошипов/i.test(p.kind) ||
            /без шипов|почти без шипов|бесшип/i.test(p.short),
        )
        .slice(0, 6),
  },
  {
    slug: "dlya-holodnogo-regiona",
    title: "Для холодного региона",
    h1: "Для холодного региона: сорта, которые переживут −30 °C",
    lead: "Отобрали то, что зимует там, где обычные сорта вымерзают. У каждого сорта зимостойкость указана числом, а не словами «зимостойкий».",
    promise: "Зимовка при морозе до −30 °C и ниже",
    seo: "Зимостойкие саженцы для Урала, Сибири и северных областей: смородина до −35 °C, голубика до −34 °C, малина до −32 °C. Закрытая корневая система.",
    pick: (products) =>
      products
        .filter((p) => p.hardiness <= -30)
        .sort((a, b) => a.hardiness - b.hardiness)
        .slice(0, 8),
  },
  {
    slug: "pervyy-sad",
    title: "Первый сад",
    h1: "Первый сад: что посадить, если сажаете впервые",
    lead: "Смородина и ремонтантная малина прощают новичку почти всё: не нужна шпалера, зимнее пригибание и точный полив. Обрезка сводится к одному движению осенью.",
    promise: "Понятный уход и предсказуемый урожай на второй год",
    seo: "Набор для начинающего садовода: саженцы чёрной смородины и ремонтантной малины с закрытой корневой системой, без шпалеры и укрытия, с пошаговой памяткой по посадке.",
    pick: (products) =>
      products
        .filter(
          (p) =>
            (p.culture === "currant" || p.culture === "raspberry-ever") &&
            p.availability !== "out_of_season",
        )
        .sort((a, b) => b.rating - a.rating || a.price - b.price)
        .slice(0, 6),
  },
];

export const COLLECTION_BY_SLUG = new Map(COLLECTIONS.map((c) => [c.slug, c]));

export function collectionItems(collection: Collection): Product[] {
  return collection.pick(getProducts());
}
