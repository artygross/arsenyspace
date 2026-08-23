"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getProduct, type Product, type Variant } from "@/lib/catalog";

export type CartLine = { slug: string; variantId: string; qty: number };
export type ResolvedLine = CartLine & { product: Product; variant: Variant };

const STORAGE_KEY = "optika:cart:v1";
const EMPTY: CartLine[] = [];

/**
 * Корзина живёт во внешнем хранилище, а не в React-состоянии: так она переживает
 * навигацию, синхронизируется между вкладками и читается без эффекта на монтировании.
 */

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartLine[]) : EMPTY;
  } catch {
    // приватный режим или повреждённые данные — работаем с пустой корзиной
    return EMPTY;
  }
}

let lines: CartLine[] = typeof window === "undefined" ? EMPTY : readStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  lines = readStorage();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => lines;
const getServerSnapshot = () => EMPTY;

function write(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // хранилище недоступно — корзина живёт до перезагрузки вкладки
  }
  emit();
}

/* На сервере снимок пустой, на клиенте — настоящий. Флаг отличает
   «корзина пуста» от «гидратация ещё не прошла». */
const subscribeNever = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function useCart() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeNever, alwaysTrue, alwaysFalse);

  const add = useCallback((slug: string, variantId: string, qty = 1) => {
    const i = lines.findIndex((l) => l.slug === slug && l.variantId === variantId);
    if (i === -1) {
      write([...lines, { slug, variantId, qty }]);
      return;
    }
    const next = [...lines];
    next[i] = { ...next[i], qty: next[i].qty + qty };
    write(next);
  }, []);

  const setQty = useCallback((slug: string, variantId: string, qty: number) => {
    write(
      qty <= 0
        ? lines.filter((l) => !(l.slug === slug && l.variantId === variantId))
        : lines.map((l) => (l.slug === slug && l.variantId === variantId ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((slug: string, variantId: string) => {
    write(lines.filter((l) => !(l.slug === slug && l.variantId === variantId)));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return useMemo(() => {
    // Позиции с удалённым из каталога товаром просто отбрасываются
    const resolved: ResolvedLine[] = raw.flatMap((l) => {
      const product = getProduct(l.slug);
      const variant = product?.variants.find((v) => v.id === l.variantId) ?? product?.variants[0];
      return product && variant ? [{ ...l, product, variant }] : [];
    });

    return {
      lines: raw,
      resolved,
      ready,
      count: resolved.reduce((n, l) => n + l.qty, 0),
      subtotal: resolved.reduce((n, l) => n + l.product.price * l.qty, 0),
      savings: resolved.reduce(
        (n, l) => n + Math.max(0, (l.product.oldPrice ?? l.product.price) - l.product.price) * l.qty,
        0,
      ),
      add,
      setQty,
      remove,
      clear,
    };
  }, [raw, ready, add, setQty, remove, clear]);
}
