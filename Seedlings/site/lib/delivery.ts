/**
 * Расчёт доставки — тарифная таблица по зонам, docs/08-integrations.md §6.
 * Внешних API нет: у живых растений особые условия перевозки, и общий калькулятор врёт.
 */

export type Fulfilment = "delivery" | "pickup";
export type ZoneKey = "city" | "region" | "near" | "russia";

export type Zone = {
  key: ZoneKey;
  label: string;
  hint: string;
  base: number;
  /** Надбавка за каждый кг сверх первых 5 */
  perKg: number;
  days: string;
  /** Термоупаковка нужна при перевозке дольше суток */
  thermo: number;
};

export const ZONES: Zone[] = [
  { key: "city", label: "Курьер по городу", hint: "Тула и ближние посёлки", base: 300, perKg: 0, days: "1 день", thermo: 0 },
  { key: "region", label: "Область", hint: "Тульская область, до 120 км", base: 450, perKg: 20, days: "1–2 дня", thermo: 0 },
  { key: "near", label: "Соседние регионы", hint: "Москва, Калуга, Рязань, Орёл", base: 590, perKg: 30, days: "2–3 дня", thermo: 150 },
  { key: "russia", label: "По России", hint: "Транспортной компанией до пункта выдачи", base: 790, perKg: 45, days: "3–7 дней", thermo: 250 },
];

export const FREE_FROM = 5000;

export const PICKUP = {
  address: "Тульская обл., Ленинский р-н, пос. Хомяково, Садовая ул., 14",
  hours: "Ежедневно 9:00–18:00",
  ready: "Соберём за 1 день, в разгар сезона — за 2",
  keep: "Храним заказ 3 дня",
};

export type DeliveryQuote = {
  cost: number;
  days: string;
  free: boolean;
  thermo: number;
  /** Сколько не хватает до бесплатной доставки */
  toFree: number;
};

export function quoteDelivery({
  fulfilment,
  zone,
  weight,
  subtotal,
  freeShipping = false,
}: {
  fulfilment: Fulfilment;
  zone: ZoneKey;
  weight: number;
  subtotal: number;
  freeShipping?: boolean;
}): DeliveryQuote {
  if (fulfilment === "pickup") {
    return { cost: 0, days: PICKUP.ready, free: true, thermo: 0, toFree: 0 };
  }
  const z = ZONES.find((x) => x.key === zone) ?? ZONES[0];
  const overweight = Math.max(0, Math.ceil(weight - 5));
  const raw = z.base + overweight * z.perKg;
  const free = freeShipping || subtotal >= FREE_FROM;
  return {
    cost: free ? 0 : raw + z.thermo,
    days: z.days,
    free,
    thermo: free ? 0 : z.thermo,
    toFree: Math.max(0, FREE_FROM - subtotal),
  };
}
