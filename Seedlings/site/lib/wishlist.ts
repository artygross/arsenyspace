"use client";

import { createStore } from "./store";

const store = createStore<string[]>("sg_fav_v1", []);

export const useFavorites = store.useValue;

export function toggleFavorite(slug: string) {
  const list = store.read();
  store.write(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
}

export function isFavorite(slug: string): boolean {
  return store.read().includes(slug);
}
