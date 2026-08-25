"use client";

/**
 * Минимальное хранилище поверх localStorage: состояние живёт вне React,
 * переживает навигацию и синхронизируется между вкладками (решение D-09).
 */
import { useSyncExternalStore } from "react";

export function createStore<T>(key: string, fallback: T, area: "local" | "session" = "local") {
  let cache: T | null = null;
  const listeners = new Set<() => void>();
  const storage = () => (area === "session" ? window.sessionStorage : window.localStorage);

  function read(): T {
    if (cache !== null) return cache;
    if (typeof window === "undefined") return fallback;
    try {
      const raw = storage().getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache as T;
  }

  function write(next: T) {
    cache = next;
    try {
      storage().setItem(key, JSON.stringify(next));
    } catch {
      /* приватный режим или переполнение — состояние остаётся в памяти вкладки */
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        cache = null;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useValue(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { read, write, subscribe, useValue };
}
