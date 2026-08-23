"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { Glasses } from "@/components/glasses";
import { Badge, Button, Price, Rating, productBadges } from "@/components/ui";
import { useWishlist } from "@/components/wishlist";
import { LENS_LABEL, SHAPE_LABEL, brandSlug, type Product } from "@/lib/catalog";
import { plural } from "@/lib/format";

/** Галерея, выбор вариации и покупка — один блок, потому что все три завязаны на variant. */
export function ProductBuy({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeHelp, setSizeHelp] = useState(false);
  const { add } = useCart();
  const wishlist = useWishlist();
  const inWishlist = wishlist.has(product.slug);
  const variant = product.variants[active];
  const badges = productBadges(product);

  function handleAdd() {
    add(product.slug, variant.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 3200);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Галерея */}
      <div>
        <div className="bg-surface-alt relative aspect-4/3">
          {badges.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
              {badges.map((b) => (
                <Badge key={b.label} tone={b.tone}>
                  {b.label}
                </Badge>
              ))}
            </div>
          )}
          <Glasses
            shape={product.shape}
            frameHex={variant.frameHex}
            lensHex={variant.lensHex}
            className="absolute inset-0 m-auto w-[80%]"
            strokeWidth={4}
          />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {product.variants.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              aria-label={`${v.frame}, линза ${v.lens}`}
              className={`bg-surface-alt relative aspect-4/3 border transition-colors ${
                i === active ? "border-ink" : "border-transparent hover:border-line"
              }`}
            >
              <Glasses
                shape={product.shape}
                frameHex={v.frameHex}
                lensHex={v.lensHex}
                className="absolute inset-0 m-auto w-[78%]"
                strokeWidth={7}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Покупка */}
      <div>
        <p className="eyebrow">
          <Link href={`/brands/${brandSlug(product.brand)}`} className="hover:text-accent">
            {product.brand}
          </Link>
          {" · "}
          {product.collection}
        </p>
        <h1 className="font-display mt-2 text-4xl lg:text-5xl">{product.model}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Rating value={product.rating} count={product.reviewCount} href="#reviews" />
          <span className="text-ink-muted text-xs">
            {SHAPE_LABEL[product.shape]} · {product.lensTypes.map((l) => LENS_LABEL[l]).join(" · ")}
          </span>
        </div>

        <div className="mt-6">
          <Price value={product.price} oldValue={product.oldPrice} size="l" />
          <p className="text-ink-muted mt-1.5 text-xs">Цена за оправу с линзами, футляр в комплекте</p>
        </div>

        <p className="mt-6 leading-relaxed">{product.description}</p>

        {/* Вариации */}
        <div className="mt-8">
          <p className="text-sm font-medium">
            Цвет: <span className="text-ink-muted font-normal">{variant.frame} / линза {variant.lens}</span>
          </p>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {product.variants.map((v, i) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  aria-label={`${v.frame}, линза ${v.lens}`}
                  className={`relative block size-10 border transition-transform ${
                    i === active ? "border-ink scale-105" : "border-line hover:scale-105"
                  }`}
                >
                  <span className="absolute inset-1" style={{ background: v.frameHex }} />
                  <span className="absolute inset-1 left-1/2" style={{ background: v.lensHex }} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Размер */}
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">
              Размер: <span className="text-ink-muted font-normal">{product.size}</span>
            </p>
            <button
              type="button"
              onClick={() => setSizeHelp(true)}
              className="text-accent text-xs underline underline-offset-4"
            >
              Как измерить свою оправу
            </button>
          </div>
          <FrameSpec product={product} />
        </div>

        {/* Наличие и CTA */}
        <div className="mt-8">
          {product.inStock ? (
            <p className="text-success flex items-center gap-2 text-sm">
              <span className="bg-success inline-block size-1.5 rounded-full" />
              В наличии
              {product.stockLeft <= 4 && ` — осталось ${product.stockLeft} ${plural(product.stockLeft, "пара", "пары", "пар")}`}
            </p>
          ) : (
            <p className="text-ink-muted flex items-center gap-2 text-sm">
              <span className="bg-ink-muted inline-block size-1.5 rounded-full" />
              Нет в наличии — сообщим о поступлении
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="l" onClick={handleAdd} disabled={!product.inStock} className="flex-1 sm:flex-none sm:px-14">
              {product.inStock ? "В корзину" : "Нет в наличии"}
            </Button>
            <Button
              variant="secondary"
              size="l"
              onClick={() => wishlist.toggle(product.slug)}
              aria-pressed={inWishlist}
            >
              {inWishlist ? "В избранном ♥" : "В избранное"}
            </Button>
          </div>

          {/* Добавление не уводит со страницы — правило поведения №2 */}
          {added && (
            <div className="border-line bg-surface-alt mt-4 flex items-center justify-between gap-4 border px-4 py-3 text-sm" role="status">
              <span>{product.model} добавлены в корзину</span>
              <Link href="/cart" className="border-ink border-b pb-0.5 whitespace-nowrap hover:border-accent hover:text-accent">
                Перейти →
              </Link>
            </div>
          )}
        </div>
      </div>

      {sizeHelp && <SizeModal product={product} onClose={() => setSizeHelp(false)} />}
    </div>
  );
}

/** Схема 52□18-145 — ключевой элемент снятия сомнения о посадке. */
function FrameSpec({ product }: { product: Product }) {
  const { lens, bridge, temple } = product.dimensions;
  return (
    <div className="border-line mt-3 flex items-center gap-5 border px-4 py-3">
      <svg viewBox="0 0 124 46" className="h-11 w-30 shrink-0" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth={1.5}>
          <rect x="10" y="8" width="36" height="22" rx="4" />
          <rect x="60" y="8" width="36" height="22" rx="4" />
          <path d="M46 13h14M96 13h14" />
        </g>
        {/* Мерные линии повторяют порядок чисел справа: линза, переносица, заушник */}
        <g stroke="var(--color-accent)" strokeWidth={1}>
          <path d="M10 38h36M10 35v6M46 35v6" />
          <path d="M46 38h14M60 35v6" />
          <path d="M96 38h14M110 35v6" />
        </g>
      </svg>
      <dl className="grid flex-1 grid-cols-3 gap-2 text-center text-xs">
        <div>
          <dt className="text-ink-muted">Линза</dt>
          <dd className="mt-0.5 font-medium">{lens} мм</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Переносица</dt>
          <dd className="mt-0.5 font-medium">{bridge} мм</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Заушник</dt>
          <dd className="mt-0.5 font-medium">{temple} мм</dd>
        </div>
      </dl>
    </div>
  );
}

function SizeModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Как измерить оправу"
      onClick={onClose}
    >
      <div
        className="bg-surface max-h-[85vh] w-full max-w-lg overflow-y-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl">Как измерить свою оправу</h2>
          <button type="button" onClick={onClose} aria-label="Закрыть" className="-mt-1 -mr-2 p-2 text-xl leading-none">
            ×
          </button>
        </div>
        <ol className="mt-6 space-y-5 text-sm leading-relaxed">
          <li>
            <span className="text-accent mr-2 text-xs tracking-widest">01</span>
            Возьмите очки, которые вам хорошо сидят, и посмотрите на внутреннюю сторону заушника —
            там почти всегда напечатаны три числа вида <b>52□18-145</b>.
          </li>
          <li>
            <span className="text-accent mr-2 text-xs tracking-widest">02</span>
            Первое — ширина линзы, второе — переносица, третье — длина заушника. Все в миллиметрах.
          </li>
          <li>
            <span className="text-accent mr-2 text-xs tracking-widest">03</span>
            Если маркировки нет, измерьте линейкой ширину одной линзы в самом широком месте.
            Отклонение до 2 мм почти незаметно, больше 4 мм — оправа будет давить или сползать.
          </li>
        </ol>
        <div className="border-line mt-6 border-t pt-5">
          <p className="text-sm">
            У этой модели: <b>{product.dimensions.lens}□{product.dimensions.bridge}-{product.dimensions.temple}</b>{" "}
            <span className="text-ink-muted">(размер {product.size})</span>
          </p>
        </div>
        <Button className="mt-6 w-full" onClick={onClose}>
          Понятно
        </Button>
      </div>
    </div>
  );
}
