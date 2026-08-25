"use client";

import { useState } from "react";
import { Button } from "./ui";
import { IconCheck } from "./icons";

/**
 * Подписка на открытие отгрузки. В боевой версии — запись в БД сайта
 * и письмо через SMTP-провайдера (docs/08-integrations.md §4).
 */
export function SubscribeForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="text-leaf-deep flex items-center gap-2 font-medium">
        <IconCheck className="size-5" /> Подписали. Напишем, когда откроется отгрузка.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
      className={`flex gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}
    >
      <label className="sr-only" htmlFor="subscribe-email">
        Электронная почта
      </label>
      <input
        id="subscribe-email"
        type="email"
        required
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Ваш email"
        className="field sm:max-w-xs"
      />
      <Button type="submit" size="m" className="shrink-0">
        Подписаться
      </Button>
    </form>
  );
}
