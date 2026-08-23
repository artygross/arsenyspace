import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { discountPercent, formatPrice, plural } from "@/lib/format";

/* ---------- Кнопки ---------- */

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const BTN_VARIANT = {
  primary: "bg-ink text-white hover:bg-ink-muted",
  secondary: "border border-ink text-ink hover:bg-ink hover:text-white",
  ghost: "text-ink hover:text-accent underline-offset-4 hover:underline",
} as const;

const BTN_SIZE = {
  l: "h-13 px-8 text-sm",
  m: "h-11 px-6 text-sm",
  s: "h-9 px-4 text-xs",
} as const;

type ButtonLook = {
  variant?: keyof typeof BTN_VARIANT;
  size?: keyof typeof BTN_SIZE;
  className?: string;
};

export function buttonClass({ variant = "primary", size = "m", className = "" }: ButtonLook = {}) {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`;
}

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonLook & ComponentProps<"button">) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ButtonLook & ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

/* ---------- Бейджи ---------- */
/* Приоритет показа: Sale > Последняя пара > Новинка. Максимум два на карточке. */

const BADGE_STYLE = {
  sale: "bg-sale text-white",
  last: "bg-ink text-white",
  new: "border border-ink text-ink bg-white",
  hit: "border border-accent text-accent bg-white",
} as const;

export function Badge({
  tone = "new",
  children,
}: {
  tone?: keyof typeof BADGE_STYLE;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${BADGE_STYLE[tone]}`}
    >
      {children}
    </span>
  );
}

export function productBadges(p: {
  price: number;
  oldPrice?: number;
  stockLeft: number;
  inStock: boolean;
  isNew: boolean;
  isBestseller: boolean;
}) {
  const out: { tone: keyof typeof BADGE_STYLE; label: string }[] = [];
  const off = discountPercent(p.price, p.oldPrice);
  if (off) out.push({ tone: "sale", label: `−${off}%` });
  if (p.inStock && p.stockLeft <= 4) out.push({ tone: "last", label: "Последние пары" });
  if (p.isNew) out.push({ tone: "new", label: "Новинка" });
  if (p.isBestseller) out.push({ tone: "hit", label: "Хит" });
  return out.slice(0, 2);
}

/* ---------- Цена ---------- */

export function Price({
  value,
  oldValue,
  size = "m",
}: {
  value: number;
  oldValue?: number;
  size?: "s" | "m" | "l";
}) {
  const cls = { s: "text-sm", m: "text-base", l: "text-2xl" }[size];
  const hasDiscount = Boolean(oldValue && oldValue > value);
  return (
    <span className={`flex flex-wrap items-baseline gap-2 ${cls}`}>
      <span className={hasDiscount ? "font-medium text-sale" : "font-medium"}>
        {formatPrice(value)}
      </span>
      {hasDiscount && (
        <span className="text-ink-muted text-[0.8em] line-through">{formatPrice(oldValue!)}</span>
      )}
    </span>
  );
}

/* ---------- Рейтинг ---------- */

export function Rating({
  value,
  count,
  href,
  compact = false,
}: {
  value: number;
  count: number;
  href?: string;
  compact?: boolean;
}) {
  const body = (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <Stars value={value} />
      <span className="font-medium">{value.toFixed(1)}</span>
      {!compact && (
        <span className="text-ink-muted">
          {count} {plural(count, "отзыв", "отзыва", "отзывов")}
        </span>
      )}
    </span>
  );
  return href ? (
    <a href={href} className="hover:text-accent">
      {body}
    </a>
  ) : (
    body
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`Рейтинг ${value.toFixed(1)} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-3.5" aria-hidden="true">
          <defs>
            <linearGradient id={`s${i}-${Math.round(value * 10)}`}>
              <stop offset={`${Math.max(0, Math.min(1, value - i + 1)) * 100}%` } stopColor="var(--color-accent)" />
              <stop offset={`${Math.max(0, Math.min(1, value - i + 1)) * 100}%` } stopColor="var(--color-line)" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#s${i}-${Math.round(value * 10)})`}
            d="M10 1.5l2.47 5.3 5.53.66-4.1 3.9 1.1 5.64L10 14.3l-5 2.7 1.1-5.64-4.1-3.9 5.53-.66z"
          />
        </svg>
      ))}
    </span>
  );
}

/* ---------- Блок доверия ---------- */
/* Один компонент на PDP, в корзине и в чекауте — см. docs/05-ui-system.md */

const TRUST = [
  { title: "Только оригинал", text: "Официальный дилер каждого бренда в каталоге" },
  { title: "Возврат 14 дней", text: "Без объяснения причин, доставку возврата берём на себя" },
  { title: "Доставка 1—3 дня", text: "Курьер по Москве и Санкт-Петербургу, ПВЗ по России" },
  { title: "Гарантия 2 года", text: "На оправу и покрытие линзы" },
];

export function TrustBlock({ compact = false }: { compact?: boolean }) {
  const items = compact ? TRUST.slice(0, 3) : TRUST;
  return (
    <ul
      className={`grid gap-px bg-line ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}
    >
      {items.map((t) => (
        <li key={t.title} className="bg-surface p-5">
          <p className="text-sm font-medium">{t.title}</p>
          <p className="text-ink-muted mt-1 text-xs leading-relaxed">{t.text}</p>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Заголовок секции ---------- */

export function SectionHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl leading-tight lg:text-4xl">{title}</h2>
      </div>
      {action && (
        <Link
          href={action.href}
          className="border-ink border-b pb-1 text-sm hover:border-accent hover:text-accent"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
