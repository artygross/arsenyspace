import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { discountPercent, formatPrice, plural } from "@/lib/format";
import type { Product } from "@/lib/catalog";
import { IconBox, IconLeaf, IconShield, IconStar, IconTruck } from "./icons";

/* ---------- Кнопки — docs/05-ui-system.md §5 ---------- */

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40";

const BTN_VARIANT = {
  primary: "bg-leaf text-white hover:bg-leaf-deep active:translate-y-px",
  secondary: "border border-leaf text-leaf bg-surface hover:bg-leaf-soft",
  soft: "bg-leaf-soft text-leaf-deep hover:bg-[#dcebd9]",
  ghost: "text-leaf hover:text-leaf-deep underline-offset-4 hover:underline",
  danger: "text-berry hover:bg-[#fbecea]",
  sand: "bg-ink text-white hover:bg-leaf-deep",
} as const;

const BTN_SIZE = {
  l: "h-13 px-7 text-base",
  m: "h-11 px-5 text-sm",
  s: "h-9 px-4 text-sm",
} as const;

type ButtonLook = {
  variant?: keyof typeof BTN_VARIANT;
  size?: keyof typeof BTN_SIZE;
  className?: string;
};

export function buttonClass({ variant = "primary", size = "m", className = "" }: ButtonLook = {}) {
  return `${BTN_BASE} ${BTN_VARIANT[variant]} ${BTN_SIZE[size]} ${className}`;
}

export function Button({ variant, size, className, ...props }: ButtonLook & ComponentProps<"button">) {
  return <button className={buttonClass({ variant, size, className })} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLook & ComponentProps<typeof Link>) {
  return <Link className={buttonClass({ variant, size, className })} {...props} />;
}

/* ---------- Бейджи ---------- */
/* Приоритет: скидка > предзаказ > хит > новинка, максимум два — docs/05 §7 */

const BADGE_STYLE = {
  sale: "bg-berry text-white",
  preorder: "bg-sun text-white",
  hit: "bg-leaf-soft text-leaf-deep",
  new: "bg-surface text-leaf border border-leaf",
  out: "bg-sand text-ink-muted",
} as const;

export function Badge({ tone = "new", children }: { tone?: keyof typeof BADGE_STYLE; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] uppercase ${BADGE_STYLE[tone]}`}
    >
      {children}
    </span>
  );
}

export function productBadges(p: Product) {
  const out: { tone: keyof typeof BADGE_STYLE; label: string }[] = [];
  const off = discountPercent(p.price, p.oldPrice);
  if (off) out.push({ tone: "sale", label: `−${off}%` });
  if (p.availability === "preorder") out.push({ tone: "preorder", label: "Предзаказ" });
  if (p.availability === "out_of_season") out.push({ tone: "out", label: "Не сезон" });
  if (p.isHit) out.push({ tone: "hit", label: "Хит" });
  if (p.isNew) out.push({ tone: "new", label: "Новинка" });
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
  const cls = { s: "text-base", m: "text-lg", l: "text-3xl" }[size];
  const discounted = Boolean(oldValue && oldValue > value);
  return (
    <span className={`flex flex-wrap items-baseline gap-2 ${cls}`}>
      <span className={`font-bold ${discounted ? "text-berry" : "text-ink"}`}>{formatPrice(value)}</span>
      {discounted && (
        <span className="text-ink-muted text-[0.75em] line-through">{formatPrice(oldValue!)}</span>
      )}
    </span>
  );
}

/* ---------- Рейтинг ---------- */

export function Rating({ value, count, compact = false }: { value: number; count: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm" aria-label={`Рейтинг ${value} из 5`}>
      <span className="text-sun inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <IconStar key={i} filled={i <= Math.round(value)} className="size-4" />
        ))}
      </span>
      <span className="font-medium">{value.toFixed(1)}</span>
      {!compact && (
        <span className="text-ink-muted">
          {count} {plural(count, "отзыв", "отзыва", "отзывов")}
        </span>
      )}
    </span>
  );
}

/* ---------- Блок доверия ---------- */
/* Один компонент на главной, в карточке, корзине и чекауте — docs/05 §12 */

const TRUST = [
  { icon: IconLeaf, title: "Свой питомник", text: "Выращиваем сами 12 лет, не перекупаем на базах" },
  { icon: IconShield, title: "Гарантия 14 дней", text: "Не прижилось — заменим или вернём деньги по фото" },
  { icon: IconBox, title: "Живая упаковка", text: "Термокороб, торфяной ком, влагоудерживающий гель" },
  { icon: IconTruck, title: "Отгрузка в срок", text: "Собираем в день отправки, дату видно в карточке" },
];

export function TrustBlock({ compact = false }: { compact?: boolean }) {
  const items = compact ? TRUST.slice(0, 3) : TRUST;
  return (
    <ul className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {items.map(({ icon: Icon, ...t }) => (
        <li key={t.title} className="card-surface flex gap-3 p-4">
          <span className="bg-leaf-soft text-leaf-deep flex size-10 shrink-0 items-center justify-center rounded-full">
            <Icon className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{t.title}</span>
            <span className="text-ink-muted mt-0.5 block text-sm leading-snug">{t.text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Заголовок секции ---------- */

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-8">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-2xl leading-tight font-bold lg:text-4xl">{title}</h2>
        {text && <p className="text-ink-muted mt-2 leading-relaxed">{text}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-leaf hover:text-leaf-deep border-leaf/40 hover:border-leaf shrink-0 border-b pb-1 text-sm font-medium"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

/* ---------- Пустое состояние: всегда с действием, docs/05 §12 п.4 ---------- */

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
      <span className="bg-leaf-soft text-leaf flex size-14 items-center justify-center rounded-full">
        <IconLeaf className="size-7" />
      </span>
      <h2 className="font-display mt-4 text-xl font-bold">{title}</h2>
      <p className="text-ink-muted mt-2 max-w-md">{text}</p>
      <ButtonLink href={action.href} className="mt-6">
        {action.label}
      </ButtonLink>
    </div>
  );
}

/* ---------- Хлебные крошки ---------- */

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Навигационная цепочка" className="text-ink-muted flex flex-wrap gap-1.5 py-4 text-sm">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="hover:text-leaf">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
          {i < items.length - 1 && <span aria-hidden="true">/</span>}
        </span>
      ))}
    </nav>
  );
}

/* ---------- FAQ ---------- */

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-line card-surface divide-y">
      {items.map((item) => (
        <details key={item.q} className="group px-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium">
            {item.q}
            <span className="bg-leaf-soft text-leaf-deep flex size-7 shrink-0 items-center justify-center rounded-full transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="text-ink-muted pb-5 leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
