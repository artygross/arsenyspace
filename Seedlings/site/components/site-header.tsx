"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CULTURES, countByCulture, getProducts } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/collections";
import { useCartLines } from "@/lib/cart";
import { useFavorites } from "@/lib/wishlist";
import { COMPANY } from "@/lib/content";
import { plural } from "@/lib/format";
import { IconCart, IconClose, IconHeart, IconMenu, IconSearch, IconUser } from "./icons";
import { Logo } from "./logo";

const NAV = [
  { href: "/sale", label: "Акции" },
  { href: "/delivery", label: "Доставка" },
  { href: "/guarantee", label: "Оплата и гарантии" },
  { href: "/care", label: "Советы" },
  { href: "/about", label: "О питомнике" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const lines = useCartLines();
  const favorites = useFavorites();
  /**
   * Открытая панель хранится вместе с маршрутом, на котором её открыли:
   * навигация меняет pathname и панель закрывается сама, без setState в эффекте.
   */
  const [panel, setPanel] = useState<{ path: string; name: "menu" | "search" | "catalog" } | null>(null);
  const active = panel?.path === pathname ? panel.name : null;
  const menuOpen = active === "menu";
  const searchOpen = active === "search";
  const catalogOpen = active === "catalog";
  const open = (name: "menu" | "search" | "catalog") => setPanel({ path: pathname, name });
  const close = () => setPanel(null);
  const counts = countByCulture();
  const cartCount = lines.reduce((s, l) => s + l.qty, 0);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  return (
    <header className="bg-surface/95 border-line sticky top-0 z-40 border-b backdrop-blur no-print">
      <div className="shell flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
        <button
          type="button"
          className="text-ink -ml-1 flex size-11 items-center justify-center lg:hidden"
          onClick={() => open("menu")}
          aria-label="Открыть меню"
        >
          <IconMenu className="size-7" />
        </button>

        <Link href="/" className="flex items-center gap-2" aria-label={`${COMPANY.name} — на главную`}>
          <Logo className="h-11 w-auto lg:h-12" priority />
        </Link>

        <nav className="ml-4 hidden items-center gap-5 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => open("catalog")}
            onMouseLeave={close}
          >
            <button
              type="button"
              className="hover:text-leaf flex items-center gap-1.5 py-2 font-medium"
              onClick={() => (catalogOpen ? close() : open("catalog"))}
              aria-expanded={catalogOpen}
            >
              Каталог
            </button>
            {catalogOpen && (
              <div className="card-surface shadow-lift absolute top-full left-0 grid w-[760px] grid-cols-[1fr_260px] gap-4 p-3">
                <div>
                <ul className="grid grid-cols-2 gap-1">
                  {CULTURES.map((c) => (
                    <li key={c.key}>
                      <Link
                        href={`/catalog/${c.slug}`}
                        className="hover:bg-leaf-soft flex items-center justify-between rounded-xl px-3 py-2.5"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-ink-muted text-sm">{counts[c.key]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/catalog"
                  className="text-leaf hover:text-leaf-deep mt-2 block px-3 py-2 text-sm font-medium"
                >
                  Весь каталог — {getProducts().length} сортов →
                </Link>
                </div>

                <div className="bg-leaf-soft/50 rounded-2xl p-3">
                  <p className="eyebrow mb-2 px-1">Подборки</p>
                  <ul className="grid gap-0.5">
                    {COLLECTIONS.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/collection/${c.slug}`} className="hover:bg-surface block rounded-xl px-2 py-2 text-sm">
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-leaf text-sm">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="hover:text-leaf flex size-11 items-center justify-center"
            onClick={() => open("search")}
            aria-label="Поиск по каталогу"
          >
            <IconSearch className="size-6" />
          </button>
          <Link
            href="/favorites"
            className="hover:text-leaf relative flex size-11 items-center justify-center"
            aria-label={`Избранное, ${favorites.length} ${plural(favorites.length, "товар", "товара", "товаров")}`}
          >
            <IconHeart className="size-6" />
            {favorites.length > 0 && <Counter value={favorites.length} />}
          </Link>
          <Link
            href="/account"
            className="hover:text-leaf hidden size-11 items-center justify-center lg:flex"
            aria-label="Личный кабинет"
          >
            <IconUser className="size-6" />
          </Link>
          <Link
            href="/cart"
            className="hover:text-leaf relative flex size-11 items-center justify-center"
            aria-label={`Корзина, ${cartCount} ${plural(cartCount, "товар", "товара", "товаров")}`}
          >
            <IconCart className="size-6" />
            {cartCount > 0 && <Counter value={cartCount} />}
          </Link>
        </div>
      </div>

      {menuOpen && <MobileMenu onClose={close} counts={counts} />}
      {searchOpen && <SearchSheet onClose={close} />}
    </header>
  );
}

function Counter({ value }: { value: number }) {
  return (
    <span className="bg-leaf absolute top-1 right-0 min-w-5 rounded-full px-1 text-center text-xs leading-5 font-semibold text-white">
      {value}
    </span>
  );
}

function MobileMenu({ onClose, counts }: { onClose: () => void; counts: Record<string, number> }) {
  return (
    <div className="bg-cream fixed inset-0 z-50 flex flex-col lg:hidden">
      <div className="shell flex h-16 items-center justify-between">
        <Logo className="h-11 w-auto" />
        <button type="button" onClick={onClose} aria-label="Закрыть меню" className="flex size-10 items-center justify-center">
          <IconClose className="size-6" />
        </button>
      </div>
      <div className="shell flex-1 overflow-y-auto pb-10">
        <p className="eyebrow mt-2 mb-3">Каталог</p>
        <ul className="grid gap-2">
          {CULTURES.map((c) => (
            <li key={c.key}>
              <Link
                href={`/catalog/${c.slug}`}
                className="card-surface flex items-center justify-between px-4 py-3.5"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-ink-muted text-sm">{counts[c.key]}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="eyebrow mt-6 mb-3">Подборки</p>
        <ul className="grid gap-2">
          {COLLECTIONS.map((c) => (
            <li key={c.slug}>
              <Link href={`/collection/${c.slug}`} className="card-surface block px-4 py-3">
                <span className="font-medium">{c.title}</span>
                <span className="text-ink-muted mt-0.5 block text-sm">{c.promise}</span>
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid gap-1">
          {[{ href: "/catalog", label: "Весь каталог" }, ...NAV, { href: "/account", label: "Личный кабинет" }].map(
            (item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-3 text-lg">
                  {item.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

function SearchSheet({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const needle = value.trim().toLowerCase();
  const hints = needle
    ? getProducts()
        .filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.kind.toLowerCase().includes(needle) ||
            p.short.toLowerCase().includes(needle),
        )
        .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(28,43,33,.35)]" onClick={onClose}>
      <div className="bg-surface border-line border-b" onClick={(e) => e.stopPropagation()}>
        <div className="shell py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (needle) router.push(`/search?q=${encodeURIComponent(value.trim())}`);
              onClose();
            }}
            className="flex items-center gap-2"
          >
            <IconSearch className="text-ink-muted size-5 shrink-0" />
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Сорт, культура — например «ремонтантная малина»"
              aria-label="Поисковый запрос"
              className="field border-0 px-0 focus:outline-none"
            />
            <button type="button" onClick={onClose} aria-label="Закрыть поиск" className="flex size-9 items-center justify-center">
              <IconClose className="size-5" />
            </button>
          </form>

          {hints.length > 0 && (
            <ul className="mt-3 grid gap-1">
              {hints.map((p) => (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} className="hover:bg-leaf-soft flex items-baseline gap-2 rounded-xl px-3 py-2.5">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-ink-muted text-sm">{p.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {needle && hints.length === 0 && (
            <p className="text-ink-muted mt-4 px-1 text-sm">
              Ничего не нашли. Попробуйте «клубника», «ремонтантная», «жимолость».
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
