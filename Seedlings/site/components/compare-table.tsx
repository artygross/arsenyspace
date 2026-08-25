"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PlantArt } from "./plant-art";
import { AddToCartButton } from "./add-to-cart";
import { EmptyState, Price } from "./ui";
import { IconClose } from "./icons";
import { clearCompare, compareHref, toggleCompare, useCompare } from "@/lib/compare";
import {
  AVAILABILITY_LABEL,
  CULTURE_BY_KEY,
  RIPENING_LABEL,
  getProduct,
  packLabel,
  plantingLabel,
  shipsLabel,
  type Product,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type Row = { label: string; value: (p: Product) => string; better?: "high" | "low" };

const ROWS: Row[] = [
  { label: "Культура", value: (p) => CULTURE_BY_KEY.get(p.culture)!.name },
  { label: "Тип", value: (p) => p.kind },
  { label: "Срок созревания", value: (p) => RIPENING_LABEL[p.ripening] },
  { label: "Зимостойкость", value: (p) => (p.hardiness < 0 ? `до ${p.hardiness} °C` : "теплолюбивая"), better: "low" },
  { label: "Урожайность", value: (p) => p.yieldPerBush },
  { label: "Размер плода", value: (p) => p.fruitSize },
  { label: "Высота растения", value: (p) => p.height },
  { label: "Свет", value: (p) => p.sun },
  { label: "Окно посадки", value: (p) => plantingLabel(p) },
  { label: "Фасовка", value: (p) => packLabel(p) },
  { label: "Цена за штуку", value: (p) => formatPrice(Math.round(p.price / p.packSize)) },
  { label: "Наличие", value: (p) => `${AVAILABILITY_LABEL[p.availability]} · ${shipsLabel(p).toLowerCase()}` },
  { label: "Оценка покупателей", value: (p) => `${p.rating.toFixed(1)} из 5` },
];

export function CompareTable() {
  const params = useSearchParams();
  const router = useRouter();
  const stored = useCompare();
  /** Ссылкой на сравнение делятся — состав из URL важнее сохранённого */
  const fromUrl = (params.get("items") ?? "").split(",").filter(Boolean);
  const openedByLink = fromUrl.length > 0;
  const slugs = openedByLink ? fromUrl : stored;

  /**
   * Когда состав пришёл ссылкой, правки должны менять адрес: иначе кнопка «Очистить»
   * молча ничего не делает — состав всё равно перечитывается из URL.
   */
  const remove = (slug: string) => {
    const next = slugs.filter((s) => s !== slug);
    if (openedByLink) router.replace(next.length ? compareHref(next) : "/compare", { scroll: false });
    else toggleCompare(slug);
  };

  const clearAll = () => {
    clearCompare();
    if (openedByLink) router.replace("/compare", { scroll: false });
  };
  const products = slugs.map((s) => getProduct(s)).filter((p) => p !== undefined);
  const [onlyDiff, setOnlyDiff] = useState(false);

  if (products.length === 0) {
    return (
      <div className="shell py-10">
        <h1 className="font-display mb-6 text-3xl font-bold">Сравнение сортов</h1>
        <EmptyState
          title="Сравнивать пока нечего"
          text="Нажмите «Сравнить» в карточке сорта — сюда попадут до четырёх сортов, и характеристики встанут рядом."
          action={{ href: "/catalog", label: "Перейти в каталог" }}
        />
      </div>
    );
  }

  const differs = (row: Row) => new Set(products.map((p) => row.value(p))).size > 1;
  const rows = onlyDiff && products.length > 1 ? ROWS.filter(differs) : ROWS;

  return (
    <div className="shell py-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold lg:text-4xl">Сравнение сортов</h1>
        <div className="flex flex-wrap items-center gap-4">
          {products.length > 1 && (
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-leaf size-4.5"
                checked={onlyDiff}
                onChange={() => setOnlyDiff((v) => !v)}
              />
              Только отличия
            </label>
          )}
          <button type="button" onClick={clearAll} className="text-ink-muted hover:text-berry text-sm underline underline-offset-4">
            Очистить сравнение
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-44 p-0" />
              {products.map((p) => (
                <th key={p.slug} className="border-line border-b p-3 text-left align-top">
                  <div className="card-surface relative p-3">
                    <button
                      type="button"
                      onClick={() => remove(p.slug)}
                      aria-label={`Убрать «${p.name}» из сравнения`}
                      className="text-ink-muted hover:text-berry absolute top-2 right-2"
                    >
                      <IconClose className="size-4" />
                    </button>
                    <div className="bg-leaf-soft rounded-xl">
                      <PlantArt product={p} className="h-28 w-full" decorative />
                    </div>
                    <p className="eyebrow mt-2">{CULTURE_BY_KEY.get(p.culture)!.name}</p>
                    <Link href={`/product/${p.slug}`} className="hover:text-leaf block font-medium">
                      {p.name}
                    </Link>
                    <div className="mt-2">
                      <Price value={p.price} oldValue={p.oldPrice} size="s" />
                    </div>
                    <AddToCartButton product={p} size="s" className="mt-3 w-full" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = products.map((p) => row.value(p));
              const highlight = products.length > 1 && new Set(values).size > 1;
              return (
                <tr key={row.label} className="border-line border-b">
                  <th scope="row" className="text-ink-muted py-3 pr-4 text-left align-top font-normal">
                    {row.label}
                  </th>
                  {products.map((p, i) => (
                    <td key={p.slug} className={`px-3 py-3 align-top ${highlight ? "font-medium" : ""}`}>
                      {values[i]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-ink-muted mt-4 text-sm">
        Отличающиеся строки выделены. Ссылкой на это сравнение можно поделиться — состав сортов
        зашит в адрес страницы.
      </p>
    </div>
  );
}
