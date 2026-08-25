/**
 * Фасетные фильтры каталога. Состояние живёт в URL — решение D-08:
 * выдача шарится, индексируется и переживает перезагрузку.
 */
import {
  CULTURE_BY_KEY,
  CULTURE_BY_SLUG,
  RIPENING_LABEL,
  CONTAINER_LABEL,
  type Availability,
  type Container,
  type Culture,
  type Product,
  type Ripening,
  getProducts,
} from "./catalog";

export type Sort = "popular" | "price-asc" | "price-desc" | "new" | "ripening";

export type Query = {
  culture: Culture[];
  kind: string[];
  ripening: Ripening[];
  container: Container[];
  availability: Availability[];
  /** Минимальная зимостойкость: −20 / −25 / −30 */
  hardiness?: number;
  priceMin?: number;
  priceMax?: number;
  sale: boolean;
  q: string;
  sort: Sort;
  page: number;
};

export const EMPTY_QUERY: Query = {
  culture: [],
  kind: [],
  ripening: [],
  container: [],
  availability: [],
  sale: false,
  q: "",
  sort: "popular",
  page: 1,
};

export type RawParams = Record<string, string | string[] | undefined>;

function list(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((x) => x.split(",")).filter(Boolean);
}

function num(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const n = s ? Number(s) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

export function parseQuery(params: RawParams, cultureSlug?: string): Query {
  const fromSlug = cultureSlug ? CULTURE_BY_SLUG.get(cultureSlug)?.key : undefined;
  const culture = fromSlug
    ? [fromSlug]
    : (list(params.culture)
        .map((s) => CULTURE_BY_SLUG.get(s)?.key)
        .filter(Boolean) as Culture[]);

  const sortRaw = (Array.isArray(params.sort) ? params.sort[0] : params.sort) ?? "popular";
  const sort: Sort = (["popular", "price-asc", "price-desc", "new", "ripening"] as const).includes(
    sortRaw as Sort,
  )
    ? (sortRaw as Sort)
    : "popular";

  return {
    culture,
    kind: list(params.kind),
    ripening: list(params.ripening).filter((r): r is Ripening => r in RIPENING_LABEL),
    container: list(params.container).filter((c): c is Container => c in CONTAINER_LABEL),
    availability: list(params.availability).filter(
      (a): a is Availability => a === "in_stock" || a === "preorder" || a === "out_of_season",
    ),
    hardiness: num(params.hardiness),
    priceMin: num(params.priceMin),
    priceMax: num(params.priceMax),
    sale: params.sale === "1",
    q: ((Array.isArray(params.q) ? params.q[0] : params.q) ?? "").trim(),
    sort,
    page: Math.max(1, num(params.page) ?? 1),
  };
}

/** Сериализация обратно в строку запроса. cultureLocked — когда культура задана маршрутом. */
export function toSearchParams(q: Query, cultureLocked = false): URLSearchParams {
  const sp = new URLSearchParams();
  const push = (key: string, values: string[]) => {
    if (values.length) sp.set(key, values.join(","));
  };
  if (!cultureLocked) {
    push(
      "culture",
      q.culture.map((c) => {
        const meta = [...CULTURE_BY_SLUG.entries()].find(([, m]) => m.key === c);
        return meta ? meta[0] : c;
      }),
    );
  }
  push("kind", q.kind);
  push("ripening", q.ripening);
  push("container", q.container);
  push("availability", q.availability);
  if (q.hardiness) sp.set("hardiness", String(q.hardiness));
  if (q.priceMin) sp.set("priceMin", String(q.priceMin));
  if (q.priceMax) sp.set("priceMax", String(q.priceMax));
  if (q.sale) sp.set("sale", "1");
  if (q.q) sp.set("q", q.q);
  if (q.sort !== "popular") sp.set("sort", q.sort);
  if (q.page > 1) sp.set("page", String(q.page));
  return sp;
}

const RIPENING_ORDER: Record<Ripening, number> = { early: 0, mid: 1, late: 2, everbearing: 3 };

function matchText(p: Product, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(needle) ||
    p.kind.toLowerCase().includes(needle) ||
    p.short.toLowerCase().includes(needle) ||
    cultureName(p).toLowerCase().includes(needle)
  );
}

function cultureName(p: Product): string {
  return CULTURE_BY_KEY.get(p.culture)?.name ?? "";
}

/** Один предикат на все фасеты, кроме исключаемого — нужен для подсчёта фасетов */
function matches(p: Product, q: Query, skip?: keyof Query): boolean {
  if (skip !== "culture" && q.culture.length && !q.culture.includes(p.culture)) return false;
  if (skip !== "kind" && q.kind.length && !q.kind.includes(p.kind)) return false;
  if (skip !== "ripening" && q.ripening.length && !q.ripening.includes(p.ripening)) return false;
  if (skip !== "container" && q.container.length && !q.container.includes(p.container)) return false;
  if (skip !== "availability" && q.availability.length && !q.availability.includes(p.availability))
    return false;
  if (skip !== "hardiness" && q.hardiness && p.hardiness > -q.hardiness) return false;
  if (q.priceMin && p.price < q.priceMin) return false;
  if (q.priceMax && p.price > q.priceMax) return false;
  if (skip !== "sale" && q.sale && !p.oldPrice) return false;
  if (!matchText(p, q.q)) return false;
  return true;
}

export const PAGE_SIZE = 12;

export type FacetOption = { value: string; label: string; count: number; active: boolean };

export type CatalogResult = {
  items: Product[];
  total: number;
  shown: number;
  facets: {
    culture: FacetOption[];
    kind: FacetOption[];
    ripening: FacetOption[];
    container: FacetOption[];
    availability: FacetOption[];
    hardiness: FacetOption[];
  };
  priceBounds: [number, number];
};

export function runQuery(q: Query, cultures: { key: Culture; name: string; slug: string }[]): CatalogResult {
  const all = getProducts();
  const filtered = all.filter((p) => matches(p, q));

  const sorted = [...filtered].sort((a, b) => {
    switch (q.sort) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "new":
        return Number(b.isNew) - Number(a.isNew) || b.rating - a.rating;
      case "ripening":
        return RIPENING_ORDER[a.ripening] - RIPENING_ORDER[b.ripening];
      default:
        return (
          Number(b.isHit) - Number(a.isHit) ||
          Number(a.availability === "out_of_season") - Number(b.availability === "out_of_season") ||
          b.rating - a.rating
        );
    }
  });

  const shown = Math.min(sorted.length, q.page * PAGE_SIZE);

  /** Счётчик фасета считается без учёта самого фасета — иначе выбор схлопывает список в один пункт */
  const countFor = (skip: keyof Query, pick: (p: Product) => string | string[]) => {
    const pool = all.filter((p) => matches(p, q, skip));
    const map = new Map<string, number>();
    for (const p of pool) {
      const keys = pick(p);
      for (const k of Array.isArray(keys) ? keys : [keys]) map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  };

  const cultureCounts = countFor("culture", (p) => p.culture);
  const kindCounts = countFor("kind", (p) => p.kind);
  const ripeningCounts = countFor("ripening", (p) => p.ripening);
  const containerCounts = countFor("container", (p) => p.container);
  const availabilityCounts = countFor("availability", (p) => p.availability);
  const hardinessPool = all.filter((p) => matches(p, q, "hardiness"));

  const kindsInScope = [...new Set(all.filter((p) => matches(p, q, "kind")).map((p) => p.kind))].sort();

  return {
    items: sorted.slice(0, shown),
    total: sorted.length,
    shown,
    priceBounds: [
      Math.min(...all.map((p) => p.price)),
      Math.max(...all.map((p) => p.price)),
    ],
    facets: {
      culture: cultures.map((c) => ({
        value: c.slug,
        label: c.name,
        count: cultureCounts.get(c.key) ?? 0,
        active: q.culture.includes(c.key),
      })),
      kind: kindsInScope.map((k) => ({
        value: k,
        label: k,
        count: kindCounts.get(k) ?? 0,
        active: q.kind.includes(k),
      })),
      ripening: (Object.keys(RIPENING_LABEL) as Ripening[]).map((r) => ({
        value: r,
        label: RIPENING_LABEL[r],
        count: ripeningCounts.get(r) ?? 0,
        active: q.ripening.includes(r),
      })),
      container: (Object.keys(CONTAINER_LABEL) as Container[]).map((c) => ({
        value: c,
        label: CONTAINER_LABEL[c],
        count: containerCounts.get(c) ?? 0,
        active: q.container.includes(c),
      })),
      availability: (
        [
          ["in_stock", "В наличии"],
          ["preorder", "Предзаказ"],
        ] as const
      ).map(([v, label]) => ({
        value: v,
        label,
        count: availabilityCounts.get(v) ?? 0,
        active: q.availability.includes(v),
      })),
      hardiness: [20, 25, 30].map((h) => ({
        value: String(h),
        label: `до −${h} °C`,
        count: hardinessPool.filter((p) => p.hardiness <= -h).length,
        active: q.hardiness === h,
      })),
    },
  };
}

export function activeChips(q: Query, cultures: { key: Culture; name: string; slug: string }[]) {
  const chips: { key: string; label: string }[] = [];
  for (const c of q.culture) {
    const meta = cultures.find((x) => x.key === c);
    if (meta) chips.push({ key: `culture:${meta.slug}`, label: meta.name });
  }
  for (const k of q.kind) chips.push({ key: `kind:${k}`, label: k });
  for (const r of q.ripening) chips.push({ key: `ripening:${r}`, label: RIPENING_LABEL[r] });
  for (const c of q.container) chips.push({ key: `container:${c}`, label: CONTAINER_LABEL[c] });
  for (const a of q.availability)
    chips.push({ key: `availability:${a}`, label: a === "in_stock" ? "В наличии" : "Предзаказ" });
  if (q.hardiness) chips.push({ key: "hardiness", label: `Зимостойкость до −${q.hardiness} °C` });
  if (q.sale) chips.push({ key: "sale", label: "Со скидкой" });
  if (q.priceMin) chips.push({ key: "priceMin", label: `от ${q.priceMin} ₽` });
  if (q.priceMax) chips.push({ key: "priceMax", label: `до ${q.priceMax} ₽` });
  return chips;
}
