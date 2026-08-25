import Image from "next/image";
import { COMPANY } from "@/lib/content";

/**
 * Логотип. Знак берётся из `COMPANY.logo`; в интерфейсе высота знака 32–40 px, поэтому
 * по умолчанию рисуется вариант без кольцевой надписи (`COMPANY.logoMark`) —
 * на такой высоте кольцо превращается в шум. `full` включает полную эмблему:
 * страница «О питомнике» и шапка накладной, где места достаточно.
 * Пока файлов клиента нет — временная концепция из docs/05-ui-system.md §11.
 */
export function Logo({
  className = "",
  full = false,
  priority = false,
  wordmark = COMPANY.logoWithWordmark,
}: {
  className?: string;
  full?: boolean;
  priority?: boolean;
  wordmark?: boolean;
}) {
  const src = full ? COMPANY.logo : (COMPANY.logoMark ?? COMPANY.logo);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {src ? (
        <span className="relative block h-full aspect-square shrink-0">
          <Image
            src={src}
            /* Подпись рядом со знаком повторяет название — тогда знак для скринридера декоративен */
            alt={wordmark ? "" : COMPANY.name}
            fill
            sizes={full ? "224px" : "48px"}
            className="object-contain"
            priority={priority}
          />
        </span>
      ) : (
        <PlaceholderMark />
      )}
      {(wordmark || !src) && (
        <span className="font-display text-lg leading-none font-bold tracking-tight whitespace-nowrap">
          {COMPANY.name}
        </span>
      )}
    </span>
  );
}

function PlaceholderMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-auto" aria-hidden="true">
      <circle cx="20" cy="24" r="14" fill="var(--color-leaf-soft)" />
      <path d="M20 30V14" stroke="var(--color-leaf-deep)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 17C20 10 15 5 8 5c0 8 5 12 12 12Z" fill="var(--color-leaf)" />
      <path d="M20 20c0-6 4-10 11-10 0 7-4 10-11 10Z" fill="var(--color-grass)" />
    </svg>
  );
}
