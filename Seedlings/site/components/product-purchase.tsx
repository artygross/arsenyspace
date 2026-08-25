"use client";

import { useState } from "react";
import {
  AVAILABILITY_LABEL,
  CONTAINER_LABEL,
  packLabel,
  shipsLabel,
  variantsOf,
  type Product,
} from "@/lib/catalog";
import { addToCart } from "@/lib/cart";
import { formatPrice, plural } from "@/lib/format";
import { FavoriteButton } from "./add-to-cart";
import { CompareToggle } from "./compare-toggle";
import { Button, Price } from "./ui";
import { IconCheck, IconMinus, IconPlus } from "./icons";

/** Блок покупки в карточке: фасовка → количество → корзина. docs/04-page-map.md */
export function ProductPurchase({ product }: { product: Product }) {
  const variants = variantsOf(product);
  const [variantId, setVariantId] = useState(variants[0].id);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const variant = variants.find((v) => v.id === variantId)!;
  const perUnit = Math.round(variant.price / variant.packSize);
  const disabled = product.availability === "out_of_season";

  return (
    <div className="card-surface p-5 lg:p-6">
      {variants.length > 1 && (
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-semibold">Фасовка</legend>
          <div className="grid gap-2">
            {variants.map((v) => (
              <label
                key={v.id}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors ${
                  v.id === variantId ? "border-leaf bg-leaf-soft/50" : "border-line hover:border-leaf/50"
                }`}
              >
                <input
                  type="radio"
                  name="variant"
                  className="accent-leaf size-4.5"
                  checked={v.id === variantId}
                  onChange={() => setVariantId(v.id)}
                />
                <span className="flex-1">
                  <span className="block text-sm font-medium">
                    {v.packSize > 1 ? `${v.packSize} шт. · ` : ""}
                    {CONTAINER_LABEL[v.container]}
                  </span>
                  <span className="text-ink-muted block text-xs">{v.hint}</span>
                </span>
                <span className="font-semibold">{formatPrice(v.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3" data-testid="pdp-price">
        <Price value={variant.price} oldValue={variant.oldPrice} size="l" />
        {variant.packSize > 1 && (
          <span className="text-ink-muted text-sm">{formatPrice(perUnit)} за штуку</span>
        )}
      </div>

      <p
        className={`mt-3 text-sm font-medium ${
          product.availability === "in_stock"
            ? "text-leaf"
            : product.availability === "preorder"
              ? "text-sun"
              : "text-ink-muted"
        }`}
      >
        {AVAILABILITY_LABEL[product.availability]} · {shipsLabel(product)}
      </p>
      {product.availability === "in_stock" && product.stockLeft <= 6 && (
        <p className="text-berry mt-1 text-sm">
          Осталось {product.stockLeft} {plural(product.stockLeft, "упаковка", "упаковки", "упаковок")} в партии
        </p>
      )}
      {product.availability === "preorder" && (
        <p className="text-ink-muted mt-1 text-sm">
          Предоплата 20 % фиксирует цену и место в партии. Остальное — при получении.
        </p>
      )}

      {!disabled && (
        <div className="mt-5 flex items-center gap-3">
          <div className="border-line flex items-center rounded-full border">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Уменьшить количество"
              className="hover:text-leaf flex size-11 items-center justify-center"
            >
              <IconMinus className="size-4" />
            </button>
            <span className="w-8 text-center font-medium tabular-nums" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Увеличить количество"
              className="hover:text-leaf flex size-11 items-center justify-center"
            >
              <IconPlus className="size-4" />
            </button>
          </div>

          <Button
            size="l"
            variant={done ? "soft" : "primary"}
            className="flex-1"
            onClick={() => {
              addToCart(variant.id, qty);
              setDone(true);
              setTimeout(() => setDone(false), 1500);
            }}
          >
            {done ? (
              <>
                <IconCheck className="size-5" /> Добавлено
              </>
            ) : product.availability === "preorder" ? (
              "Оформить предзаказ"
            ) : (
              "В корзину"
            )}
          </Button>

          <FavoriteButton slug={product.slug} className="size-11 shrink-0" />
        </div>
      )}

      {disabled && <NotifyForm product={product} />}

      <div className="border-line mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-ink-muted text-sm">
          {packLabel(product)} · вес {product.weight.toFixed(1)} кг
        </p>
        <CompareToggle slug={product.slug} />
      </div>
    </div>
  );
}

/** Товар вне сезона не исчезает из каталога — он собирает email-базу к сезону (решение D-06) */
export function NotifyForm({ product }: { product: Product }) {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <form
      id="notify"
      className="bg-sand/60 mt-5 scroll-mt-24 rounded-2xl p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      {sent ? (
        <p className="text-leaf-deep flex items-center gap-2 font-medium">
          <IconCheck className="size-5" /> Напишем, как только «{product.name}» вернётся в продажу.
        </p>
      ) : (
        <>
          <p className="font-medium">Сообщить, когда появится</p>
          <p className="text-ink-muted mt-1 text-sm">
            {shipsLabel(product)}. Оставьте почту — напишем в день открытия отгрузки.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="sr-only" htmlFor={`notify-${product.slug}`}>
              Электронная почта
            </label>
            <input
              id={`notify-${product.slug}`}
              type="email"
              required
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              className="field sm:max-w-64"
            />
            <Button type="submit">Сообщить</Button>
          </div>
        </>
      )}
    </form>
  );
}
