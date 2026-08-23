"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { FaceShape } from "@/lib/catalog";

export type UserReview = {
  id: string;
  slug: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  faceShape?: FaceShape;
  photos: string[];
};

const STORAGE_KEY = "optika:reviews:v1";
const EMPTY: UserReview[] = [];

/** Тот же внешний стор, что у корзины и сравнения. */

function readStorage(): UserReview[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as UserReview[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let reviews: UserReview[] = typeof window === "undefined" ? EMPTY : readStorage();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  reviews = readStorage();
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

const getSnapshot = () => reviews;
const getServerSnapshot = () => EMPTY;

function write(next: UserReview[]) {
  reviews = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // чаще всего это переполнение квоты из-за фотографий
  }
  emit();
}

const subscribeNever = () => () => {};
const alwaysTrue = () => true;
const alwaysFalse = () => false;

export function useReviews(slug?: string) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeNever, alwaysTrue, alwaysFalse);

  const add = useCallback((review: Omit<UserReview, "id" | "date">) => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const id = `${review.slug}-${now.getTime()}`;
    write([{ ...review, id, date }, ...reviews]);
  }, []);

  const remove = useCallback((id: string) => {
    write(reviews.filter((r) => r.id !== id));
  }, []);

  return useMemo(
    () => ({
      all,
      ready,
      forProduct: slug ? all.filter((r) => r.slug === slug) : EMPTY,
      add,
      remove,
    }),
    [all, ready, slug, add, remove],
  );
}

/**
 * Фото ужимаются в браузере до 320 px и JPEG 0.7 — иначе несколько снимков
 * с телефона переполнят квоту localStorage на первом же отзыве.
 */
export async function shrinkImage(file: File, maxSide = 320): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d-контекст недоступен");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.7);
}
