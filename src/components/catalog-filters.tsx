"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import { ShapeIcon } from "@/components/glasses";
import { Button } from "@/components/ui";
import { SORT_LABEL, type FrameShape, type Sort } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";

export type FacetOption = {
  value: string;
  label: string;
  count: number;
  hex?: string;
  shape?: FrameShape;
};

export type FacetGroup = {
  key: string;
  title: string;
  type: "check" | "color" | "shape" | "segment";
  options: FacetOption[];
  searchable?: boolean;
};

type Props = {
  groups: FacetGroup[];
  price: { min: number; max: number };
  total: number;
};

/* ---------- Работа с URL ---------- */

function useFacetUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const commit = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString();
      // scroll: false — фасет не должен выбрасывать пользователя в начало страницы
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const values = useCallback(
    (key: string) => (searchParams.get(key) ?? "").split(",").filter(Boolean),
    [searchParams],
  );

  const toggle = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      const cur = values(key);
      const after = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      if (after.length) next.set(key, after.join(","));
      else next.delete(key);
      commit(next);
    },
    [searchParams, values, commit],
  );

  const set = useCallback(
    (key: string, value: string | undefined) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      commit(next);
    },
    [searchParams, commit],
  );

  const reset = useCallback(() => {
    const next = new URLSearchParams();
    const sort = searchParams.get("sort");
    if (sort) next.set("sort", sort);
    commit(next);
  }, [searchParams, commit]);

  return { values, toggle, set, reset, searchParams };
}

/* ---------- Панель фильтров ---------- */

export function CatalogFilters({ groups, price, total }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop — липкая левая колонка */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
          <FilterBody groups={groups} price={price} />
        </div>
      </aside>

      {/* Mobile — кнопка + полноэкранная панель */}
      <Button
        variant="secondary"
        size="s"
        className="lg:hidden"
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        <FilterIcon />
        Фильтры
      </Button>

      {open && (
        <div className="bg-surface fixed inset-0 z-50 flex flex-col lg:hidden">
          <div className="shell border-line flex h-16 shrink-0 items-center justify-between border-b">
            <span className="font-display text-xl">Фильтры</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть фильтры" className="-mr-2 p-2">
              <CloseIcon />
            </button>
          </div>
          <div className="shell flex-1 overflow-y-auto py-4">
            <FilterBody groups={groups} price={price} />
          </div>
          <div className="shell border-line shrink-0 border-t py-4">
            <Button size="l" className="w-full" onClick={() => setOpen(false)}>
              Показать {total} {plural(total, "модель", "модели", "моделей")}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterBody({ groups, price }: { groups: FacetGroup[]; price: Props["price"] }) {
  return (
    <div className="divide-line divide-y">
      <PriceFilter price={price} />
      {groups.map((g) => (
        <FacetSection key={g.key} group={g} />
      ))}
      <StockFilter />
    </div>
  );
}

function FacetSection({ group }: { group: FacetGroup }) {
  const { values, toggle } = useFacetUrl();
  const [query, setQuery] = useState("");

  // Фасет применяется через URL, а это запрос к серверу. Без оптимистичного
  // состояния отметка появлялась бы только после ответа — правило «отклик за 100 мс».
  const [, startTransition] = useTransition();
  const [selected, applyOptimistic] = useOptimistic(values(group.key), (state: string[], value: string) =>
    state.includes(value) ? state.filter((v) => v !== value) : [...state, value],
  );

  const pick = (value: string) =>
    startTransition(() => {
      applyOptimistic(value);
      toggle(group.key, value);
    });

  const options = group.searchable && query
    ? group.options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : group.options;

  return (
    <details open className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        <span>
          {group.title}
          {selected.length > 0 && <span className="text-accent ml-2">{selected.length}</span>}
        </span>
        <ChevronIcon className="size-4 transition-transform group-open:rotate-180" />
      </summary>

      <div className="pt-4">
        {group.searchable && group.options.length > 8 && (
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти"
            aria-label={`Поиск: ${group.title}`}
            className="border-line mb-3 h-9 w-full border px-3 text-sm"
          />
        )}

        {group.type === "color" && (
          <ul className="flex flex-wrap gap-2">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  disabled={o.count === 0 && !selected.includes(o.value)}
                  onClick={() => pick(o.value)}
                  aria-pressed={selected.includes(o.value)}
                  title={`${o.label} — ${o.count}`}
                  className={`relative block size-8 border transition-transform disabled:opacity-25 ${
                    selected.includes(o.value) ? "border-ink scale-110" : "border-line hover:scale-105"
                  }`}
                >
                  <span className="absolute inset-1" style={{ background: o.hex }} />
                  <span className="sr-only">
                    {o.label}, {o.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {group.type === "shape" && (
          <ul className="grid grid-cols-2 gap-2">
            {options.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  disabled={o.count === 0 && !selected.includes(o.value)}
                  onClick={() => pick(o.value)}
                  aria-pressed={selected.includes(o.value)}
                  className={`w-full border px-1 py-2 text-[10px] leading-tight transition-colors disabled:opacity-25 ${
                    selected.includes(o.value)
                      ? "border-ink text-ink"
                      : "border-line text-ink-muted hover:border-ink hover:text-ink"
                  }`}
                >
                  <ShapeIcon shape={o.value as FrameShape} className="mx-auto h-7 w-full" />
                  <span className="mt-1.5 block leading-tight">{o.label}</span>
                  <span className="block opacity-50">{o.count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {group.type === "segment" && (
          <ul className="flex gap-2">
            {options.map((o) => (
              <li key={o.value} className="flex-1">
                <button
                  type="button"
                  disabled={o.count === 0 && !selected.includes(o.value)}
                  onClick={() => pick(o.value)}
                  aria-pressed={selected.includes(o.value)}
                  className={`w-full border py-2 text-xs transition-colors disabled:opacity-25 ${
                    selected.includes(o.value) ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {o.label}
                  <span className="ml-1 opacity-50">{o.count}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {group.type === "check" && (
          <ul className="max-h-64 space-y-2.5 overflow-y-auto">
            {options.map((o) => {
              const checked = selected.includes(o.value);
              const disabled = o.count === 0 && !checked;
              return (
                <li key={o.value}>
                  <label
                    className={`flex items-center gap-2.5 text-sm ${
                      disabled ? "text-ink-muted opacity-40" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => pick(o.value)}
                      className="accent-ink size-4"
                    />
                    <span className="flex-1">{o.label}</span>
                    <span className="text-ink-muted text-xs tabular-nums">{o.count}</span>
                  </label>
                </li>
              );
            })}
            {options.length === 0 && <li className="text-ink-muted text-xs">Ничего не найдено</li>}
          </ul>
        )}
      </div>
    </details>
  );
}

function PriceFilter({ price }: { price: Props["price"] }) {
  const { set, searchParams } = useFacetUrl();
  // URL — единственный источник правды. Поля неуправляемые, а key привязан к значению
  // из URL: кнопка «назад» перемонтирует их и вернёт прежние числа.
  const min = searchParams.get("priceMin") ?? "";
  const max = searchParams.get("priceMax") ?? "";

  return (
    <details open className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        Цена
        <ChevronIcon className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="pt-4">
        <div className="flex items-center gap-2">
          <input
            key={`min-${min}`}
            type="number"
            inputMode="numeric"
            defaultValue={min}
            min={price.min}
            max={price.max}
            onBlur={(e) => set("priceMin", e.target.value || undefined)}
            placeholder={String(price.min)}
            aria-label="Цена от"
            className="border-line h-9 w-full border px-2 text-sm"
          />
          <span className="text-ink-muted">—</span>
          <input
            key={`max-${max}`}
            type="number"
            inputMode="numeric"
            defaultValue={max}
            min={price.min}
            max={price.max}
            onBlur={(e) => set("priceMax", e.target.value || undefined)}
            placeholder={String(price.max)}
            aria-label="Цена до"
            className="border-line h-9 w-full border px-2 text-sm"
          />
        </div>
        <p className="text-ink-muted mt-2 text-xs">
          В каталоге от {formatPrice(price.min)} до {formatPrice(price.max)}
        </p>
      </div>
    </details>
  );
}

function StockFilter() {
  const { searchParams, set } = useFacetUrl();
  const [, startTransition] = useTransition();
  const [on, applyOptimistic] = useOptimistic(
    searchParams.get("inStock") === "1",
    (state: boolean) => !state,
  );

  return (
    <div className="py-5">
      <label className="flex cursor-pointer items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          checked={on}
          onChange={() =>
            startTransition(() => {
              applyOptimistic(undefined);
              set("inStock", on ? undefined : "1");
            })
          }
          className="accent-ink size-4"
        />
        Только в наличии
      </label>
    </div>
  );
}

/* ---------- Чипы активных фильтров ---------- */

export function ActiveChips({ groups }: { groups: FacetGroup[] }) {
  const { searchParams, toggle, set, reset } = useFacetUrl();

  const chips: { label: string; onRemove: () => void; key: string }[] = [];

  for (const g of groups) {
    for (const v of (searchParams.get(g.key) ?? "").split(",").filter(Boolean)) {
      const label = g.options.find((o) => o.value === v)?.label ?? v;
      chips.push({ key: `${g.key}:${v}`, label, onRemove: () => toggle(g.key, v) });
    }
  }
  const pMin = searchParams.get("priceMin");
  const pMax = searchParams.get("priceMax");
  if (pMin) chips.push({ key: "priceMin", label: `от ${formatPrice(Number(pMin))}`, onRemove: () => set("priceMin", undefined) });
  if (pMax) chips.push({ key: "priceMax", label: `до ${formatPrice(Number(pMax))}`, onRemove: () => set("priceMax", undefined) });
  if (searchParams.get("inStock") === "1")
    chips.push({ key: "inStock", label: "В наличии", onRemove: () => set("inStock", undefined) });
  if (searchParams.get("sale") === "1")
    chips.push({ key: "sale", label: "Со скидкой", onRemove: () => set("sale", undefined) });

  if (chips.length === 0) return null;

  return (
    <ul className="mb-6 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <li key={c.key}>
          <button
            type="button"
            onClick={c.onRemove}
            className="border-line hover:border-ink inline-flex items-center gap-2 border px-3 py-1.5 text-xs"
          >
            {c.label}
            <CloseIcon className="size-3" />
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={reset} className="text-ink-muted hover:text-ink px-2 text-xs underline underline-offset-4">
          Сбросить всё
        </button>
      </li>
    </ul>
  );
}

/* ---------- Сортировка ---------- */

export function SortSelect() {
  const { searchParams, set } = useFacetUrl();
  const value = (searchParams.get("sort") ?? "popular") as Sort;
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink-muted hidden sm:inline">Сортировка</span>
      <select
        value={value}
        onChange={(e) => set("sort", e.target.value === "popular" ? undefined : e.target.value)}
        className="border-line h-9 border bg-transparent px-2 text-sm"
      >
        {Object.entries(SORT_LABEL).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------- Иконки ---------- */

function ChevronIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
    </svg>
  );
}
