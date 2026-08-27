"use client";

import { createStore } from "./store";
import type { Fulfilment, MethodKey } from "./delivery";

export { sku } from "./sku";

export type OrderLine = {
  slug: string;
  sku: string;
  title: string;
  pack: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  createdAt: string;
  status: "new" | "collecting" | "ready" | "shipped" | "done";
  customer: { name: string; phone: string; email: string; comment?: string };
  fulfilment: Fulfilment;
  method: MethodKey;
  address?: string;
  /** Когда покупатель хочет получить заказ — клиент спрашивает это при брони */
  period: string;
  payment: "on_delivery";
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  promo?: string;
  deliveryCost: number;
  /** Стоимость доставки считает перевозчик, а не сайт */
  deliveryByCarrier: boolean;
  packaging: number;
  total: number;
  weight: number;
  hasPreorder: boolean;
};

const store = createStore<Order[]>("sg_orders_v1", []);

export const useOrders = store.useValue;

export function nextOrderId(): string {
  const n = store.read().length + 1041;
  return `СГ-${n}`;
}

export function saveOrder(order: Order) {
  store.write([order, ...store.read()]);
}

export function getOrder(id: string): Order | undefined {
  return store.read().find((o) => o.id === id);
}

export const ORDER_STATUS_LABEL: Record<Order["status"], string> = {
  new: "Принят",
  collecting: "Собираем",
  ready: "Готов к выдаче",
  shipped: "Отгружен",
  done: "Получен",
};
