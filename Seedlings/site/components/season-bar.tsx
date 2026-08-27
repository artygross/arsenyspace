"use client";

import Link from "next/link";
import { createStore } from "@/lib/store";
import { IconClose } from "./icons";

/**
 * Липкая полоса сезонного статуса — docs/03-ux-structure.md §6.
 * Закрывается и не возвращается в этой сессии. Состояние читается через
 * внешнее хранилище, а не setState в эффекте — иначе лишний каскад рендеров.
 */
const dismissed = createStore<boolean>("sg_season_bar", false, "session");

export function SeasonBar() {
  const hidden = dismissed.useValue();
  if (hidden) return null;

  return (
    <div className="bg-leaf text-white no-print">
      <div className="shell flex items-center gap-3 py-2 text-sm">
        <p className="flex-1">
          Открыт приём заказов на лето-осень 2026 без предоплаты — оплата при получении.{" "}
          <Link href="/sale" className="underline underline-offset-2">
            Смотреть акции
          </Link>
        </p>
        <button
          type="button"
          aria-label="Скрыть уведомление"
          onClick={() => dismissed.write(true)}
          className="flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-white/15"
        >
          <IconClose className="size-4" />
        </button>
      </div>
    </div>
  );
}
