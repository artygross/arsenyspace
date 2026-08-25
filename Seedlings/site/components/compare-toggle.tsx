"use client";

import { COMPARE_LIMIT, toggleCompare, useCompare } from "@/lib/compare";
import { IconCheck } from "./icons";

export function CompareToggle({ slug, className = "" }: { slug: string; className?: string }) {
  const list = useCompare();
  const active = list.includes(slug);
  const full = !active && list.length >= COMPARE_LIMIT;

  return (
    <button
      type="button"
      onClick={() => toggleCompare(slug)}
      aria-pressed={active}
      title={full ? `В сравнении уже ${COMPARE_LIMIT} сорта — новый заменит самый старый` : undefined}
      className={`inline-flex items-center gap-1.5 text-sm transition-colors ${
        active ? "text-leaf font-medium" : "text-ink-muted hover:text-leaf"
      } ${className}`}
    >
      {active ? <IconCheck className="size-4" /> : <CompareIcon />}
      {active ? "В сравнении" : "Сравнить"}
    </button>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4" aria-hidden="true">
      <path d="M6 19V9M12 19V5M18 19v-6" strokeLinecap="round" />
    </svg>
  );
}
