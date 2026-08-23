"use client";

import { usePathname } from "next/navigation";
import { useCompare } from "@/components/compare";
import { Glasses } from "@/components/glasses";
import { ButtonLink } from "@/components/ui";
import { COMPARE_LIMIT, compareHref } from "@/lib/compare-shared";
import { plural } from "@/lib/format";

/** Плавающая панель шорт-листа. На самой странице сравнения не нужна. */
export function CompareBar() {
  const pathname = usePathname();
  const { products, slugs, count, ready, remove, clear } = useCompare();

  if (!ready || count === 0 || pathname === "/compare") return null;

  const empties = COMPARE_LIMIT - count;

  return (
    <>
      {/* Панель фиксирована — распорка не даёт ей перекрыть низ страницы */}
      <div aria-hidden="true" className="h-20" />

      <div className="border-line bg-surface fixed inset-x-0 bottom-0 z-40 border-t shadow-[0_-2px_16px_rgba(0,0,0,0.06)]">
        {/*
          Правый нижний угол занимают виджеты чатов, куки-баннеры и бейджи хостинга
          (у Netlify — «Powered by Netlify» с z-index 2147483645). Держать там главную
          кнопку нельзя: на десктопе уводим её от края отступом, на мобильном меняем
          порядок местами, чтобы действие оказалось слева, а не под виджетом.
        */}
        <div className="shell flex items-center gap-4 py-3 max-sm:flex-row-reverse sm:pr-56">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-x-auto">
            {products.map((p) => (
              <div key={p.slug} className="relative shrink-0">
                <span className="bg-surface-alt relative block aspect-4/3 w-20 sm:w-24">
                  <Glasses
                    shape={p.shape}
                    frameHex={p.variants[0].frameHex}
                    lensHex={p.variants[0].lensHex}
                    className="absolute inset-0 m-auto w-[82%]"
                    strokeWidth={8}
                  />
                </span>
                <button
                  type="button"
                  onClick={() => remove(p.slug)}
                  aria-label={`Убрать ${p.model} из сравнения`}
                  className="bg-ink absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center text-xs leading-none text-white"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Пустые слоты показывают, сколько моделей ещё поместится */}
            {Array.from({ length: empties }, (_, i) => (
              <span
                key={`empty-${i}`}
                className="border-line text-ink-muted hidden aspect-4/3 w-20 shrink-0 items-center justify-center border border-dashed text-[10px] sm:flex sm:w-24"
              >
                ещё
              </span>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={clear}
              className="text-ink-muted hover:text-ink hidden text-xs underline underline-offset-4 sm:block"
            >
              Очистить
            </button>
            <ButtonLink href={compareHref(slugs)} size="m">
              Сравнить
              <span className="tabular-nums">{count}</span>
              <span className="hidden sm:inline">
                {plural(count, "модель", "модели", "моделей")}
              </span>
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
