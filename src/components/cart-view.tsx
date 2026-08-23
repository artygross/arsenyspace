"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { Glasses } from "@/components/glasses";
import { ProductCard } from "@/components/product-card";
import { ButtonLink, Price, SectionHeading, TrustBlock } from "@/components/ui";
import { PRODUCTS, SHAPE_LABEL } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";

const FREE_SHIPPING_FROM = 15000;

export function CartView() {
  const { resolved, count, subtotal, savings, setQty, remove, ready } = useCart();

  if (!ready) {
    return (
      <div className="shell py-20">
        <div className="bg-surface-alt h-64 animate-pulse" />
      </div>
    );
  }

  if (resolved.length === 0) {
    const popular = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);
    return (
      <div className="shell py-14 lg:py-20">
        <h1 className="font-display text-4xl lg:text-5xl">Корзина пуста</h1>
        <p className="text-ink-muted mt-4 max-w-md leading-relaxed">
          Здесь появятся выбранные модели. Начните с популярного или подберите оправу
          под форму лица.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/catalog" size="l">
            В каталог
          </ButtonLink>
          <ButtonLink href="/finder" variant="secondary" size="l">
            Подобрать по форме лица
          </ButtonLink>
        </div>

        <div className="mt-20">
          <SectionHeading eyebrow="Выбирают чаще всего" title="Хиты каталога" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {popular.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const toFreeShipping = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const shipping = toFreeShipping > 0 ? 490 : 0;
  const inCart = new Set(resolved.map((l) => l.slug));
  const alsoLike = PRODUCTS.filter((p) => !inCart.has(p.slug) && p.isBestseller).slice(0, 4);

  return (
    <div className="shell py-8 lg:py-12">
      <h1 className="font-display text-4xl lg:text-5xl">Корзина</h1>
      <p className="text-ink-muted mt-2 text-sm">
        {count} {plural(count, "модель", "модели", "моделей")}
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
        <section>
          <ul className="divide-line divide-y border-line border-y">
            {resolved.map((line) => (
              <li key={`${line.slug}-${line.variantId}`} className="flex gap-4 py-5 sm:gap-6">
                <Link
                  href={`/product/${line.slug}`}
                  className="bg-surface-alt relative aspect-4/3 w-28 shrink-0 sm:w-36"
                >
                  <Glasses
                    shape={line.product.shape}
                    frameHex={line.variant.frameHex}
                    lensHex={line.variant.lensHex}
                    className="absolute inset-0 m-auto w-[82%]"
                    strokeWidth={6}
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] tracking-[0.14em] uppercase">{line.product.brand}</p>
                      <h2 className="font-display text-lg">
                        <Link href={`/product/${line.slug}`} className="hover:text-accent">
                          {line.product.model}
                        </Link>
                      </h2>
                      <p className="text-ink-muted mt-1 text-xs">
                        {SHAPE_LABEL[line.product.shape]} · {line.variant.frame} / линза{" "}
                        {line.variant.lens}
                      </p>
                      <p className="text-ink-muted mt-0.5 text-xs">
                        {line.product.dimensions.lens}□{line.product.dimensions.bridge}-
                        {line.product.dimensions.temple} мм
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.slug, line.variantId)}
                      aria-label={`Удалить ${line.product.model} из корзины`}
                      className="text-ink-muted hover:text-ink -mt-1 p-1 text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                    <QtyStepper
                      value={line.qty}
                      max={line.product.stockLeft}
                      onChange={(q) => setQty(line.slug, line.variantId, q)}
                    />
                    <Price value={line.product.price * line.qty} oldValue={line.product.oldPrice ? line.product.oldPrice * line.qty : undefined} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {alsoLike.length > 0 && (
            <div className="mt-14">
              <SectionHeading eyebrow="Вторая пара" title="Часто берут вместе" />
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
                {alsoLike.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="border-line border p-6">
            <h2 className="font-display text-xl">Итог</h2>

            <dl className="mt-5 space-y-2.5 text-sm">
              <Row label={`Товары (${count})`} value={formatPrice(subtotal)} />
              {savings > 0 && <Row label="Скидка" value={`−${formatPrice(savings)}`} accent />}
              <Row label="Доставка" value={shipping === 0 ? "Бесплатно" : formatPrice(shipping)} />
            </dl>

            {toFreeShipping > 0 && (
              <p className="bg-surface-alt mt-4 px-3 py-2.5 text-xs leading-relaxed">
                До бесплатной доставки {formatPrice(toFreeShipping)}
              </p>
            )}

            <div className="border-line mt-5 flex items-baseline justify-between border-t pt-5">
              <span className="font-medium">К оплате</span>
              <Price value={subtotal + shipping} size="l" />
            </div>

            <ButtonLink href="/checkout" size="l" className="mt-6 w-full">
              Оформить заказ
            </ButtonLink>
            <Link
              href="/catalog"
              className="text-ink-muted hover:text-ink mt-4 block text-center text-xs underline underline-offset-4"
            >
              Продолжить покупки
            </Link>
          </div>

          <div className="mt-6">
            <TrustBlock compact />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={accent ? "text-sale" : ""}>{value}</dd>
    </div>
  );
}

function QtyStepper({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (q: number) => void;
}) {
  return (
    <div className="border-line inline-flex items-center border">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        aria-label="Уменьшить количество"
        className="hover:bg-surface-alt size-9 text-lg leading-none"
      >
        −
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Увеличить количество"
        className="hover:bg-surface-alt size-9 text-lg leading-none disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
