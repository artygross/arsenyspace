"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clearCompare, compareHref, toggleCompare, useCompare } from "@/lib/compare";
import { getProduct } from "@/lib/catalog";
import { plural } from "@/lib/format";
import { buttonClass } from "./ui";
import { IconClose } from "./icons";

/**
 * Полоса сравнения. Прижата к низу на всю ширину, а не кнопкой в правом нижнем углу:
 * там она перекрывает кнопку «В корзину» в последней карточке сетки.
 */
export function CompareBar() {
  const slugs = useCompare();
  const pathname = usePathname();
  const products = slugs.map((s) => getProduct(s)).filter((p) => p !== undefined);

  if (products.length === 0 || pathname === "/compare") return null;

  return (
    <div className="bg-surface border-line sticky bottom-0 z-30 border-t shadow-[0_-4px_16px_rgba(28,43,33,.06)] no-print">
      <div className="shell flex flex-wrap items-center gap-3 py-3">
        <p className="text-sm font-medium">
          Сравнение: {products.length} {plural(products.length, "сорт", "сорта", "сортов")}
        </p>

        <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
          {products.map((p) => (
            <li key={p.slug}>
              <span className="bg-leaf-soft text-leaf-deep inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm">
                {p.name}
                <button
                  type="button"
                  onClick={() => toggleCompare(p.slug)}
                  aria-label={`Убрать «${p.name}» из сравнения`}
                >
                  <IconClose className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>

        <button type="button" onClick={clearCompare} className="text-ink-muted hover:text-berry text-sm underline underline-offset-4">
          Очистить
        </button>
        <Link href={compareHref(slugs)} className={buttonClass({ size: "m" })}>
          Сравнить
        </Link>
      </div>
    </div>
  );
}
