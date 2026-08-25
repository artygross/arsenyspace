"use client";

import { createStore } from "./store";

/** Сравнение сортов. Больше четырёх колонок таблица не выдерживает даже на десктопе. */
export const COMPARE_LIMIT = 4;

const store = createStore<string[]>("sg_compare_v1", []);

export const useCompare = store.useValue;

export function toggleCompare(slug: string) {
  const list = store.read();
  if (list.includes(slug)) {
    store.write(list.filter((s) => s !== slug));
    return;
  }
  store.write([...list, slug].slice(-COMPARE_LIMIT));
}

export function clearCompare() {
  store.write([]);
}

export function compareHref(slugs: string[]): string {
  return slugs.length ? `/compare?items=${slugs.join(",")}` : "/compare";
}
