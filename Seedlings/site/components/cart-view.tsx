"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "./product-image";
import { ProductGrid } from "./product-card";
import { Button, ButtonLink, EmptyState, Price, SectionHeading, TrustBlock } from "./ui";
import { IconMinus, IconPlus, IconTrash } from "./icons";
import { PromoField } from "./promo-field";
import { alsoBuy, baseSlug, packLabel, CULTURE_BY_KEY } from "@/lib/catalog";
import { cartTotals, hydrate, removeFromCart, setQty, useCartLines } from "@/lib/cart";
import { FREE_FROM, PICKUP, quoteDelivery } from "@/lib/delivery";
import { formatPrice, plural } from "@/lib/format";
import type { PromoResult } from "@/lib/promo";

export function CartView() {
  const lines = useCartLines();
  const items = hydrate(lines);
  const totals = cartTotals(items);
  const [promo, setPromo] = useState<PromoResult | null>(null);

  if (items.length === 0) {
    return (
      <div className="shell py-10">
        <h1 className="font-display mb-6 text-3xl font-bold">Корзина</h1>
        <EmptyState
          title="В корзине пока пусто"
          text="Начните с сезонной подборки: показываем только то, что сейчас в окне посадки и есть на складе."
          action={{ href: "/catalog", label: "Перейти в каталог" }}
        />
      </div>
    );
  }

  const discount = promo?.ok ? promo.discount : 0;
  const quote = quoteDelivery({
    fulfilment: "delivery",
    zone: "city",
    weight: totals.weight,
    subtotal: totals.subtotal - discount,
    freeShipping: promo?.ok ? promo.freeShipping : false,
  });
  const total = totals.subtotal - discount + quote.cost;

  return (
    <div className="shell py-8 lg:py-10">
      <h1 className="font-display mb-6 text-3xl font-bold lg:text-4xl">
        Корзина{" "}
        <span className="text-ink-muted font-sans text-lg font-normal">
          {totals.count} {plural(totals.count, "товар", "товара", "товаров")}
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <ul className="grid gap-3">
          {items.map(({ product, qty }) => (
            <li key={product.slug} className="card-surface flex gap-3 p-3 sm:gap-4 sm:p-4">
              <Link href={`/product/${baseSlug(product.slug)}`} className="bg-leaf-soft shrink-0 rounded-2xl">
                <ProductImage product={product} className="size-24 sm:size-28 rounded-2xl" sizes="112px" decorative />
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="eyebrow">{CULTURE_BY_KEY.get(product.culture)!.name}</p>
                    <h2 className="font-medium">
                      <Link href={`/product/${baseSlug(product.slug)}`} className="hover:text-leaf">
                        {product.name}
                      </Link>
                    </h2>
                    <p className="text-ink-muted mt-0.5 text-sm">{packLabel(product)}</p>
                    {product.availability === "preorder" && (
                      <p className="text-sun mt-1 text-sm">Предзаказ · отгрузка с 5 сентября</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.slug)}
                    aria-label={`Удалить «${product.name}» из корзины`}
                    className="text-ink-muted hover:text-berry flex size-9 shrink-0 items-center justify-center"
                  >
                    <IconTrash className="size-5" />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                  <div className="border-line flex items-center rounded-full border">
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty - 1)}
                      aria-label="Уменьшить количество"
                      className="hover:text-leaf flex size-9 items-center justify-center"
                    >
                      <IconMinus className="size-4" />
                    </button>
                    <span className="w-7 text-center text-sm font-medium tabular-nums">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty + 1)}
                      aria-label="Увеличить количество"
                      className="hover:text-leaf flex size-9 items-center justify-center"
                    >
                      <IconPlus className="size-4" />
                    </button>
                  </div>
                  <Price value={product.price * qty} oldValue={product.oldPrice ? product.oldPrice * qty : undefined} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-5">
            <PromoField
              subtotal={totals.subtotal}
              byCulture={totals.byCulture}
              packs={totals.packs}
              fulfilment="delivery"
              onChange={setPromo}
            />

            <dl className="mt-5 grid gap-2.5 text-sm">
              <Row label={`Товары, ${totals.count} шт.`} value={formatPrice(totals.subtotal)} />
              {totals.saving > 0 && (
                <Row label="Скидка на распродаже" value={`−${formatPrice(totals.saving)}`} tone="berry" />
              )}
              {discount > 0 && promo?.ok && (
                <Row label={`Промокод ${promo.code}`} value={`−${formatPrice(discount)}`} tone="berry" />
              )}
              <Row
                label="Доставка по городу"
                value={quote.free ? "бесплатно" : formatPrice(quote.cost)}
                tone={quote.free ? "leaf" : undefined}
              />
            </dl>

            {!quote.free && quote.toFree > 0 && (
              <p className="bg-leaf-soft text-leaf-deep mt-3 rounded-xl px-3 py-2 text-sm">
                До бесплатной доставки не хватает {formatPrice(quote.toFree)}
              </p>
            )}

            <div className="border-line mt-4 flex items-baseline justify-between border-t pt-4">
              <span className="font-medium">Итого</span>
              <Price value={total} size="l" />
            </div>

            <ButtonLink href="/checkout" size="l" className="mt-4 w-full">
              Оформить заказ
            </ButtonLink>
            <p className="text-ink-muted mt-3 text-center text-xs">
              Способ получения и точную стоимость доставки выберете на следующем шаге.
              Самовывоз — 0 ₽, {PICKUP.hours.toLowerCase()}.
            </p>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => items.forEach((i) => removeFromCart(i.product.slug))}
            >
              Очистить корзину
            </Button>
          </div>

          <div className="mt-4">
            <TrustBlock compact />
          </div>
        </aside>
      </div>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Добавить к заказу"
          title="С этим часто берут"
          text={`Доставка бесплатна от ${formatPrice(FREE_FROM)} — добор до порога обычно выгоднее, чем оплата доставки.`}
        />
        <ProductGrid products={alsoBuy(items[0].product, 4)} />
      </section>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "berry" | "leaf" }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={tone === "berry" ? "text-berry font-medium" : tone === "leaf" ? "text-leaf font-medium" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
