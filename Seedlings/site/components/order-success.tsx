"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ButtonLink, EmptyState } from "./ui";
import { IconCheck, IconClock, IconPin, IconPrint, IconTruck } from "./icons";
import { ORDER_STATUS_LABEL, useOrders } from "@/lib/orders";
import { PICKUP, ZONES } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

const FIRST_DAY = [
  "Распакуйте коробку в день получения — растению нужен воздух.",
  "Полейте ком земли, не размывая его, и поставьте в тень на сутки.",
  "Высаживайте на следующий день, вечером или в пасмурную погоду.",
  "Если что-то пошло не так — сфотографируйте растение и напишите нам: гарантия 14 дней.",
];

export function OrderSuccess() {
  const params = useSearchParams();
  const id = params.get("id");
  const orders = useOrders();
  const order = orders.find((o) => o.id === id) ?? orders[0];

  if (!order) {
    return (
      <div className="shell py-10">
        <EmptyState
          title="Заказ не найден"
          text="Возможно, вы открыли страницу в другом браузере. Заказы хранятся в личном кабинете."
          action={{ href: "/account", label: "В личный кабинет" }}
        />
      </div>
    );
  }

  const zone = ZONES.find((z) => z.key === order.zone);

  return (
    <div className="shell py-8 lg:py-12">
      <div className="bg-leaf-soft/60 rounded-[28px] p-6 lg:p-10">
        <span className="bg-leaf flex size-12 items-center justify-center rounded-full text-white">
          <IconCheck className="size-7" />
        </span>
        <h1 className="font-display mt-4 text-3xl font-bold lg:text-4xl">
          Заказ {order.id} принят
        </h1>
        <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
          Подтверждение и накладная уже ушли на {order.customer.email}. Мы позвоним по номеру{" "}
          {order.customer.phone}, чтобы согласовать{" "}
          {order.fulfilment === "pickup" ? "дату получения" : "дату доставки"}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href={`/invoice/${encodeURIComponent(order.id)}`} size="l">
            <IconPrint className="size-5" /> Открыть накладную
          </ButtonLink>
          <ButtonLink href="/account" variant="secondary" size="l">
            Мои заказы
          </ButtonLink>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="font-display text-2xl font-bold">Что дальше</h2>
          <ol className="mt-4 grid gap-3">
            {FIRST_DAY.map((step, i) => (
              <li key={step} className="card-surface flex gap-3 p-4">
                <span className="bg-leaf-soft text-leaf-deep flex size-8 shrink-0 items-center justify-center rounded-full font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          <h2 className="font-display mt-10 text-2xl font-bold">Состав заказа</h2>
          <ul className="divide-line card-surface mt-4 divide-y">
            {order.lines.map((l) => (
              <li key={l.slug} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm">
                <span>
                  <Link href={`/product/${l.slug.split("--")[0]}`} className="hover:text-leaf font-medium">
                    {l.title}
                  </Link>
                  <span className="text-ink-muted"> · {l.pack} × {l.qty}</span>
                </span>
                <span className="font-medium">{formatPrice(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="card-surface h-fit p-5">
          <p className="eyebrow mb-3">Статус</p>
          <p className="text-leaf font-medium">{ORDER_STATUS_LABEL[order.status]}</p>

          <p className="eyebrow mt-5 mb-2">Получение</p>
          {order.fulfilment === "pickup" ? (
            <div className="text-sm">
              <p className="flex gap-2">
                <IconPin className="text-leaf size-5 shrink-0" /> {PICKUP.address}
              </p>
              <p className="text-ink-muted mt-2 flex gap-2">
                <IconClock className="text-leaf size-5 shrink-0" /> {PICKUP.hours} · {PICKUP.keep}
              </p>
            </div>
          ) : (
            <div className="text-sm">
              <p className="flex gap-2">
                <IconTruck className="text-leaf size-5 shrink-0" /> {zone?.label}, {zone?.days}
              </p>
              <p className="text-ink-muted mt-2">{order.address}</p>
            </div>
          )}

          <dl className="border-line mt-5 grid gap-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Товары</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Промокод {order.promo}</dt>
                <dd className="text-berry">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-muted">Доставка</dt>
              <dd>{order.deliveryCost === 0 ? "бесплатно" : formatPrice(order.deliveryCost)}</dd>
            </div>
            <div className="border-line mt-1 flex justify-between border-t pt-3 text-base font-semibold">
              <dt>Итого</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
