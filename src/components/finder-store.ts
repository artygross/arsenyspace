"use client";

import { useSyncExternalStore } from "react";

export type FinderResult = { params: string; savedAt: string };

const STORAGE_KEY = "optika:finder:v1";

/** Результат подбора переживает сессию: в кабинете он становится ссылкой «мой подбор». */

function read(): FinderResult | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && "params" in parsed) return parsed as FinderResult;
    return null;
  } catch {
    return null;
  }
}

let value: FinderResult | null = typeof window === "undefined" ? null : read();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => value;
const getServerSnapshot = (): FinderResult | null => null;

export function saveFinderResult(params: string) {
  const now = new Date();
  const savedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  value = { params, savedAt };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // хранилище недоступно — подбор просто не запомнится
  }
  for (const listener of listeners) listener();
}

export function useFinderResult() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
