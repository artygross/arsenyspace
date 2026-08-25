"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { formatPrice, plural } from "@/lib/format";
import type { Product } from "@/lib/catalog";
import { Button } from "./ui";
import { IconCheck } from "./icons";

/** Подборка покупается одной кнопкой — это и есть её смысл, иначе она просто витрина */
export function CollectionBuy({ products }: { products: Product[] }) {
  const [done, setDone] = useState(false);
  const available = products.filter((p) => p.availability !== "out_of_season");
  const total = available.reduce((s, p) => s + p.price, 0);
  const oldTotal = available.reduce((s, p) => s + (p.oldPrice ?? p.price), 0);

  return (
    <div className="bg-leaf-soft/60 flex flex-wrap items-center gap-4 rounded-[28px] p-5 lg:p-6">
      <div className="flex-1">
        <p className="font-display text-xl font-bold">
          Вся подборка — {formatPrice(total)}
          {oldTotal > total && (
            <span className="text-ink-muted ml-2 text-base font-normal line-through">
              {formatPrice(oldTotal)}
            </span>
          )}
        </p>
        <p className="text-ink-muted mt-1 text-sm">
          {available.length} {plural(available.length, "сорт", "сорта", "сортов")} по одной упаковке.
          Состав можно поправить в корзине.
        </p>
      </div>
      <Button
        size="l"
        variant={done ? "soft" : "primary"}
        onClick={() => {
          available.forEach((p) => addToCart(p.slug, 1));
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        }}
      >
        {done ? (
          <>
            <IconCheck className="size-5" /> Подборка в корзине
          </>
        ) : (
          "Взять всю подборку"
        )}
      </Button>
    </div>
  );
}
