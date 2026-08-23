"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getProduct, type Product } from "@/lib/catalog";
import { COMPARE_LIMIT } from "@/lib/compare-shared";

const STORAGE_KEY = "optika:compare:v1";
const EMPTY: string[] = [];

export { COMPARE_LIMIT };

/**
 * Тот же внешний стор, что и у корзины: переживает навигацию, синхронизируется
 * между вкладками и читается без эффекта на монтировании.
 */

function readStorage(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, COMPARE_LIMIT) : EMPTY;
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
    // хранилище недоступно — список живёт до перезагрузки вкладки
  }
  emit();
}

const subscribeNever = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function useCompare() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeNever, alwaysTrue, alwaysFalse);

  /** Возвращает false, если добавить не удалось — список уже полон. */
  const toggle = useCallback((slug: string): boolean => {
    if (slugs.includes(slug)) {
      write(slugs.filter((s) => s !== slug));
      return true;
    }
    if (slugs.length >= COMPARE_LIMIT) return false;
    write([...slugs, slug]);
    return true;
  }, []);

  const remove = useCallback((slug: string) => {
    write(slugs.filter((s) => s !== slug));
  }, []);

  const clear = useCallback(() => write(EMPTY), []);

  return useMemo(() => {
    const products = raw.flatMap((slug) => {
      const product = getProduct(slug);
      return product ? [product] : [];
    });
    return {
      slugs: raw,
      products: products as Product[],
      ready,
      count: products.length,
      isFull: products.length >= COMPARE_LIMIT,
      has: (slug: string) => raw.includes(slug),
      toggle,
      remove,
      clear,
    };
  }, [raw, ready, toggle, remove, clear]);
}
