"use client";

import { useState } from "react";
import { applyPromo, type PromoResult } from "@/lib/promo";
import type { Fulfilment } from "@/lib/delivery";
import { Button } from "./ui";
import { IconCheck, IconClose } from "./icons";

/** Промокод применяется без перезагрузки, ошибка показывается тут же — docs/03 §4 */
export function PromoField({
  subtotal,
  byCulture,
  packs,
  fulfilment,
  onChange,
}: {
  subtotal: number;
  byCulture: Record<string, number>;
  packs: Record<string, number>;
  fulfilment: Fulfilment;
  onChange: (result: PromoResult | null) => void;
}) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<PromoResult | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = applyPromo(code, { subtotal, byCulture, packs, fulfilment });
    setResult(next);
    onChange(next.ok ? next : null);
  }

  if (result?.ok) {
    return (
      <div className="bg-leaf-soft text-leaf-deep flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm">
        <IconCheck className="size-4 shrink-0" />
        <span className="flex-1">
          <b>{result.code}</b> — {result.title}
        </span>
        <button
          type="button"
          aria-label="Убрать промокод"
          onClick={() => {
            setResult(null);
            setCode("");
            onChange(null);
          }}
        >
          <IconClose className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="promo" className="mb-2 block text-sm font-semibold">
        Промокод
      </label>
      <div className="flex gap-2">
        <input
          id="promo"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="ВЕСНА15"
          className="field uppercase"
          autoCapitalize="characters"
        />
        <Button type="submit" variant="soft" className="shrink-0">
          Применить
        </Button>
      </div>
      {result && !result.ok && <p className="text-berry mt-2 text-sm">{result.error}</p>}
    </form>
  );
}
