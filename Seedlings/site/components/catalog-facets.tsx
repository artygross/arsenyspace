"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { CatalogResult, Sort } from "@/lib/query";
import { plural } from "@/lib/format";
import { Button, buttonClass } from "./ui";
import { IconClose, IconFilter } from "./icons";

type Facets = CatalogResult["facets"];

const SORTS: { value: Sort; label: string }[] = [
  { value: "popular", label: "По популярности" },
  { value: "price-asc", label: "Сначала дешевле" },
  { value: "price-desc", label: "Сначала дороже" },
  { value: "new", label: "Новинки" },
  { value: "ripening", label: "По сроку созревания" },
];

/** Общий помощник: правка одного параметра URL со сбросом пагинации */
function useParamWriter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  return (mutate: (sp: URLSearchParams) => void) => {
    const sp = new URLSearchParams(params.toString());
    mutate(sp);
    sp.delete("page");
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
}

function toggleInList(sp: URLSearchParams, key: string, value: string) {
  const current = (sp.get(key) ?? "").split(",").filter(Boolean);
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  if (next.length) sp.set(key, next.join(","));
  else sp.delete(key);
}

function FacetGroup({
  title,
  paramKey,
  options,
  single = false,
  onWrite,
  optimistic,
  mark,
}: {
  title: string;
  paramKey: string;
  options: Facets[keyof Facets];
  single?: boolean;
  onWrite: (mutate: (sp: URLSearchParams) => void) => void;
  optimistic: Record<string, boolean>;
  mark: (id: string, value: boolean) => void;
}) {
  if (options.length === 0) return null;
  return (
    <fieldset className="border-line border-t py-4 first:border-t-0">
      <legend className="mb-2 text-sm font-semibold">{title}</legend>
      <ul className="grid gap-1.5">
        {options.map((o) => {
          const id = `${paramKey}-${o.value}`;
          const checked = optimistic[id] ?? o.active;
          const disabled = o.count === 0 && !checked;
          return (
            <li key={o.value}>
              <label
                htmlFor={id}
                className={`flex cursor-pointer items-center gap-2.5 text-sm ${
                  disabled ? "text-ink-muted/50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  className="accent-leaf size-4.5 shrink-0"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => {
                    mark(id, !checked);
                    onWrite((sp) => {
                      if (single) {
                        if (checked) sp.delete(paramKey);
                        else sp.set(paramKey, o.value);
                      } else {
                        toggleInList(sp, paramKey, o.value);
                      }
                    });
                  }}
                />
                <span className="flex-1">{o.label}</span>
                <span className="text-ink-muted text-xs tabular-nums">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/**
 * Фасеты. Отметка применяется оптимистично (правило поведения №1):
 * фильтр идёт через URL, то есть через сервер, и без этого чекбокс «залипал» бы до ответа.
 */
export function FacetList({
  facets,
  cultureLocked,
  sale,
  onDone,
}: {
  facets: Facets;
  cultureLocked: boolean;
  sale: boolean;
  onDone?: () => void;
}) {
  const write = useParamWriter();
  const params = useSearchParams();
  /**
   * Оптимистичная отметка живёт вместе с той строкой запроса, на которой её поставили:
   * когда сервер отвечает и URL меняется, она отмирает сама — без setState в эффекте.
   */
  const signature = params.toString();
  const [pending, setPending] = useState<{ signature: string; marks: Record<string, boolean> }>({
    signature,
    marks: {},
  });
  const optimistic = pending.signature === signature ? pending.marks : {};

  const onWrite = (mutate: (sp: URLSearchParams) => void) => {
    write(mutate);
    onDone?.();
  };

  const mark = (id: string, value: boolean) =>
    setPending((p) => ({
      signature,
      marks: p.signature === signature ? { ...p.marks, [id]: value } : { [id]: value },
    }));

  return (
    <div>
      {!cultureLocked && (
        <FacetGroup
          title="Культура"
          paramKey="culture"
          options={facets.culture}
          onWrite={(m) => onWrite(m)}
          optimistic={optimistic}
          mark={mark}
        />
      )}
      <FacetGroup title="Наличие" paramKey="availability" options={facets.availability} onWrite={(m) => onWrite(m)} optimistic={optimistic} mark={mark} />
      <FacetGroup title="Тип" paramKey="kind" options={facets.kind} onWrite={(m) => onWrite(m)} optimistic={optimistic} mark={mark} />
      <FacetGroup title="Срок созревания" paramKey="ripening" options={facets.ripening} onWrite={(m) => onWrite(m)} optimistic={optimistic} mark={mark} />
      <FacetGroup title="Зимостойкость" paramKey="hardiness" options={facets.hardiness} single onWrite={(m) => onWrite(m)} optimistic={optimistic} mark={mark} />
      <FacetGroup title="Фасовка" paramKey="container" options={facets.container} onWrite={(m) => onWrite(m)} optimistic={optimistic} mark={mark} />

      <fieldset className="border-line border-t py-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            className="accent-leaf size-4.5"
            checked={optimistic["sale"] ?? sale}
            onChange={() => {
              mark("sale", !sale);
              onWrite((sp) => {
                if (sale) sp.delete("sale");
                else sp.set("sale", "1");
              });
            }}
          />
          Только со скидкой
        </label>
      </fieldset>

      <PriceRange onWrite={(m) => onWrite(m)} />
    </div>
  );
}

function PriceRange({ onWrite }: { onWrite: (mutate: (sp: URLSearchParams) => void) => void }) {
  const params = useSearchParams();
  const signature = params.toString();
  /** Черновик полей действителен только для текущего URL — после применения он сбрасывается сам */
  const [draft, setDraft] = useState<{ signature: string; min: string; max: string } | null>(null);
  const fresh = draft?.signature === signature ? draft : null;
  const min = fresh ? fresh.min : (params.get("priceMin") ?? "");
  const max = fresh ? fresh.max : (params.get("priceMax") ?? "");
  const setMin = (value: string) => setDraft({ signature, min: value, max });
  const setMax = (value: string) => setDraft({ signature, min, max: value });

  return (
    <form
      className="border-line border-t py-4"
      onSubmit={(e) => {
        e.preventDefault();
        onWrite((sp) => {
          if (min) sp.set("priceMin", min);
          else sp.delete("priceMin");
          if (max) sp.set("priceMax", max);
          else sp.delete("priceMax");
        });
      }}
    >
      <p className="mb-2 text-sm font-semibold">Цена, ₽</p>
      <div className="flex items-center gap-2">
        <input
          value={min}
          onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="от"
          aria-label="Цена от"
          className="field py-2"
        />
        <span className="text-ink-muted">—</span>
        <input
          value={max}
          onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          placeholder="до"
          aria-label="Цена до"
          className="field py-2"
        />
        <Button type="submit" size="s" variant="soft">
          ОК
        </Button>
      </div>
    </form>
  );
}

export function CatalogSidebar(props: { facets: Facets; cultureLocked: boolean; sale: boolean }) {
  return (
    <aside className="card-surface hidden self-start p-5 lg:block">
      <p className="font-display mb-2 text-lg font-bold">Фильтры</p>
      <FacetList {...props} />
    </aside>
  );
}

export function CatalogToolbar({
  total,
  facets,
  cultureLocked,
  sale,
  activeCount,
}: {
  total: number;
  facets: Facets;
  cultureLocked: boolean;
  sale: boolean;
  activeCount: number;
}) {
  const write = useParamWriter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mb-4 grid gap-3 lg:flex lg:items-center">
      <div className="flex items-center gap-3">
        <p className="text-ink-muted text-sm">
          {total} {plural(total, "сорт", "сорта", "сортов")}
        </p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${buttonClass({ variant: "secondary", size: "s" })} ml-auto lg:hidden`}
      >
        <IconFilter className="size-4" />
        Фильтры
        {activeCount > 0 && (
          <span className="bg-leaf rounded-full px-1.5 text-xs text-white">{activeCount}</span>
        )}
      </button>
      </div>

      <label className="ml-auto hidden items-center gap-2 text-sm lg:flex">
        <span className="text-ink-muted">Сортировка</span>
        <select
          className="field w-auto py-2"
          value={params.get("sort") ?? "popular"}
          onChange={(e) =>
            write((sp) => {
              if (e.target.value === "popular") sp.delete("sort");
              else sp.set("sort", e.target.value);
            })
          }
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <select
        className="field min-w-0 py-2 text-sm lg:hidden"
        aria-label="Сортировка"
        value={params.get("sort") ?? "popular"}
        onChange={(e) =>
          write((sp) => {
            if (e.target.value === "popular") sp.delete("sort");
            else sp.set("sort", e.target.value);
          })
        }
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[rgba(28,43,33,.35)] lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="bg-surface max-h-[85vh] overflow-y-auto rounded-t-[28px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="font-display text-lg font-bold">Фильтры</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть фильтры" className="flex size-9 items-center justify-center">
                <IconClose className="size-5" />
              </button>
            </div>
            <FacetList facets={facets} cultureLocked={cultureLocked} sale={sale} />
            <Button className="mt-4 w-full" size="l" onClick={() => setOpen(false)}>
              Показать {total} {plural(total, "сорт", "сорта", "сортов")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ActiveChips({ chips }: { chips: { key: string; label: string }[] }) {
  const write = useParamWriter();
  const pathname = usePathname();
  const router = useRouter();
  if (chips.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          className="bg-leaf-soft text-leaf-deep hover:bg-[#dcebd9] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
          onClick={() =>
            write((sp) => {
              const [key, value] = chip.key.split(":");
              if (value === undefined) sp.delete(key);
              else toggleInList(sp, key, value);
            })
          }
        >
          {chip.label}
          <IconClose className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        className="text-ink-muted hover:text-leaf px-2 text-sm underline underline-offset-4"
        onClick={() => router.push(pathname, { scroll: false })}
      >
        Сбросить всё
      </button>
    </div>
  );
}
