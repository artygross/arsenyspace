/** Промокоды. В боевой версии — таблица в БД сайта с ограничениями и счётчиком использований. */

import type { Fulfilment } from "./delivery";

export type PromoInput = {
  subtotal: number;
  /** Сумма позиций по культуре — для кодов, привязанных к культуре */
  byCulture: Record<string, number>;
  packs: Record<string, number>;
  fulfilment: Fulfilment;
};

export type PromoRule = {
  code: string;
  title: string;
  description: string;
  until: string;
  apply: (input: PromoInput) => { discount: number; freeShipping: boolean } | string;
};

export const PROMOS: PromoRule[] = [
  {
    code: "ВЕСНА15",
    title: "−15 % на малину",
    description: "При заказе от 3 саженцев малины — летней, ремонтантной или вперемешку. Суммируется со скидками распродажи.",
    until: "2026-09-30",
    apply: ({ byCulture, packs }) => {
      // Малина — два раздела каталога, для промокода они считаются вместе
      const keys = Object.keys(byCulture).filter((k) => k.startsWith("raspberry"));
      const sum = keys.reduce((acc, k) => acc + (byCulture[k] ?? 0), 0);
      const count = keys.reduce((acc, k) => acc + (packs[k] ?? 0), 0);
      if (count < 3) return "Нужно минимум 3 саженца малины";
      return { discount: Math.round(sum * 0.15), freeShipping: false };
    },
  },
  {
    code: "ПЕРВЫЙ300",
    title: "300 ₽ на первый заказ",
    description: "При сумме от 2 500 ₽.",
    until: "2026-12-31",
    apply: ({ subtotal }) =>
      subtotal >= 2500 ? { discount: 300, freeShipping: false } : "Действует от 2 500 ₽",
  },
  {
    code: "САМОВЫВОЗ5",
    title: "−5 % за самовывоз",
    description: "Когда забираете заказ в питомнике сами.",
    until: "2026-12-31",
    apply: ({ subtotal, fulfilment }) =>
      fulfilment === "pickup"
        ? { discount: Math.round(subtotal * 0.05), freeShipping: false }
        : "Код работает только с самовывозом",
  },
  {
    code: "ДОСТАВКА0",
    title: "Бесплатная доставка",
    description: "При заказе от 3 000 ₽.",
    until: "2026-10-31",
    apply: ({ subtotal }) =>
      subtotal >= 3000 ? { discount: 0, freeShipping: true } : "Действует от 3 000 ₽",
  },
];

export type PromoResult =
  | { ok: true; code: string; discount: number; freeShipping: boolean; title: string }
  | { ok: false; error: string };

export function applyPromo(codeRaw: string, input: PromoInput): PromoResult {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return { ok: false, error: "Введите промокод" };
  const rule = PROMOS.find((p) => p.code === code);
  if (!rule) return { ok: false, error: "Такого промокода нет" };
  if (new Date(rule.until) < new Date("2026-08-25"))
    return { ok: false, error: "Срок действия промокода истёк" };
  const result = rule.apply(input);
  if (typeof result === "string") return { ok: false, error: result };
  if (result.discount === 0 && !result.freeShipping)
    return { ok: false, error: "Промокод не даёт скидку на этот заказ" };
  return { ok: true, code, title: rule.title, ...result };
}
