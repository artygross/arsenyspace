"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Glasses, ShapeIcon } from "@/components/glasses";
import { BRANDS, POPULAR_QUERIES, brandSlug, suggest, type Suggestion } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

const RECENT_KEY = "optika:recent-searches:v1";
const RECENT_LIMIT = 5;

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function pushRecent(query: string) {
  try {
    const next = [query, ...readRecent().filter((q) => q !== query)].slice(0, RECENT_LIMIT);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // хранилище недоступно — история просто не ведётся
  }
}

export function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(-1);
  // Оверлей монтируется только по клику, поэтому localStorage читается без риска
  // расхождения с серверной разметкой.
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  const suggestions = useMemo(() => suggest(value), [value]);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function submit(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    setRecent(readRecent());
    go(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (c + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => (c <= 0 ? suggestions.length - 1 : c - 1));
    } else if (event.key === "Enter" && cursor >= 0) {
      event.preventDefault();
      go(suggestions[cursor].href);
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 bg-black/30"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по каталогу"
      onClick={onClose}
    >
      <div className="bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="shell flex h-16 items-center gap-4 lg:h-20">
          <SearchIcon />
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
          >
            <input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setCursor(-1);
              }}
              onKeyDown={onKeyDown}
              placeholder="Бренд, форма оправы или тип линзы"
              aria-label="Поисковый запрос"
              aria-autocomplete="list"
              className="font-display placeholder:text-ink-muted w-full bg-transparent text-xl outline-none lg:text-2xl"
            />
          </form>
          <button type="button" onClick={onClose} aria-label="Закрыть поиск" className="-mr-2 p-2">
            <CloseIcon />
          </button>
        </div>

        <div className="border-line border-t">
          <div className="shell max-h-[70vh] overflow-y-auto py-6">
            {value.trim() ? (
              <Results
                suggestions={suggestions}
                cursor={cursor}
                query={value}
                onPick={go}
                onSubmit={() => submit(value)}
              />
            ) : (
              <Idle recent={recent} onPick={submit} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Results({
  suggestions,
  cursor,
  query,
  onPick,
  onSubmit,
}: {
  suggestions: Suggestion[];
  cursor: number;
  query: string;
  onPick: (href: string) => void;
  onSubmit: () => void;
}) {
  if (suggestions.length === 0) {
    return (
      <div className="py-8">
        <p className="text-sm">
          По запросу «{query}» ничего не нашлось.
        </p>
        <p className="text-ink-muted mt-2 text-sm">
          Попробуйте название бренда, форму оправы или тип линзы — например, «титан».
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-line divide-y">
        {suggestions.map((s, i) => (
          <li key={`${s.kind}-${s.label}`}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(s.href)}
              className={`flex w-full items-center gap-4 px-2 py-3 text-left transition-colors ${
                i === cursor ? "bg-surface-alt" : "hover:bg-surface-alt"
              }`}
            >
              <span className="bg-surface-alt relative flex aspect-4/3 w-16 shrink-0 items-center justify-center">
                {s.kind === "product" ? (
                  <Glasses
                    shape={s.product.shape}
                    frameHex={s.product.variants[0].frameHex}
                    lensHex={s.product.variants[0].lensHex}
                    className="absolute inset-0 m-auto w-[84%]"
                    strokeWidth={8}
                  />
                ) : s.kind === "shape" ? (
                  <ShapeIcon shape={s.shape} className="text-ink-muted h-5 w-[70%]" />
                ) : (
                  <span className="font-display text-sm">{s.label.slice(0, 1)}</span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{s.label}</span>
                <span className="text-ink-muted mt-0.5 block text-xs">
                  {s.kind === "brand" ? "Бренд" : s.kind === "shape" ? "Форма оправы" : s.note}
                  {s.kind !== "product" && ` · ${s.note}`}
                </span>
              </span>

              {s.kind === "product" && (
                <span className="text-sm whitespace-nowrap">{formatPrice(s.product.price)}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSubmit}
        className="border-ink mt-6 border-b pb-1 text-sm hover:border-accent hover:text-accent"
      >
        Все результаты по запросу «{query}» →
      </button>
    </>
  );
}

function Idle({ recent, onPick }: { recent: string[]; onPick: (q: string) => void }) {
  return (
    <div className="grid gap-10 sm:grid-cols-3">
      {recent.length > 0 && (
        <div>
          <p className="eyebrow mb-4">Вы искали</p>
          <ul className="space-y-2.5 text-sm">
            {recent.map((q) => (
              <li key={q}>
                <button type="button" onClick={() => onPick(q)} className="hover:text-accent">
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="eyebrow mb-4">Часто ищут</p>
        <ul className="flex flex-wrap gap-2">
          {POPULAR_QUERIES.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => onPick(q)}
                className="border-line hover:border-ink border px-3 py-1.5 text-xs"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="eyebrow mb-4">Бренды</p>
        <ul className="space-y-2.5 text-sm">
          {BRANDS.slice(0, 6).map((b) => (
            <li key={b}>
              <Link href={`/brands/${brandSlug(b)}`} className="hover:text-accent">
                {b}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="text-ink-muted size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </svg>
  );
}
