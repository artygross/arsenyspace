import { PRODUCTS } from "@/lib/catalog";

export type OrderStatus = "delivered" | "shipping" | "processing" | "returned";

export type Order = {
  number: string;
  date: string;
  status: OrderStatus;
  delivery: string;
  lines: { slug: string; variantId: string; qty: number }[];
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  delivered: { label: "Доставлен", tone: "text-success" },
  shipping: { label: "В пути", tone: "text-accent" },
  processing: { label: "Собирается", tone: "text-ink" },
  returned: { label: "Возвращён", tone: "text-ink-muted" },
};

function line(slug: string, qty = 1) {
  const p = PRODUCTS.find((x) => x.slug === slug);
  return { slug, variantId: p?.variants[0].id ?? "", qty };
}

/** Демонстрационная история заказов. Реальные данные придут из бэкенда тем же типом. */
export const ORDERS: Order[] = [
  {
    number: "26-04617",
    date: "2026-07-28",
    status: "delivered",
    delivery: "Курьер, Москва",
    lines: [line("nocturne-verso-set")],
  },
  {
    number: "26-04702",
    date: "2026-08-11",
    status: "shipping",
    delivery: "СДЭК, Санкт-Петербург",
    lines: [line("lume-orbita"), line("solara-mira")],
  },
  {
    number: "26-04788",
    date: "2026-08-20",
    status: "processing",
    delivery: "Самовывоз, Столешников 9",
    lines: [line("meridian-cassini-01")],
  },
];

export const ADDRESSES = [
  {
    id: "home",
    title: "Дом",
    text: "Москва, Столешников переулок, 9, кв. 12",
    isDefault: true,
  },
  {
    id: "work",
    title: "Работа",
    text: "Москва, Пресненская наб., 12, офис 4405",
    isDefault: false,
  },
];
