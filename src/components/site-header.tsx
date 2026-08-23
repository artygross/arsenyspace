"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart";
import { useCompare } from "@/components/compare";
import { useWishlist } from "@/components/wishlist";
import { ShapeIcon } from "@/components/glasses";
import { SearchOverlay } from "@/components/search-overlay";
import { BRANDS, GENDER_LABEL, SHAPE_LABEL, SHAPES, brandSlug, type FrameShape } from "@/lib/catalog";
import { compareHref } from "@/lib/compare-shared";

const GENDERS = ["women", "men", "unisex"] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const compare = useCompare();
  const wishlist = useWishlist();
  const [menu, setMenu] = useState<"catalog" | "brands" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Навигация закрывает любое открытое меню. Правка состояния во время рендера,
  // а не в эффекте: React отбросит этот кадр и отрисует уже закрытое меню.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenu(null);
    setMobileOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`bg-surface sticky top-0 z-50 transition-shadow ${scrolled ? "border-line border-b" : ""}`}
      onMouseLeave={() => setMenu(null)}
    >
      <div className="shell flex h-16 items-center gap-4 lg:h-20">
        <button
          type="button"
          className="-ml-2 p-2 lg:hidden"
          aria-label="Открыть меню"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <Burger />
        </button>

        <Link href="/" className="font-display mr-2 text-xl tracking-tight lg:text-2xl">
          О́птика<span className="text-accent">.</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm lg:flex">
          <button
            type="button"
            className={`py-2 ${menu === "catalog" ? "text-accent" : "hover:text-accent"}`}
            onMouseEnter={() => setMenu("catalog")}
            onClick={() => setMenu(menu === "catalog" ? null : "catalog")}
            aria-expanded={menu === "catalog"}
          >
            Каталог
          </button>
          <button
            type="button"
            className={`py-2 ${menu === "brands" ? "text-accent" : "hover:text-accent"}`}
            onMouseEnter={() => setMenu("brands")}
            onClick={() => setMenu(menu === "brands" ? null : "brands")}
            aria-expanded={menu === "brands"}
          >
            Бренды
          </button>
          <Link href="/catalog?sort=new" className="py-2 hover:text-accent" onMouseEnter={() => setMenu(null)}>
            Новинки
          </Link>
          <Link href="/catalog?sale=1" className="text-sale py-2 hover:opacity-70" onMouseEnter={() => setMenu(null)}>
            Sale
          </Link>
          <Link href="/finder" className="py-2 hover:text-accent" onMouseEnter={() => setMenu(null)}>
            Подбор
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Поиск"
            title="Поиск (Ctrl+K)"
            className="hover:text-accent p-2"
          >
            <SearchIcon />
          </button>
          <IconLink
            href="/account/wishlist"
            label="Избранное"
            badge={wishlist.ready ? wishlist.count : 0}
          >
            <HeartIcon />
          </IconLink>
          <IconLink href={compareHref(compare.slugs)} label="Сравнение" badge={compare.ready ? compare.count : 0}>
            <CompareIcon />
          </IconLink>
          <IconLink href="/cart" label="Корзина" badge={ready ? count : 0}>
            <BagIcon />
          </IconLink>
          <IconLink href="/account" label="Личный кабинет">
            <UserIcon />
          </IconLink>
        </div>
      </div>

      {menu && (
        <div
          className="border-line bg-surface absolute inset-x-0 top-full hidden border-t lg:block"
          onMouseEnter={() => setMenu(menu)}
        >
          <div className="shell grid grid-cols-12 gap-8 py-10">
            {menu === "catalog" ? <CatalogMenu /> : <BrandsMenu />}
          </div>
        </div>
      )}

      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} onSearch={() => setSearchOpen(true)} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

function CatalogMenu() {
  return (
    <>
      <div className="col-span-3">
        <p className="eyebrow mb-4">Кому</p>
        <ul className="space-y-2.5 text-sm">
          {GENDERS.map((g) => (
            <li key={g}>
              <Link href={`/catalog?gender=${g}`} className="hover:text-accent">
                {GENDER_LABEL[g]}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <Link href="/catalog" className="border-ink border-b pb-0.5 hover:border-accent hover:text-accent">
              Весь каталог
            </Link>
          </li>
        </ul>
      </div>
      <div className="col-span-6">
        <p className="eyebrow mb-4">Форма оправы</p>
        <ul className="grid grid-cols-4 gap-x-4 gap-y-5">
          {SHAPES.map((s) => (
            <li key={s}>
              <Link href={`/catalog?shape=${s}`} className="group block text-center">
                <ShapeIcon
                  shape={s as FrameShape}
                  className="text-ink-muted group-hover:text-accent mx-auto h-8 w-full transition-colors"
                />
                <span className="mt-2 block text-xs group-hover:text-accent">{SHAPE_LABEL[s]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-3">
        <Link href="/finder" className="group block">
          <div className="bg-surface-alt flex aspect-4/3 items-end p-5">
            <div>
              <p className="eyebrow">Не знаете, что искать</p>
              <p className="font-display mt-1 text-xl leading-snug">
                Подбор по форме лица
              </p>
              <span className="border-ink mt-3 inline-block border-b pb-0.5 text-xs group-hover:border-accent group-hover:text-accent">
                Пройти за минуту
              </span>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}

function BrandsMenu() {
  return (
    <>
      <div className="col-span-9">
        <p className="eyebrow mb-4">Все бренды</p>
        <ul className="grid grid-cols-4 gap-x-6 gap-y-3 text-sm">
          {BRANDS.map((b) => (
            <li key={b}>
              <Link href={`/brands/${brandSlug(b)}`} className="hover:text-accent">
                {b}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-3">
        <Link href="/brands" className="border-ink border-b pb-0.5 text-sm hover:border-accent hover:text-accent">
          Страница брендов
        </Link>
      </div>
    </>
  );
}

function MobileMenu({ onClose, onSearch }: { onClose: () => void; onSearch: () => void }) {
  return (
    <div className="bg-surface fixed inset-0 z-50 flex flex-col lg:hidden">
      <div className="shell border-line flex h-16 shrink-0 items-center justify-between border-b">
        <span className="font-display text-xl">Меню</span>
        <button type="button" onClick={onClose} aria-label="Закрыть меню" className="-mr-2 p-2">
          <CloseIcon />
        </button>
      </div>
      <div className="shell flex-1 overflow-y-auto py-6">
        <button
          type="button"
          onClick={() => {
            onClose();
            onSearch();
          }}
          className="border-line text-ink-muted mb-6 flex w-full items-center gap-3 border px-4 py-3 text-left text-sm"
        >
          <SearchIcon />
          Поиск по каталогу
        </button>

        <Accordion title="Каталог">
          <ul className="space-y-3 pb-4 text-sm">
            {GENDERS.map((g) => (
              <li key={g}>
                <Link href={`/catalog?gender=${g}`}>{GENDER_LABEL[g]}</Link>
              </li>
            ))}
            {SHAPES.map((s) => (
              <li key={s}>
                <Link href={`/catalog?shape=${s}`}>{SHAPE_LABEL[s]}</Link>
              </li>
            ))}
            <li>
              <Link href="/catalog" className="border-ink border-b pb-0.5">
                Весь каталог
              </Link>
            </li>
          </ul>
        </Accordion>
        <Accordion title="Бренды">
          <ul className="space-y-3 pb-4 text-sm">
            {BRANDS.map((b) => (
              <li key={b}>
                <Link href={`/brands/${brandSlug(b)}`}>{b}</Link>
              </li>
            ))}
          </ul>
        </Accordion>
        <ul className="border-line divide-line divide-y border-b text-lg">
          <li>
            <Link href="/catalog?sort=new" className="block py-4">
              Новинки
            </Link>
          </li>
          <li>
            <Link href="/catalog?sale=1" className="text-sale block py-4">
              Sale
            </Link>
          </li>
          <li>
            <Link href="/finder" className="block py-4">
              Подбор по форме лица
            </Link>
          </li>
          <li>
            <Link href="/compare" className="block py-4">
              Сравнение
            </Link>
          </li>
          <li>
            <Link href="/account" className="block py-4">
              Личный кабинет
            </Link>
          </li>
          <li>
            <Link href="/help" className="block py-4">
              Доставка и возврат
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="border-line border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-lg">
        {title}
        <ChevronIcon />
      </summary>
      {children}
    </details>
  );
}

function IconLink({
  href,
  label,
  badge,
  children,
}: {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-label={label} className="relative p-2 hover:text-accent">
      {children}
      {badge ? (
        <span className="bg-ink absolute top-0 right-0 flex size-4 items-center justify-center rounded-full text-[10px] font-medium text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

/* ---------- Иконки ---------- */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Burger() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <path d="M12 20s-7-4.5-7-9.5A4 4 0 0112 8a4 4 0 017 2.5C19 15.5 12 20 12 20z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0115 0" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <path d="M5 20V9M12 20V4M19 20v-7" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" {...stroke} aria-hidden="true">
      <path d="M6 7h12l1 13H5zM9 7a3 3 0 016 0" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" {...stroke} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
