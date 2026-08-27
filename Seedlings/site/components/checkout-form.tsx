"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { PromoField } from "./promo-field";
import { Button, ButtonLink, EmptyState, Price, TrustBlock } from "./ui";
import { IconCheck, IconPin, IconTruck } from "./icons";
import { cartTotals, clearCart, hydrate, useCartLines } from "@/lib/cart";
import {
  KRONSTADT,
  METHODS,
  METHOD_BY_KEY,
  PERIODS,
  PICKUP,
  SPB_PICKUPS,
  fulfilmentOf,
  quoteDelivery,
  type MethodKey,
} from "@/lib/delivery";
import { formatPrice, plural } from "@/lib/format";
import { nextOrderId, saveOrder, sku, type Order } from "@/lib/orders";
import type { PromoResult } from "@/lib/promo";

type Errors = Partial<Record<"name" | "phone" | "email" | "address", string>>;

export function CheckoutForm() {
  const router = useRouter();
  const lines = useCartLines();
  const items = hydrate(lines);
  const totals = cartTotals(items);

  const [method, setMethod] = useState<MethodKey>("cdek");
  const [period, setPeriod] = useState<string>(PERIODS[0]);
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const chosen = METHOD_BY_KEY.get(method)!;
  const fulfilment = fulfilmentOf(method);
  // У выдачи в Петербурге период — это конкретная дата у станции, а не месяц
  const periods =
    method === "spb"
      ? SPB_PICKUPS.map((p) => `${p.station}, ${new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`)
      : PERIODS;
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", comment: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (items.length === 0) {
    return (
      <div className="shell py-10">
        <h1 className="font-display mb-6 text-3xl font-bold">Оформление заказа</h1>
        <EmptyState
          title="Корзина пуста"
          text="Добавьте сорта в корзину — и вернитесь сюда, оформление занимает одну минуту."
          action={{ href: "/catalog", label: "В каталог" }}
        />
      </div>
    );
  }

  const discount = promo?.ok ? promo.discount : 0;
  const quote = quoteDelivery({
    method,
    subtotal: totals.subtotal - discount,
    freeShipping: promo?.ok ? promo.freeShipping : false,
  });
  // Тариф перевозчика в сумму не входит: его назовут при подтверждении брони
  const total = totals.subtotal - discount + quote.cost + quote.packaging;

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Как к вам обращаться?";
    if (form.phone.replace(/\D/g, "").length < 11) e.phone = "Телефон нужен курьеру — 11 цифр";
    if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(form.email)) e.email = "На эту почту уйдут накладная и подтверждение";
    if (chosen.needsAddress && form.address.trim().length < 8)
      e.address = "Укажите город, улицу и дом";
    return e;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    const firstKey = Object.keys(found)[0];
    if (firstKey) {
      // Правило поведения №3: фокус переводится на первое ошибочное поле
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }

    setSending(true);
    const order: Order = {
      id: nextOrderId(),
      createdAt: new Date().toISOString(),
      status: fulfilment === "pickup" ? "collecting" : "new",
      customer: {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        comment: form.comment.trim() || undefined,
      },
      fulfilment,
      method,
      address: chosen.needsAddress
        ? form.address.trim()
        : method === "pickup"
          ? PICKUP.address
          : method === "kronstadt"
            ? KRONSTADT
            : undefined,
      period,
      payment: "on_delivery",
      lines: items.map(({ product, qty }) => ({
        slug: product.slug,
        sku: sku(product.slug),
        title: product.name,
        pack: `${product.packSize} шт.`,
        qty,
        price: product.price,
      })),
      subtotal: totals.subtotal,
      discount,
      promo: promo?.ok ? promo.code : undefined,
      deliveryCost: quote.cost,
      deliveryByCarrier: quote.byCarrier,
      packaging: quote.packaging,
      total,
      weight: Math.round(totals.weight * 10) / 10,
      hasPreorder: totals.hasPreorder,
    };

    saveOrder(order);
    clearCart();
    router.push(`/checkout/success?id=${encodeURIComponent(order.id)}`);
  }

  return (
    <form ref={formRef} onSubmit={submit} className="shell py-8 lg:py-10" noValidate>
      <h1 className="font-display mb-2 text-3xl font-bold lg:text-4xl">Бронь саженцев</h1>
      <p className="text-ink-muted mb-6">
        Без предоплаты: бронь ни к чему не обязывает, оплата — при получении.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="grid gap-4">
          {/* 1. Способ получения */}
          <section className="card-surface p-5">
            <h2 className="font-display mb-4 text-xl font-bold">1. Как получить</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => (
                <ChoiceCard
                  key={m.key}
                  active={method === m.key}
                  onClick={() => setMethod(m.key)}
                  title={m.byCarrier ? m.label : m.base > 0 ? `${m.label} — ${formatPrice(m.base)}` : `${m.label} — 0 ₽`}
                  text={m.hint}
                  icon={m.key === "pickup" || m.key === "kronstadt" || m.key === "spb" ? <IconPin className="size-5" /> : <IconTruck className="size-5" />}
                />
              ))}
            </div>

            {chosen.note && <p className="bg-sand/60 mt-4 rounded-2xl p-4 text-sm">{chosen.note}</p>}

            {chosen.needsAddress && (
              <div className="mt-3">
                <Field
                  name="address"
                  label="Адрес"
                  placeholder="Город, улица, дом, квартира"
                  value={form.address}
                  onChange={(v) => set("address", v)}
                  error={errors.address}
                  autoComplete="street-address"
                />
              </div>
            )}

            {method === "pickup" && (
              <div className="bg-sand/60 mt-3 rounded-2xl p-4 text-sm">
                <p className="font-medium">{PICKUP.address}</p>
                <p className="text-ink-muted mt-1">
                  {PICKUP.hours} · {PICKUP.ready}
                </p>
              </div>
            )}

            {method === "kronstadt" && (
              <p className="bg-sand/60 mt-3 rounded-2xl p-4 text-sm font-medium">{KRONSTADT}</p>
            )}

            <label className="mt-4 grid gap-1.5 text-sm">
              <span className="font-medium">
                {method === "spb" ? "Когда и где встречаемся" : "Когда хотите получить"}
              </span>
              <select className="field" name="period" value={period} onChange={(e) => setPeriod(e.target.value)}>
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <span className="text-ink-muted">
                Это пожелание, а не жёсткий срок: перед отправкой мы созвонимся и договоримся точно.
              </span>
            </label>
          </section>

          {/* 2. Контакты */}
          <section className="card-surface p-5">
            <h2 className="font-display mb-4 text-xl font-bold">2. Контакты</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field name="name" label="Имя" value={form.name} onChange={(v) => set("name", v)} error={errors.name} autoComplete="name" />
              <Field
                name="phone"
                label="Телефон"
                type="tel"
                inputMode="tel"
                placeholder="+7 900 000-00-00"
                value={form.phone}
                onChange={(v) => set("phone", v)}
                error={errors.phone}
                autoComplete="tel"
              />
              <div className="sm:col-span-2">
                <Field
                  name="email"
                  label="Email"
                  type="email"
                  inputMode="email"
                  placeholder="На него придут подтверждение и накладная"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  error={errors.email}
                  autoComplete="email"
                />
              </div>
              <label className="grid gap-1.5 text-sm sm:col-span-2">
                <span className="font-medium">Комментарий к заказу</span>
                <textarea
                  name="comment"
                  rows={3}
                  className="field"
                  placeholder="Например: позвонить за час, домофон не работает"
                  value={form.comment}
                  onChange={(e) => set("comment", e.target.value)}
                />
              </label>
            </div>
            <p className="text-ink-muted mt-3 text-sm">
              Регистрация не нужна: личный кабинет создастся автоматически по этому email.
            </p>
          </section>

          {/* 3. Оплата */}
          <section className="card-surface p-5">
            <h2 className="font-display mb-4 text-xl font-bold">3. Оплата</h2>
            <p className="text-sm leading-relaxed">
              Предоплаты нет. Вы платите за саженцы, упаковку и доставку при получении —
              в пункте выдачи СДЭК, в почтовом отделении или на месте, если забираете сами.
              Посылку можно вскрыть и осмотреть до оплаты.
            </p>
            {quote.byCarrier && (
              <p className="text-ink-muted mt-3 text-sm">
                Доставку считает перевозчик по тарифу для юридических лиц. Точную сумму назовём,
                когда созвонимся и подтвердим бронь.
              </p>
            )}
          </section>
        </div>

        {/* Сквозной блок заказа */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-surface p-5">
            <h2 className="font-display mb-3 text-lg font-bold">Ваш заказ</h2>
            <ul className="divide-line mb-4 grid divide-y text-sm">
              {items.map(({ product, qty }) => (
                <li key={product.slug} className="flex justify-between gap-3 py-2">
                  <span>
                    {product.name}
                    <span className="text-ink-muted"> × {qty}</span>
                  </span>
                  <span className="shrink-0 font-medium">{formatPrice(product.price * qty)}</span>
                </li>
              ))}
            </ul>

            <PromoField
              subtotal={totals.subtotal}
              byCulture={totals.byCulture}
              packs={totals.packs}
              fulfilment={fulfilment}
              onChange={setPromo}
            />

            <dl className="mt-5 grid gap-2.5 text-sm">
              <Row label={`Товары, ${totals.count} ${plural(totals.count, "шт.", "шт.", "шт.")}`} value={formatPrice(totals.subtotal)} />
              {discount > 0 && promo?.ok && <Row label={`Промокод ${promo.code}`} value={`−${formatPrice(discount)}`} tone="berry" />}
              <Row
                label={`${chosen.label} · ${quote.days}`}
                value={
                  quote.byCarrier
                    ? "по тарифу перевозчика"
                    : quote.cost === 0
                      ? "бесплатно"
                      : formatPrice(quote.cost)
                }
                tone={!quote.byCarrier && quote.cost === 0 ? "leaf" : undefined}
              />
              {quote.discount > 0 && !quote.byCarrier && (
                <Row label={`Скидка на доставку ${Math.round(quote.discount * 100)} %`} value="учтена" tone="leaf" />
              )}
              <Row label="Упаковка" value={formatPrice(quote.packaging)} />
              <Row label="Вес заказа" value={`${totals.weight.toFixed(1)} кг`} />
            </dl>

            <div className="border-line mt-4 flex items-baseline justify-between border-t pt-4">
              <span className="font-medium">Итого</span>
              <Price value={total} size="l" />
            </div>

            {quote.byCarrier && (
              <p className="text-ink-muted mt-2 text-xs">
                Доставка перевозчика в эту сумму не входит — её назовём при подтверждении.
              </p>
            )}

            <Button type="submit" size="l" className="mt-4 w-full" disabled={sending}>
              {sending ? "Оформляем…" : "Забронировать без предоплаты"}
            </Button>
            <p className="text-ink-muted mt-3 text-center text-xs">
              Нажимая кнопку, вы соглашаетесь с офертой и политикой обработки персональных данных.
            </p>
            <ButtonLink href="/cart" variant="ghost" className="mt-1 w-full">
              Вернуться в корзину
            </ButtonLink>
          </div>

          <div className="mt-4">
            <TrustBlock compact />
          </div>
        </aside>
      </div>
    </form>
  );
}

function ChoiceCard({
  active,
  onClick,
  title,
  text,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  text: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        active ? "border-leaf bg-leaf-soft/50" : "border-line hover:border-leaf/50"
      }`}
    >
      {icon && <span className="text-leaf mt-0.5">{icon}</span>}
      <span>
        <span className="block font-medium">{title}</span>
        <span className="text-ink-muted block text-sm">{text}</span>
      </span>
      {active && <IconCheck className="text-leaf ml-auto size-5 shrink-0" />}
    </button>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange">) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`field ${error ? "border-berry" : ""}`}
        {...rest}
      />
      {error && (
        <span id={`${name}-error`} className="text-berry">
          {error}
        </span>
      )}
    </label>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "berry" | "leaf" }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className={tone === "berry" ? "text-berry font-medium" : tone === "leaf" ? "text-leaf font-medium" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
