"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getProduct, type Product } from "@/lib/catalog";

const STORAGE_KEY = "optika:wishlist:v1";
const EMPTY: string[] = [];

/** Тот же внешний стор, что у корзины, сравнения и отзывов. */

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as string[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let slugs: string[] = typeof window === "undefined" ? EMPTY : readStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  slugs = readStorage();
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

const getSnapshot = () => slugs;
const getServerSnapshot = () => EMPTY;

function write(next: string[]) {
  slugs = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // хранилище недоступно — избранное живёт до перезагрузки вкладки
  }
  emit();
}

const subscribeNever = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function useWishlist() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeNever, alwaysTrue, alwaysFalse);

  const toggle = useCallback((slug: string) => {
    write(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [slug, ...slugs]);
  }, []);

  const remove = useCallback((slug: string) => {
    write(slugs.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return useMemo(() => {
    const products = raw.flatMap((slug) => {
      const p = getProduct(slug);
      return p ? [p] : [];
    });
    return {
      slugs: raw,
      products: products as Product[],
      ready,
      count: products.length,
      has: (slug: string) => raw.includes(slug),
      toggle,
      remove,
      clear,
    };
  }, [raw, ready, toggle, remove, clear]);
}
