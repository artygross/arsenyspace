"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/cart";
import { Glasses } from "@/components/glasses";
import { Button, ButtonLink, Price, TrustBlock } from "@/components/ui";
import { formatPrice, plural } from "@/lib/format";

const DELIVERY = [
  { id: "courier", title: "Курьер", note: "Москва и Санкт-Петербург, 1—2 дня", price: 490, freeFrom: 15000 },
  { id: "pickpoint", title: "Пункт выдачи", note: "СДЭК, 2—5 дней, по всей России", price: 290, freeFrom: 15000 },
  { id: "post", title: "Почта России", note: "5—12 дней, включая удалённые регионы", price: 350, freeFrom: 25000 },
  { id: "store", title: "Самовывоз из шоурума", note: "Москва, Столешников пер. 9 — сегодня", price: 0, freeFrom: 0 },
] as const;

const PAYMENT = [
  { id: "card", title: "Картой онлайн", note: "Visa, Mastercard, МИР" },
  { id: "sbp", title: "СБП", note: "Оплата по QR-коду из приложения банка" },
  { id: "cash", title: "При получении", note: "Картой или наличными курьеру" },
  { id: "split", title: "Долями", note: "4 платежа без переплаты" },
] as const;

type Errors = Partial<Record<"name" | "phone" | "email" | "city" | "street", string>>;

export function CheckoutForm() {
  const router = useRouter();
  const { resolved, count, subtotal, savings, clear, ready } = useCart();

  const [delivery, setDelivery] = useState<string>("courier");
  const [payment, setPayment] = useState<string>("card");
  const [values, setValues] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    street: "",
    comment: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!ready) {
    return (
      <div className="shell py-20">
        <div className="bg-surface-alt h-64 animate-pulse" />
      </div>
    );
  }

  if (resolved.length === 0) {
    return (
      <div className="shell py-20 text-center">
        <h1 className="font-display text-3xl">Оформлять нечего</h1>
        <p className="text-ink-muted mt-3">Корзина пуста — сначала выберите модель.</p>
        <ButtonLink href="/catalog" size="l" className="mt-8">
          В каталог
        </ButtonLink>
      </div>
    );
  }

  const method = DELIVERY.find((d) => d.id === delivery)!;
  const needsAddress = delivery !== "store";
  const shipping = subtotal >= method.freeFrom ? 0 : method.price;
  const total = subtotal + shipping;

  function validate(): Errors {
    const e: Errors = {};
    if (values.name.trim().length < 2) e.name = "Укажите имя и фамилию";
    if (values.phone.replace(/\D/g, "").length < 11) e.phone = "Телефон в формате +7 999 000-00-00";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = "Проверьте адрес почты";
    if (needsAddress && values.city.trim().length < 2) e.city = "Укажите город";
    if (needsAddress && values.street.trim().length < 4) e.street = "Укажите улицу и дом";
    return e;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.querySelector<HTMLElement>("[data-invalid='true']")?.focus();
      return;
    }
    setSubmitting(true);
    clear();
    router.push("/checkout/success");
  }

  // Валидация по blur, а не на каждом нажатии — правило форм из docs/05
  function blurField(field: keyof Errors) {
    setErrors((prev) => ({ ...prev, [field]: validate()[field] }));
  }

  function field(name: keyof typeof values, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="shell py-8 lg:py-12" noValidate>
      <h1 className="font-display text-4xl lg:text-5xl">Оформление заказа</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-16">
        <div className="divide-line divide-y">
          <Step n="01" title="Контакты">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Имя и фамилия"
                value={values.name}
                onChange={(v) => field("name", v)}
                onBlur={() => blurField("name")}
                error={errors.name}
                autoComplete="name"
              />
              <Field
                label="Телефон"
                value={values.phone}
                onChange={(v) => field("phone", formatPhone(v))}
                onBlur={() => blurField("phone")}
                error={errors.phone}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 999 000-00-00"
              />
              <div className="sm:col-span-2">
                <Field
                  label="Электронная почта"
                  value={values.email}
                  onChange={(v) => field("email", v)}
                  onBlur={() => blurField("email")}
                  error={errors.email}
                  type="email"
                  autoComplete="email"
                  hint="Отправим номер заказа и трек-номер"
                />
              </div>
            </div>
          </Step>

          <Step n="02" title="Доставка">
            <fieldset>
              <legend className="sr-only">Способ доставки</legend>
              <ul className="grid gap-px bg-line sm:grid-cols-2">
                {DELIVERY.map((d) => {
                  const free = subtotal >= d.freeFrom;
                  return (
                    <li key={d.id}>
                      <label
                        className={`bg-surface flex h-full cursor-pointer gap-3 p-4 transition-colors ${
                          delivery === d.id ? "ring-ink ring-1 ring-inset" : "hover:bg-surface-alt"
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={d.id}
                          checked={delivery === d.id}
                          onChange={() => setDelivery(d.id)}
                          className="accent-ink mt-1 size-4"
                        />
                        <span className="flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-sm font-medium">{d.title}</span>
                            <span className={`text-sm ${free ? "text-success" : ""}`}>
                              {free ? "Бесплатно" : formatPrice(d.price)}
                            </span>
                          </span>
                          <span className="text-ink-muted mt-1 block text-xs leading-relaxed">{d.note}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            {needsAddress && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Город"
                  value={values.city}
                  onChange={(v) => field("city", v)}
                  onBlur={() => blurField("city")}
                  error={errors.city}
                  autoComplete="address-level2"
                />
                <Field
                  label="Улица, дом, квартира"
                  value={values.street}
                  onChange={(v) => field("street", v)}
                  onBlur={() => blurField("street")}
                  error={errors.street}
                  autoComplete="street-address"
                />
              </div>
            )}

            <div className="mt-4">
              <Field
                label="Комментарий к заказу"
                value={values.comment}
                onChange={(v) => field("comment", v)}
                optional
              />
            </div>
          </Step>

          <Step n="03" title="Оплата">
            <fieldset>
              <legend className="sr-only">Способ оплаты</legend>
              <ul className="grid gap-px bg-line sm:grid-cols-2">
                {PAYMENT.map((p) => (
                  <li key={p.id}>
                    <label
                      className={`bg-surface flex h-full cursor-pointer gap-3 p-4 transition-colors ${
                        payment === p.id ? "ring-ink ring-1 ring-inset" : "hover:bg-surface-alt"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={p.id}
                        checked={payment === p.id}
                        onChange={() => setPayment(p.id)}
                        className="accent-ink mt-1 size-4"
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{p.title}</span>
                        <span className="text-ink-muted mt-1 block text-xs leading-relaxed">{p.note}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          </Step>
        </div>

        {/* Липкий сводный блок */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="border-line border p-6">
            <h2 className="font-display text-xl">Заказ</h2>

            <ul className="divide-line mt-5 divide-y">
              {resolved.map((l) => (
                <li key={`${l.slug}-${l.variantId}`} className="flex gap-3 py-3 first:pt-0">
                  <span className="bg-surface-alt relative aspect-4/3 w-16 shrink-0">
                    <Glasses
                      shape={l.product.shape}
                      frameHex={l.variant.frameHex}
                      lensHex={l.variant.lensHex}
                      className="absolute inset-0 m-auto w-[84%]"
                      strokeWidth={8}
                    />
                  </span>
                  <span className="min-w-0 flex-1 text-xs">
                    <span className="block truncate font-medium">
                      {l.product.brand} {l.product.model}
                    </span>
                    <span className="text-ink-muted mt-0.5 block truncate">
                      {l.variant.frame} · {l.qty} шт.
                    </span>
                  </span>
                  <span className="text-xs whitespace-nowrap">{formatPrice(l.product.price * l.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="border-line mt-4 space-y-2.5 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">
                  Товары ({count} {plural(count, "шт", "шт", "шт")}.)
                </dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Скидка</dt>
                  <dd className="text-sale">−{formatPrice(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-muted">{method.title}</dt>
                <dd>{shipping === 0 ? "Бесплатно" : formatPrice(shipping)}</dd>
              </div>
            </dl>

            <div className="border-line mt-4 flex items-baseline justify-between border-t pt-4">
              <span className="font-medium">К оплате</span>
              <Price value={total} size="l" />
            </div>

            <Button type="submit" size="l" className="mt-6 w-full" disabled={submitting}>
              {submitting ? "Оформляем…" : "Подтвердить заказ"}
            </Button>
            <p className="text-ink-muted mt-3 text-center text-[11px] leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с условиями возврата и обработкой персональных данных.
            </p>
          </div>

          <div className="mt-6">
            <TrustBlock compact />
          </div>
        </aside>
      </div>
    </form>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="py-8 first:pt-0">
      <h2 className="mb-6 flex items-baseline gap-3">
        <span className="text-accent text-xs tracking-widest">{n}</span>
        <span className="font-display text-2xl">{title}</span>
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  optional,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  type?: string;
} & Omit<React.ComponentProps<"input">, "onChange" | "value" | "type">) {
  return (
    <label className="block">
      {/* Лейбл всегда виден — плейсхолдер его не заменяет */}
      <span className="mb-1.5 flex items-baseline gap-2 text-xs">
        {label}
        {optional && <span className="text-ink-muted">— необязательно</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        data-invalid={Boolean(error)}
        className={`h-11 w-full border px-3 text-sm ${error ? "border-sale" : "border-line focus:border-ink"}`}
        {...rest}
      />
      {error ? (
        <span className="text-sale mt-1.5 flex items-center gap-1.5 text-xs">
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4.2M8 11.2v.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {error}
        </span>
      ) : hint ? (
        <span className="text-ink-muted mt-1.5 block text-xs">{hint}</span>
      ) : null}
    </label>
  );
}

/** Автоформат телефона — правило форм из docs/05 */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
  if (digits.length === 0) return "";
  const parts = [
    "+",
    digits.slice(0, 1),
    digits.length > 1 ? ` ${digits.slice(1, 4)}` : "",
    digits.length > 4 ? ` ${digits.slice(4, 7)}` : "",
    digits.length > 7 ? `-${digits.slice(7, 9)}` : "",
    digits.length > 9 ? `-${digits.slice(9, 11)}` : "",
  ];
  return parts.join("");
}
