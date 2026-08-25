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
    slug: "klubnika-na-vsyo-leto",
    title: "Клубника на всё лето",
    h1: "Клубника на всё лето: ягода с июня до заморозков",
    lead: "Три-четыре сорта с разным сроком созревания на одной грядке. Пока отходит ранний, начинает средний, за ним поздний, а ремонтантный тянет до октября.",
    promise: "Ягода без перерывов с начала июня до первых заморозков",
    seo: "Готовый набор сортов клубники с разным сроком созревания: ранние, средние, поздние и ремонтантные. Все с закрытой корневой системой, высадка возможна весь сезон.",
    pick: (products) => oneOfEachRipening(products.filter((p) => p.culture === "strawberry")),
  },
  {
    slug: "yagoda-bez-shipov",
    title: "Ягода без шипов",
    h1: "Ягода без шипов: собирать без перчаток",
    lead: "Сорта, у которых шипов нет вовсе или они не мешают сбору. Тот случай, когда урожай перестаёт быть испытанием — особенно если ягоду собирают дети.",
    promise: "Сбор урожая без царапин и перчаток",
    seo: "Бесшипные и слабошиповатые сорта малины и крыжовника из питомника: удобный сбор урожая, закрытая корневая система, зимостойкость до −35 °C.",
    pick: (products) =>
      products
        .filter(
          (p) =>
            /бесшипн|слабошипов|штамбов/i.test(p.kind) ||
            /без шипов|почти без шипов|бесшип/i.test(p.short),
        )
        .slice(0, 6),
  },
  {
    slug: "dlya-holodnogo-regiona",
    title: "Для холодного региона",
    h1: "Для холодного региона: сорта, которые переживут −30 °C",
    lead: "Отобрали то, что зимует без укрытия там, где обычные сорта вымерзают. У каждого сорта зимостойкость указана числом, а не словами «зимостойкий».",
    promise: "Зимовка без укрытия при морозе до −30 °C и ниже",
    seo: "Зимостойкие саженцы для Урала, Сибири и северных областей: жимолость до −40 °C, смородина и крыжовник до −35 °C, малина до −32 °C.",
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
    lead: "Культуры, которые прощают ошибки новичку: не требуют шпалеры, сложной обрезки и точного полива. С них разумно начать, а сложное добавить на второй год.",
    promise: "Неприхотливые культуры с понятным уходом и предсказуемым урожаем",
    seo: "Набор для начинающего садовода: смородина, крыжовник, жимолость и клубника — неприхотливые культуры с закрытой корневой системой и пошаговой памяткой по посадке.",
    pick: (products) =>
      products
        .filter(
          (p) =>
            ["currant", "gooseberry", "honeysuckle"].includes(p.culture) &&
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
