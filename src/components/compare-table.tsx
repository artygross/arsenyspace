"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { useCompare } from "@/components/compare";
import { Glasses } from "@/components/glasses";
import { ProductCard } from "@/components/product-card";
import { Button, ButtonLink, Price, Rating, SectionHeading } from "@/components/ui";
import {
  FACE_LABEL,
  GENDER_LABEL,
  LENS_LABEL,
  MATERIAL_LABEL,
  PRODUCTS,
  SHAPE_LABEL,
  type Product,
} from "@/lib/catalog";
import { COMPARE_LIMIT, compareHref } from "@/lib/compare-shared";
import { formatPrice, plural } from "@/lib/format";

type Row = { label: string; get: (p: Product) => string };

const ROWS: Row[] = [
  { label: "Бренд", get: (p) => p.brand },
  { label: "Коллекция", get: (p) => p.collection },
  { label: "Цена", get: (p) => formatPrice(p.price) },
  { label: "Рейтинг", get: (p) => `${p.rating.toFixed(1)} · ${p.reviewCount} отз.` },
  { label: "Форма оправы", get: (p) => SHAPE_LABEL[p.shape] },
  { label: "Материал", get: (p) => MATERIAL_LABEL[p.material] },
  { label: "Кому", get: (p) => GENDER_LABEL[p.gender] },
  { label: "Тип линзы", get: (p) => p.lensTypes.map((l) => LENS_LABEL[l]).join(", ") },
  { label: "Защита", get: (p) => `UV400 · кат. ${p.lensCategory}` },
  {
    label: "Размеры",
    get: (p) => `${p.dimensions.lens}□${p.dimensions.bridge}-${p.dimensions.temple} мм`,
  },
  { label: "Размер оправы", get: (p) => p.size },
  {
    label: "Подойдут лицу",
    get: (p) => p.faceShapes.map((f) => FACE_LABEL[f].toLowerCase()).join(", "),
  },
  {
    label: "Цвета",
    get: (p) =>
      `${p.variants.length} ${plural(p.variants.length, "вариант", "варианта", "вариантов")}`,
  },
  { label: "Наличие", get: (p) => (p.inStock ? `В наличии — ${p.stockLeft} шт.` : "Нет в наличии") },
];

export function CompareTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const compare = useCompare();
  const [onlyDiff, setOnlyDiff] = useState(false);

  const slugs = products.map((p) => p.slug);

  /** Правки идут и в URL (страница), и в стор (чекбоксы карточек, панель, счётчик в шапке). */
  function drop(slug: string) {
    compare.remove(slug);
    router.replace(compareHref(slugs.filter((s) => s !== slug)), { scroll: false });
  }

  function dropAll() {
    compare.clear();
    router.replace("/compare", { scroll: false });
  }

  // Строка различается, если хотя бы у одной модели значение своё
  const rows = ROWS.map((row) => {
    const values = products.map(row.get);
    return { ...row, values, differs: new Set(values).size > 1 };
  });
  const diffCount = rows.filter((r) => r.differs).length;
  const visible = onlyDiff ? rows.filter((r) => r.differs) : rows;

  const count = products.length;
  const canAddMore = count < COMPARE_LIMIT;
  const columns = `160px repeat(${count + (canAddMore ? 1 : 0)}, minmax(190px, 1fr))`;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl">Сравнение</h1>
          <p className="text-ink-muted mt-2 text-sm">
            {count} {plural(count, "модель", "модели", "моделей")} ·{" "}
            {count > 1
              ? `${diffCount} ${plural(diffCount, "различие", "различия", "различий")} из ${rows.length}`
              : "добавьте вторую модель, чтобы увидеть различия"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <label
            className={`flex items-center gap-2.5 text-sm ${count > 1 ? "cursor-pointer" : "text-ink-muted opacity-40"}`}
          >
            <input
              type="checkbox"
              checked={onlyDiff}
              disabled={count < 2}
              onChange={() => setOnlyDiff(!onlyDiff)}
              className="accent-ink size-4"
            />
            Только различия
          </label>
          <button
            type="button"
            onClick={dropAll}
            className="text-ink-muted hover:text-ink text-sm underline underline-offset-4"
          >
            Очистить всё
          </button>
        </div>
      </div>

      {/* Широкая таблица прокручивается внутри себя — страница по горизонтали не едет */}
      <div className="border-line overflow-x-auto border">
        <div style={{ gridTemplateColumns: columns }} className="grid min-w-fit">
          <div className="bg-surface border-line sticky left-0 z-10 border-r border-b" />
          {products.map((p) => (
            <ColumnHead key={p.slug} product={p} onRemove={() => drop(p.slug)} />
          ))}
          {canAddMore && (
            <div className="border-line border-b p-4">
              <Link
                href="/catalog"
                className="border-line text-ink-muted hover:border-ink hover:text-ink flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed py-10 text-xs"
              >
                <span className="text-2xl leading-none">+</span>
                Добавить модель
              </Link>
            </div>
          )}

          {visible.map((row) => (
            <RowCells key={row.label} row={row} canAddMore={canAddMore} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <p className="text-ink-muted text-xs">
          Отличающиеся значения выделены фоном. Совпадающие строки скрываются переключателем.
        </p>
        <p className="text-ink-muted text-xs">
          Ссылка на это сравнение содержит список моделей — ею можно поделиться.
        </p>
      </div>

      <Suggestions exclude={slugs} />
    </>
  );
}

function ColumnHead({ product, onRemove }: { product: Product; onRemove: () => void }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="border-line relative border-b border-l p-4">
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Убрать ${product.model} из сравнения`}
        className="text-ink-muted hover:text-ink absolute top-2 right-2 z-10 p-1 text-lg leading-none"
      >
        ×
      </button>

      <Link href={`/product/${product.slug}`} className="group block">
        <span className="bg-surface-alt relative block aspect-4/3">
          <Glasses
            shape={product.shape}
            frameHex={product.variants[0].frameHex}
            lensHex={product.variants[0].lensHex}
            className="absolute inset-0 m-auto w-[84%]"
            strokeWidth={6}
          />
        </span>
        <span className="mt-3 block text-[11px] tracking-[0.14em] uppercase">{product.brand}</span>
        <span className="font-display group-hover:text-accent mt-0.5 block text-lg">
          {product.model}
        </span>
      </Link>

      <div className="mt-2">
        <Rating value={product.rating} count={product.reviewCount} compact />
      </div>
      <div className="mt-2">
        <Price value={product.price} oldValue={product.oldPrice} size="s" />
      </div>

      <Button
        size="s"
        className="mt-3 w-full"
        disabled={!product.inStock}
        onClick={() => {
          add(product.slug, product.variants[0].id);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 2600);
        }}
      >
        {!product.inStock ? "Нет в наличии" : added ? "Добавлено ✓" : "В корзину"}
      </Button>
    </div>
  );
}

function RowCells({
  row,
  canAddMore,
}: {
  row: Row & { values: string[]; differs: boolean };
  canAddMore: boolean;
}) {
  return (
    <>
      <div
        className={`border-line sticky left-0 z-10 border-t border-r px-4 py-3 text-xs ${
          row.differs ? "bg-surface-alt text-ink" : "bg-surface text-ink-muted"
        }`}
      >
        {row.label}
      </div>
      {row.values.map((value, i) => (
        <div
          key={`${row.label}-${i}`}
          className={`border-line border-t border-l px-4 py-3 text-sm ${
            row.differs ? "bg-surface-alt font-medium" : ""
          }`}
        >
          {value}
        </div>
      ))}
      {canAddMore && (
        <div className={`border-line border-t border-l ${row.differs ? "bg-surface-alt" : ""}`} />
      )}
    </>
  );
}

function Suggestions({ exclude }: { exclude: string[] }) {
  const pool = PRODUCTS.filter((p) => !exclude.includes(p.slug) && p.isBestseller).slice(0, 4);
  if (pool.length === 0) return null;
  return (
    <section className="mt-20">
      <SectionHeading eyebrow="Тоже в шорт-листах" title="Добавить к сравнению" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
        {pool.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}

export function EmptyCompare() {
  const popular = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);
  return (
    <div className="shell py-14 lg:py-20">
      <h1 className="font-display text-4xl lg:text-5xl">Сравнивать пока нечего</h1>
      <p className="text-ink-muted mt-4 max-w-md leading-relaxed">
        Отметьте до {COMPARE_LIMIT} моделей значком сравнения на карточке — соберём таблицу
        и подсветим, чем они отличаются.
      </p>
      <ButtonLink href="/catalog" size="l" className="mt-8">
        В каталог
      </ButtonLink>

      <div className="mt-20">
        <SectionHeading eyebrow="С чего начать" title="Хиты каталога" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {popular.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
