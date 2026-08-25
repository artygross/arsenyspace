"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { toggleFavorite, useFavorites } from "@/lib/wishlist";
import type { Product } from "@/lib/catalog";
import { Button, buttonClass } from "./ui";
import { IconCheck, IconHeart } from "./icons";

/**
 * Правило поведения №2: добавление не уводит со страницы,
 * кнопка на 1.5 с превращается в «Добавлено ✓».
 */
export function AddToCartButton({
  product,
  qty = 1,
  size = "m",
  className = "",
}: {
  product: Product;
  qty?: number;
  size?: "s" | "m" | "l";
  className?: string;
}) {
  const [done, setDone] = useState(false);

  if (product.availability === "out_of_season") {
    return (
      <a href="#notify" className={buttonClass({ variant: "secondary", size, className })}>
        Сообщить о поступлении
      </a>
    );
  }

  const label = product.availability === "preorder" ? "В предзаказ" : "В корзину";

  return (
    <Button
      size={size}
      variant={done ? "soft" : "primary"}
      className={className}
      onClick={() => {
        addToCart(product.slug, qty);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? (
        <>
          <IconCheck className="size-4" /> Добавлено
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function FavoriteButton({ slug, className = "" }: { slug: string; className?: string }) {
  const favorites = useFavorites();
  const active = favorites.includes(slug);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      className={`bg-surface/90 border-line hover:border-leaf flex size-9 items-center justify-center rounded-full border transition-colors ${
        active ? "text-berry" : "text-ink-muted"
      } ${className}`}
    >
      <IconHeart filled={active} className="size-5" />
    </button>
  );
}
