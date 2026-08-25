"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink, Button, EmptyState } from "./ui";
import { IconPrint } from "./icons";
import { ORDER_STATUS_LABEL, useOrders, type Order } from "@/lib/orders";
import { addToCart } from "@/lib/cart";
import { useFavorites } from "@/lib/wishlist";
import { formatDate, formatPrice, plural } from "@/lib/format";
import { PICKUP } from "@/lib/delivery";

const TABS = [
  { key: "orders", label: "Заказы" },
  { key: "profile", label: "Данные" },
  { key: "subscriptions", label: "Подписки" },
] as const;

export function AccountView() {
  const orders = useOrders();
  const favorites = useFavorites();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("orders");
  const customer = orders[0]?.customer;

  return (
    <div className="shell py-8 lg:py-10">
      <h1 className="font-display text-3xl font-bold lg:text-4xl">Личный кабинет</h1>
      <p className="text-ink-muted mt-2">
        {customer
          ? `${customer.name}, ${customer.email}`
          : "Кабинет создаётся автоматически по email при первом заказе — регистрироваться отдельно не нужно."}
      </p>

      <div className="border-line mt-6 mb-6 flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.key ? "border-leaf text-leaf" : "text-ink-muted border-transparent hover:text-ink"
            }`}
          >
            {t.label}
            {t.key === "orders" && orders.length > 0 && (
              <span className="text-ink-muted ml-1.5 font-normal">{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {tab === "orders" &&
        (orders.length === 0 ? (
          <EmptyState
            title="Заказов пока нет"
            text="Здесь появятся ваши заказы, накладные и кнопка «Повторить заказ»."
            action={{ href: "/catalog", label: "Выбрать рассаду" }}
          />
        ) : (
          <ul className="grid gap-4">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </ul>
        ))}

      {tab === "profile" && (
        <div className="card-surface max-w-xl p-5">
          <dl className="grid gap-3 text-sm">
            <Row label="Имя" value={customer?.name ?? "—"} />
            <Row label="Телефон" value={customer?.phone ?? "—"} />
            <Row label="Email" value={customer?.email ?? "—"} />
            <Row label="Избранное" value={`${favorites.length} ${plural(favorites.length, "сорт", "сорта", "сортов")}`} />
            <Row label="Пункт самовывоза" value={PICKUP.address} />
          </dl>
          <p className="text-ink-muted mt-4 text-sm">
            Данные подставляются из последнего заказа. В боевой версии — вход по коду из письма.
          </p>
          <ButtonLink href="/favorites" variant="secondary" className="mt-4">
            Открыть избранное
          </ButtonLink>
        </div>
      )}

      {tab === "subscriptions" && (
        <div className="card-surface max-w-xl p-5">
          <p className="font-medium">Уведомления о поступлении</p>
          <p className="text-ink-muted mt-2 text-sm leading-relaxed">
            Сюда попадают сорта, на которые вы подписались кнопкой «Сообщить о поступлении»,
            и подписка на открытие отгрузки. Письма отправляются из очереди — docs/08-integrations.md §4.
          </p>
          <p className="text-ink-muted mt-3 text-sm">В прототипе список не сохраняется.</p>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [repeated, setRepeated] = useState(false);
  return (
    <li className="card-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold">Заказ {order.id}</p>
          <p className="text-ink-muted text-sm">
            от {formatDate(order.createdAt)} ·{" "}
            {order.fulfilment === "pickup" ? "самовывоз" : "доставка"}
          </p>
        </div>
        <span className="bg-leaf-soft text-leaf-deep rounded-full px-3 py-1 text-sm font-medium">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <ul className="divide-line border-line mt-4 divide-y border-t text-sm">
        {order.lines.map((l) => (
          <li key={l.slug} className="flex flex-wrap justify-between gap-2 py-2">
            <Link href={`/product/${l.slug.split("--")[0]}`} className="hover:text-leaf">
              {l.title} <span className="text-ink-muted">· {l.pack} × {l.qty}</span>
            </Link>
            <span className="font-medium">{formatPrice(l.price * l.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="font-semibold">Итого {formatPrice(order.total)}</span>
        <ButtonLink href={`/invoice/${encodeURIComponent(order.id)}`} variant="secondary" size="s">
          <IconPrint className="size-4" /> Накладная
        </ButtonLink>
        <Button
          size="s"
          variant={repeated ? "soft" : "primary"}
          onClick={() => {
            order.lines.forEach((l) => addToCart(l.slug, l.qty));
            setRepeated(true);
            setTimeout(() => setRepeated(false), 1500);
          }}
        >
          {repeated ? "В корзине" : "Повторить заказ"}
        </Button>
      </div>
    </li>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
