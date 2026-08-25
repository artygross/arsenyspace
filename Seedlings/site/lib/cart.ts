"use client";

import { createStore } from "./store";
import { resolveSku, type Product } from "./catalog";

export type CartLine = { slug: string; qty: number };

const store = createStore<CartLine[]>("sg_cart_v1", []);

export const useCartLines = store.useValue;

export function addToCart(slug: string, qty = 1) {
  const lines = store.read();
  const existing = lines.find((l) => l.slug === slug);
  store.write(
    existing
      ? lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
      : [...lines, { slug, qty }],
  );
}

export function setQty(slug: string, qty: number) {
  const next = qty <= 0
    ? store.read().filter((l) => l.slug !== slug)
    : store.read().map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, qty) } : l));
  store.write(next);
}

export function removeFromCart(slug: string) {
  store.write(store.read().filter((l) => l.slug !== slug));
}

export function clearCart() {
  store.write([]);
}

export function readCart(): CartLine[] {
  return store.read();
}

export type CartItem = { product: Product; qty: number };

export function hydrate(lines: CartLine[]): CartItem[] {
  return lines
    .map((l) => {
      const product = resolveSku(l.slug);
      return product ? { product, qty: l.qty } : null;
    })
    .filter((x): x is CartItem => x !== null);
}

export function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const oldSubtotal = items.reduce((s, i) => s + (i.product.oldPrice ?? i.product.price) * i.qty, 0);
  const weight = items.reduce((s, i) => s + i.product.weight * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const byCulture: Record<string, number> = {};
  const packs: Record<string, number> = {};
  for (const i of items) {
    byCulture[i.product.culture] = (byCulture[i.product.culture] ?? 0) + i.product.price * i.qty;
    packs[i.product.culture] = (packs[i.product.culture] ?? 0) + i.qty;
  }
  const hasPreorder = items.some((i) => i.product.availability === "preorder");
  return { subtotal, oldSubtotal, saving: oldSubtotal - subtotal, weight, count, byCulture, packs, hasPreorder };
}
