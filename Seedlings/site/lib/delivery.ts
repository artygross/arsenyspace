/**
 * Способы получения заказа — docs/13-client-source.md, разбор в docs/14-brief-diff.md §2.
 *
 * Шесть способов, как их описал клиент. Два из них — СДЭК и Почта — считает перевозчик
 * по договору юрлица, и сайт их не оценивает (решение D-35): названная здесь цифра была бы
 * обещанием, за которое некому отвечать. Такие способы помечены `byCarrier`, в расчёте
 * заказа вместо суммы стоит «по тарифу перевозчика».
 */

export type MethodKey = "cdek" | "post" | "pickup" | "spb" | "address" | "kronstadt";

/** Забирает сам или получает — этого различия хватает промокодам и письмам */
export type Fulfilment = "delivery" | "pickup";

export const fulfilmentOf = (method: MethodKey): Fulfilment =>
  method === "pickup" ? "pickup" : "delivery";

export type Method = {
  key: MethodKey;
  label: string;
  hint: string;
  /** Стоимость считает перевозчик, а не сайт */
  byCarrier: boolean;
  /** Фиксированная цена, ₽ — только для тех, кого считаем сами */
  base: number;
  days: string;
  /** Нужен ли адрес получателя */
  needsAddress: boolean;
  note?: string;
};

export const METHODS: Method[] = [
  {
    key: "cdek",
    label: "СДЭК",
    hint: "До пункта выдачи в вашем городе",
    byCarrier: true,
    base: 0,
    days: "3–7 дней",
    needsAddress: false,
    note: "По тарифу СДЭК для юридических лиц — он дешевле отправки от частного лица. Сумму назовём при подтверждении брони.",
  },
  {
    key: "post",
    label: "Почта России",
    hint: "До почтового отделения",
    byCarrier: true,
    base: 0,
    days: "5–14 дней",
    needsAddress: false,
    note: "По тарифу Почты России. Сумму назовём при подтверждении брони.",
  },
  {
    key: "pickup",
    label: "Самовывоз из питомника",
    hint: "д. Воронкино, Ломоносовский р-н",
    byCarrier: false,
    base: 0,
    days: "Круглосуточно",
    needsAddress: false,
    note: "Бесплатно, забрать можно в любое время. О приезде предупредите заранее — соберём заказ к вашему появлению.",
  },
  {
    key: "spb",
    label: "К метро в Санкт-Петербурге",
    hint: "Бесплатно, только весной, по датам",
    byCarrier: false,
    base: 0,
    days: "В день выдачи",
    needsAddress: false,
    note: "Бесплатно. Выдаём в шаговой доступности от станции в назначенный день.",
  },
  {
    key: "kronstadt",
    label: "Пункт выдачи в Кронштадте",
    hint: "ул. Зосимова, у д. 5",
    byCarrier: false,
    base: 0,
    days: "По согласованию",
    needsAddress: false,
    note: "Бесплатно. Привозим заказ в Кронштадт, дату и время согласуем заранее.",
  },
  {
    key: "address",
    label: "Курьером на адрес",
    hint: "Санкт-Петербург и Ленинградская область",
    byCarrier: false,
    base: 1500,
    days: "1–2 дня",
    needsAddress: true,
    note: "1 500 ₽ в пределах КАД. За КАД — 1 500 ₽ плюс 30 ₽ за километр, расстояние посчитаем при подтверждении.",
  },
];

export const METHOD_BY_KEY = new Map(METHODS.map((m) => [m.key, m]));

/** Весенние выдачи у метро. Даты клиент задаёт на сезон, docs/09 — кто их обновляет */
export const SPB_PICKUPS = [
  { station: "м. Купчино", date: "2026-04-23" },
  { station: "м. пр. Просвещения", date: "2026-04-29" },
  { station: "м. пр. Ветеранов", date: "2026-05-07" },
];

/**
 * Периоды получения. Клиент спрашивает их при оформлении брони: заказы принимаются
 * на лето-осень 2026, а часть покупателей планирует посадку на весну.
 * Конкретный набор периодов на сезон уточняется у клиента (docs/09-questions.md).
 */
export const PERIODS = [
  "Как можно скорее",
  "Сентябрь 2026",
  "Октябрь 2026",
  "Весна 2027",
];

export const PICKUP = {
  address: "Ленинградская обл., Ломоносовский р-н, д. Воронкино, ул. Луговая, 36",
  hours: "Круглосуточно",
  ready: "Соберём к вашему приезду",
  keep: "Держим заказ до согласованной даты",
};

export const KRONSTADT = "г. Кронштадт, ул. Зосимова, возле д. 5 (гаражный кооператив, 1-я стоянка)";

/** Упаковка: коробка и упаковочный материал, за место */
export const PACKAGING_PER_PLACE = 100;

/**
 * Скидка на доставку от суммы заказа: −10 % за каждые полные 10 000 ₽.
 * Применяется только к тому, что считает сайт: тариф перевозчика мы не знаем,
 * скидку по нему питомник учтёт при подтверждении.
 */
export function deliveryDiscount(subtotal: number): number {
  return Math.min(0.5, Math.floor(subtotal / 10000) * 0.1);
}

export type DeliveryQuote = {
  /** Итого за доставку, ₽. Для способов перевозчика — 0, потому что сумма неизвестна */
  cost: number;
  /** Стоимость считает перевозчик — показываем словами, а не цифрой */
  byCarrier: boolean;
  free: boolean;
  days: string;
  /** Доля скидки на доставку от суммы заказа */
  discount: number;
  /** Упаковка — коробка и материал */
  packaging: number;
  note?: string;
};

export function quoteDelivery({
  method,
  subtotal,
  freeShipping = false,
}: {
  method: MethodKey;
  subtotal: number;
  freeShipping?: boolean;
}): DeliveryQuote {
  const m = METHOD_BY_KEY.get(method) ?? METHODS[0];
  const discount = deliveryDiscount(subtotal);
  const packaging = PACKAGING_PER_PLACE;

  if (m.byCarrier) {
    return { cost: 0, byCarrier: true, free: false, days: m.days, discount, packaging, note: m.note };
  }
  const cost = freeShipping ? 0 : Math.round(m.base * (1 - discount));
  return {
    cost,
    byCarrier: false,
    free: cost === 0,
    days: m.days,
    discount,
    packaging,
    note: m.note,
  };
}
