"use client";

import { EmptyState, Button } from "./ui";
import { IconPrint } from "./icons";
import { useOrders } from "@/lib/orders";
import { METHOD_BY_KEY, PICKUP } from "@/lib/delivery";
import { Logo } from "./logo";
import { COMPANY } from "@/lib/content";
import { amountInWords, formatDate, formatPrice } from "@/lib/format";

/**
 * Автоматическая накладная — docs/08-integrations.md §7.
 * Печатная HTML-страница: тот же документ уходит вложением в письмо и дублируется в Бизнес.ру.
 */
export function InvoiceView({ id }: { id: string }) {
  const orders = useOrders();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="shell py-10">
        <EmptyState
          title="Накладная не найдена"
          text="Заказы этого браузера хранятся локально. Откройте список заказов в личном кабинете."
          action={{ href: "/account", label: "К заказам" }}
        />
      </div>
    );
  }

  const method = METHOD_BY_KEY.get(order.method);
  const goods = order.lines.reduce((s, l) => s + l.price * l.qty, 0);

  return (
    <div className="shell py-8">
      <div className="no-print mb-6 flex flex-wrap items-center gap-3">
        <Button onClick={() => window.print()} size="l">
          <IconPrint className="size-5" /> Печать или PDF
        </Button>
        <p className="text-ink-muted text-sm">
          Тот же документ приходит покупателю письмом сразу после оформления.
        </p>
      </div>

      <article className="card-surface mx-auto max-w-3xl p-6 lg:p-10">
        <header className="border-line flex flex-wrap justify-between gap-4 border-b pb-5">
          <div>
            <h1 className="font-display text-2xl font-bold">
              Накладная № {order.id}
            </h1>
            <p className="text-ink-muted mt-1 text-sm">от {formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Logo wordmark={false} className="h-16 w-auto shrink-0" />
            <div>
              <p className="font-semibold">{COMPANY.name}</p>
              <p className="text-ink-muted">{COMPANY.legal}</p>
              <p className="text-ink-muted">{COMPANY.phone}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 py-5 text-sm sm:grid-cols-2">
          <div>
            <p className="eyebrow mb-1">Продавец</p>
            <p>{COMPANY.name}</p>
            <p className="text-ink-muted">{PICKUP.address}</p>
            <p className="text-ink-muted">ИНН / ОГРН — уточняются у клиента</p>
          </div>
          <div>
            <p className="eyebrow mb-1">Покупатель</p>
            <p>{order.customer.name}</p>
            <p className="text-ink-muted">{order.customer.phone}</p>
            <p className="text-ink-muted">{order.customer.email}</p>
          </div>
        </section>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="bg-leaf-soft/60 text-left">
                <th className="px-3 py-2 font-semibold">Артикул</th>
                <th className="px-3 py-2 font-semibold">Наименование</th>
                <th className="px-3 py-2 font-semibold">Фасовка</th>
                <th className="px-3 py-2 text-right font-semibold">Кол-во</th>
                <th className="px-3 py-2 text-right font-semibold">Цена</th>
                <th className="px-3 py-2 text-right font-semibold">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((l) => (
                <tr key={l.slug} className="border-line border-b">
                  <td className="px-3 py-2 whitespace-nowrap">{l.sku}</td>
                  <td className="px-3 py-2">{l.title}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{l.pack}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{l.qty}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatPrice(l.price)}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {formatPrice(l.price * l.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="ml-auto mt-5 grid max-w-xs gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-muted">Товары</dt>
            <dd>{formatPrice(goods)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-muted">Скидка{order.promo ? ` (${order.promo})` : ""}</dt>
              <dd>−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-muted">{method?.label ?? "Доставка"}</dt>
            <dd>
              {order.deliveryByCarrier
                ? "по тарифу перевозчика"
                : order.deliveryCost === 0
                  ? "0 ₽"
                  : formatPrice(order.deliveryCost)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-muted">Упаковка</dt>
            <dd>{formatPrice(order.packaging)}</dd>
          </div>
          <div className="border-line flex justify-between border-t pt-2 text-base font-bold">
            <dt>Итого</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm">
          Всего наименований {order.lines.length}, на сумму {formatPrice(order.total)}.
          <br />
          <b>{amountInWords(order.total)}</b>
        </p>

        <section className="border-line mt-5 grid gap-2 border-t pt-5 text-sm">
          <p>
            <span className="text-ink-muted">Способ получения: </span>
            {method?.label ?? "Доставка"}
            {order.address ? `, ${order.address}` : ""}
            {order.period ? ` · ${order.period}` : ""}
          </p>
          <p>
            <span className="text-ink-muted">Оплата: </span>
            При получении, без предоплаты
            {order.deliveryByCarrier ? ". Доставка — по тарифу перевозчика" : ""}
          </p>
          <p>
            <span className="text-ink-muted">Вес заказа: </span>
            {order.weight} кг
          </p>
          {order.customer.comment && (
            <p>
              <span className="text-ink-muted">Комментарий: </span>
              {order.customer.comment}
            </p>
          )}
          {order.hasPreorder && (
            <p className="text-ink-muted">
              В заказе есть позиции по предзаказу — отправим, когда партия будет готова, и предупредим заранее.
            </p>
          )}
        </section>

        <footer className="mt-10 grid gap-8 text-sm sm:grid-cols-2">
          <p className="border-ink border-t pt-2">Отпустил (подпись)</p>
          <p className="border-ink border-t pt-2">Получил (подпись)</p>
        </footer>

        <p className="text-ink-muted mt-6 text-xs">
          Мы отвечаем за сохранность саженцев в дороге. При повреждении пришлите фото
          растения на {COMPANY.email}.
        </p>
      </article>
    </div>
  );
}
