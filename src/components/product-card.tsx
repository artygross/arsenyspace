"use client";

import Link from "next/link";
import { useState } from "react";
import { COMPARE_LIMIT, useCompare } from "@/components/compare";
import { Glasses } from "@/components/glasses";
import { Badge, Price, Rating, productBadges } from "@/components/ui";
import { useWishlist } from "@/components/wishlist";
import { SHAPE_LABEL, type Product } from "@/lib/catalog";

export function ProductCard({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [limitHit, setLimitHit] = useState(false);
  const compare = useCompare();
  const wishlist = useWishlist();
  const inCompare = compare.has(product.slug);
  const inWishlist = wishlist.has(product.slug);
  const variant = product.variants[active];
  const badges = productBadges(product);
  const extra = product.variants.length - 6;

  return (
    <article className="group relative flex flex-col">
      <div className="bg-surface-alt relative aspect-4/5 overflow-hidden">
        {badges.length > 0 && (
          <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.tone}>
                {b.label}
              </Badge>
            ))}
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/65">
            <span className="bg-ink px-4 py-2 text-xs tracking-widest text-white uppercase">
              Нет в наличии
            </span>
          </div>
        )}

        <Glasses
          shape={product.shape}
          frameHex={variant.frameHex}
          lensHex={variant.lensHex}
          className="absolute inset-0 m-auto w-[78%] transition-transform duration-500 group-hover:scale-105"
        />

        <Link href={`/product/${product.slug}`} className="absolute inset-0" aria-label={`${product.brand} ${product.model}`}>
          <span className="sr-only">Открыть карточку</span>
        </Link>

        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => wishlist.toggle(product.slug)}
          aria-pressed={inWishlist}
          title={inWishlist ? "Убрать из избранного" : "В избранное"}
          className={`flex size-8 items-center justify-center border transition-opacity ${
            inWishlist
              ? "border-ink bg-ink text-white opacity-100"
              : "border-line bg-surface text-ink-muted hover:border-ink hover:text-ink opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
          }`}
        >
          <HeartIcon filled={inWishlist} />
          <span className="sr-only">
            {inWishlist ? `Убрать ${product.model} из избранного` : `Добавить ${product.model} в избранное`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!compare.toggle(product.slug)) {
              setLimitHit(true);
              window.setTimeout(() => setLimitHit(false), 2600);
            }
          }}
          aria-pressed={inCompare}
          title={inCompare ? "Убрать из сравнения" : "Добавить к сравнению"}
          className={`flex size-8 items-center justify-center border transition-opacity ${
            inCompare
              ? "border-ink bg-ink text-white opacity-100"
              : "border-line bg-surface text-ink-muted hover:border-ink hover:text-ink opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
          }`}
        >
          <CompareIcon />
          <span className="sr-only">
            {inCompare ? `Убрать ${product.model} из сравнения` : `Добавить ${product.model} к сравнению`}
          </span>
        </button>
        </div>

        {limitHit && (
          <p
            role="status"
            className="bg-ink absolute inset-x-3 top-13 z-20 px-3 py-2 text-[11px] leading-snug text-white"
          >
            В сравнении уже {COMPARE_LIMIT} модели — уберите одну
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] tracking-[0.14em] uppercase">{product.brand}</p>
            <h3 className="font-display mt-0.5 truncate text-lg">
              <Link href={`/product/${product.slug}`} className="hover:text-accent">
                {product.model}
              </Link>
            </h3>
          </div>
          <Rating value={product.rating} count={product.reviewCount} compact />
        </div>

        <p className="text-ink-muted mt-1 text-xs">
          {SHAPE_LABEL[product.shape]} · {product.dimensions.lens}□{product.dimensions.bridge}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          {product.variants.slice(0, 6).map((v, i) => (
            <button
              key={v.id}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-label={`${v.frame}, линза ${v.lens}`}
              aria-pressed={i === active}
              className={`relative size-5 border transition-transform ${
                i === active ? "border-ink scale-110" : "border-line hover:scale-110"
              }`}
            >
              <span className="absolute inset-0.5" style={{ background: v.frameHex }} />
              <span
                className="absolute inset-0.5 left-1/2"
                style={{ background: v.lensHex, opacity: 0.9 }}
              />
            </button>
          ))}
          {extra > 0 && <span className="text-ink-muted text-xs">+{extra}</span>}
        </div>

        <div className="mt-auto pt-3">
          <Price value={product.price} oldValue={product.oldPrice} />
        </div>
      </div>
    </article>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        d="M12 20s-7-4.5-7-9.5A4 4 0 0112 8a4 4 0 017 2.5C19 15.5 12 20 12 20z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M5 20V9M12 20V4M19 20v-7" strokeLinecap="round" />
    </svg>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
