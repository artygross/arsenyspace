import { Suspense } from "react";
import { ActiveChips, CatalogFilters, SortSelect, type FacetGroup } from "@/components/catalog-filters";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui";
import {
  BRANDS,
  FACE_LABEL,
  FACE_SHAPES,
  FRAME_COLORS,
  GENDER_LABEL,
  LENS_COLORS,
  LENS_LABEL,
  LENS_TYPES,
  MATERIALS,
  MATERIAL_LABEL,
  PRICE_MAX,
  PRICE_MIN,
  PRODUCTS,
  SHAPES,
  SHAPE_LABEL,
  SIZES,
  colorHex,
  facetCount,
  filterProducts,
  type Product,
  type Query,
} from "@/lib/catalog";
import { plural } from "@/lib/format";

const GENDERS = ["women", "men", "unisex"] as const;

/** Порядок фасетов задан в docs/03-ux-structure.md: цена и бренд первыми. */
function buildFacets(q: Query, base: Product[]): FacetGroup[] {
  return [
    {
      key: "brand",
      title: "Бренд",
      type: "check",
      searchable: true,
      options: BRANDS.map((b) => ({
        value: b,
        label: b,
        count: facetCount(q, "brand", (p) => p.brand === b, base),
      })),
    },
    {
      key: "shape",
      title: "Форма оправы",
      type: "shape",
      options: SHAPES.map((s) => ({
        value: s,
        label: SHAPE_LABEL[s],
        count: facetCount(q, "shape", (p) => p.shape === s, base),
      })),
    },
    {
      key: "face",
      title: "Подойдут моему лицу",
      type: "check",
      options: FACE_SHAPES.map((f) => ({
        value: f,
        label: FACE_LABEL[f],
        count: facetCount(q, "face", (p) => p.faceShapes.includes(f), base),
      })),
    },
    {
      key: "frameColor",
      title: "Цвет оправы",
      type: "color",
      options: FRAME_COLORS.map((c) => ({
        value: c,
        label: c,
        hex: colorHex(c),
        count: facetCount(q, "frameColor", (p) => p.variants.some((v) => v.frame === c), base),
      })),
    },
    {
      key: "lensColor",
      title: "Цвет линзы",
      type: "color",
      options: LENS_COLORS.map((c) => ({
        value: c,
        label: c,
        hex: colorHex(c),
        count: facetCount(q, "lensColor", (p) => p.variants.some((v) => v.lens === c), base),
      })),
    },
    {
      key: "lens",
      title: "Тип линзы",
      type: "check",
      options: LENS_TYPES.map((l) => ({
        value: l,
        label: LENS_LABEL[l],
        count: facetCount(q, "lens", (p) => p.lensTypes.includes(l), base),
      })),
    },
    {
      key: "material",
      title: "Материал",
      type: "check",
      options: MATERIALS.map((m) => ({
        value: m,
        label: MATERIAL_LABEL[m],
        count: facetCount(q, "material", (p) => p.material === m, base),
      })),
    },
    {
      key: "size",
      title: "Размер оправы",
      type: "segment",
      options: SIZES.map((s) => ({
        value: s,
        label: s,
        count: facetCount(q, "size", (p) => p.size === s, base),
      })),
    },
    {
      key: "gender",
      title: "Кому",
      type: "check",
      options: GENDERS.map((g) => ({
        value: g,
        label: GENDER_LABEL[g],
        count: facetCount(q, "gender", (p) => p.gender === g, base),
      })),
    },
  ];
}

function headline(q: Query): { title: string; note?: string } {
  if (q.q) return { title: `Поиск: ${q.q}` };
  if (q.sale) return { title: "Со скидкой" };
  if (q.sort === "new") return { title: "Новинки" };
  if (q.shape.length === 1) return { title: SHAPE_LABEL[q.shape[0]] };
  if (q.brand.length === 1) return { title: q.brand[0] };
  if (q.gender.length === 1) return { title: `${GENDER_LABEL[q.gender[0]]} очки` };
  if (q.face.length === 1)
    return {
      title: `Для ${FACE_LABEL[q.face[0]].toLowerCase()} лица`,
      note: "Отобраны формы, которые уравновешивают пропорции этого типа лица.",
    };
  return { title: "Все солнцезащитные очки" };
}

export function CatalogView({
  q,
  base = PRODUCTS,
  hideFacets = [],
  children,
}: {
  q: Query;
  /** Подмножество каталога — например, товары одного бренда на его странице. */
  base?: Product[];
  /** Фасеты, которые на этой странице не имеют смысла (бренд на странице бренда). */
  hideFacets?: string[];
  children?: React.ReactNode;
}) {
  const products = filterProducts(q, base);
  const facets = buildFacets(q, base).filter((f) => !hideFacets.includes(f.key));

  return (
    <div className="grid gap-x-10 lg:grid-cols-[260px_1fr]">
      <Suspense fallback={<aside className="hidden lg:block" />}>
        <CatalogFilters groups={facets} price={{ min: PRICE_MIN, max: PRICE_MAX }} total={products.length} />
      </Suspense>

      <section>
        {children}

        <div className="border-line mb-6 flex items-center justify-between gap-4 border-b pb-4">
          <p className="text-sm">
            <span className="font-medium">{products.length}</span>{" "}
            <span className="text-ink-muted">
              {plural(products.length, "модель", "модели", "моделей")}
            </span>
          </p>
          <Suspense fallback={null}>
            <SortSelect />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ActiveChips groups={facets} />
        </Suspense>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState q={q} base={base} />
        )}
      </section>
    </div>
  );
}

export { headline };

/** Пустая выдача — не тупик: показывает, какой фасет мешает, и даёт выход. */
function EmptyState({ q, base = PRODUCTS }: { q: Query; base?: Product[] }) {
  const culprits: string[] = [];
  if (q.q) culprits.push("текстовый запрос");
  if (q.brand.length) culprits.push("бренд");
  if (q.shape.length) culprits.push("форму оправы");
  if (q.priceMin || q.priceMax) culprits.push("диапазон цены");
  if (q.face.length) culprits.push("форму лица");
  if (q.lens.length) culprits.push("тип линзы");

  const relaxed = filterProducts(
    { ...q, q: "", priceMin: undefined, priceMax: undefined, brand: [] },
    base,
  ).slice(0, 4);

  return (
    <div className="border-line border py-14 text-center">
      <p className="font-display text-2xl">
        {q.q ? `По запросу «${q.q}» ничего не нашлось` : "Под эти условия ничего нет"}
      </p>
      <p className="text-ink-muted mx-auto mt-3 max-w-md text-sm leading-relaxed">
        {culprits.length > 0
          ? `Чаще всего мешает ${culprits[0]}. Снимите один фильтр — выдача обычно возвращается.`
          : "Попробуйте изменить условия поиска."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/catalog">Сбросить фильтры</ButtonLink>
        <ButtonLink href="/finder" variant="secondary">
          Подобрать по форме лица
        </ButtonLink>
      </div>

      {relaxed.length > 0 && (
        <div className="mt-12 text-left">
          <p className="eyebrow mb-6 text-center">Близкие модели</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-6 lg:grid-cols-4 lg:gap-x-6">
            {relaxed.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
