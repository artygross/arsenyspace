import Image from "next/image";
import { COMPANY } from "@/lib/content";

/**
 * Логотип. Пока файла клиента нет — временная концепция из docs/05-ui-system.md §11:
 * круглая лунка и два семядольных листа. Подстановка настоящего логотипа —
 * одно поле `COMPANY.logo`, компоненты не трогаются.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {COMPANY.logo ? (
        <span className="relative block h-full aspect-square shrink-0">
          <Image
            src={COMPANY.logo}
            alt={COMPANY.name}
            fill
            sizes="48px"
            className="object-contain"
            priority
          />
        </span>
      ) : (
        <PlaceholderMark />
      )}
      {(COMPANY.logoWithWordmark || !COMPANY.logo) && (
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
