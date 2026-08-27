import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, ButtonLink, SectionHeading } from "@/components/ui";
import { ARTICLES } from "@/lib/articles";
import { CULTURES, MONTHS_IN } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Посадка и уход: советы питомника",
  description:
    "Календарь посадки по месяцам и практические инструкции: когда сажать клубнику, как обрезать ремонтантную малину, какой грунт нужен голубике.",
};

const CALENDAR = [
  { month: 3, what: "Обрезка смородины и малины до распускания почек, подкисление грунта под голубикой" },
  { month: 4, what: "Открытие сезона: посадка саженцев ЗКС, первая подкормка" },
  { month: 5, what: "Высадка рассады в грунт после возвратных заморозков" },
  { month: 6, what: "Полив и мульчирование, сбор ранней клубники, высадка последней партии фриго" },
  { month: 7, what: "Обрезка усов, подкормка после плодоношения" },
  { month: 8, what: "Лучшее время для посадки клубники: успеет заложить почки" },
  { month: 9, what: "Осенняя посадка кустарников: малина, смородина, ежевика, голубика" },
  { month: 10, what: "Влагозарядковый полив, укрытие теплолюбивых культур" },
];

export default function CarePage() {
  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Советы" }]} />
      <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">Посадка и уход</h1>
      <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
        Короткие инструкции без агрономических терминов. Половина проблем с саженцами — это
        неправильная глубина посадки и полив в первую неделю, а не сорт.
      </p>

      <section className="mt-10">
        <SectionHeading title="Календарь работ" text="Что делать в саду по месяцам — и что мы отгружаем в это время." />
        <ul className="grid gap-3 md:grid-cols-2">
          {CALENDAR.map((c) => (
            <li key={c.month} className="card-surface flex gap-4 p-4">
              <span className="bg-leaf-soft text-leaf-deep flex h-fit rounded-full px-3 py-1 text-sm font-semibold">
                {MONTHS_IN[c.month - 1]}
              </span>
              <p className="text-sm leading-relaxed">{c.what}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeading title="Разборы" text="Пошаговые инструкции по частым вопросам — с ссылкой на сорта, о которых идёт речь." />
        <div className="grid gap-4 md:grid-cols-3">
          {ARTICLES.map((a) => (
            <article key={a.slug} className="card-surface hover:border-leaf p-5 transition-colors">
              <p className="eyebrow">{a.minutes} мин чтения</p>
              <h2 className="font-display mt-2 text-lg font-bold">
                <Link href={`/care/${a.slug}`} className="hover:text-leaf">
                  {a.title}
                </Link>
              </h2>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">{a.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading title="Уход по культурам" />
        <ul className="flex flex-wrap gap-2">
          {CULTURES.map((c) => (
            <li key={c.key}>
              <Link href={`/catalog/${c.slug}`} className="card-surface hover:border-leaf inline-block px-4 py-2 text-sm">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-ink-muted mt-4 text-sm">
          Пошаговый уход для конкретного сорта — в его карточке, блок «Посадка и уход».
        </p>
        <ButtonLink href="/catalog" size="l" className="mt-6">
          Перейти в каталог
        </ButtonLink>
      </section>
    </div>
  );
}
