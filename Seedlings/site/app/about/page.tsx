import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink, SectionHeading, TrustBlock } from "@/components/ui";
import { IconClock, IconPhone, IconPin } from "@/components/icons";
import { Logo } from "@/components/logo";
import { COMPANY } from "@/lib/content";
import { PICKUP } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "О питомнике",
  description:
    "КФХ Полесье: 12 лет, 240 сортов, 18 000 заказов. Выращиваем рассаду и саженцы сами, продаём напрямую садоводам, отдаём на самовывоз.",
};

export default function AboutPage() {
  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "О питомнике" }]} />
      <div className="flex flex-wrap items-center gap-5">
        <Logo full wordmark={false} className="h-24 w-auto lg:h-28" />
        <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
          {COMPANY.years} лет, {COMPANY.varieties} сортов, {COMPANY.orders} заказов
        </h1>
      </div>
      <p className="text-ink-muted mt-4 max-w-3xl text-lg leading-relaxed">
        Мы начинали с двух грядок малины и продаж в сообществе ВКонтакте — там до сих пор живёт наша
        переписка с покупателями за все эти годы. Сегодня это питомник на 4 гектара, но принцип не
        изменился: продаём только то, что вырастили сами, и отвечаем за каждый саженец.
      </p>

      <div className="mt-10">
        <TrustBlock />
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeading title="Как мы работаем" />
          <ol className="grid gap-3">
            {[
              "Закладываем маточник из проверенного посадочного материала и ведём его сами.",
              "Отбираем растения вручную перед отгрузкой: слабые и подозрительные в заказ не идут.",
              "Собираем заказ в день отправки и пакуем в термокороб.",
              "Держим связь после покупки: гарантия 14 дней и ответы на вопросы по посадке.",
            ].map((step, i) => (
              <li key={step} className="card-surface flex gap-3 p-4">
                <span className="bg-leaf-soft text-leaf-deep flex size-8 shrink-0 items-center justify-center rounded-full font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <SectionHeading title="Контакты" />
          <ul className="card-surface divide-line divide-y">
            <li className="flex gap-3 px-5 py-4">
              <IconPin className="text-leaf size-5 shrink-0" />
              <span>
                <span className="block font-medium">Питомник и пункт самовывоза</span>
                <span className="text-ink-muted text-sm">{PICKUP.address}</span>
              </span>
            </li>
            <li className="flex gap-3 px-5 py-4">
              <IconClock className="text-leaf size-5 shrink-0" />
              <span>
                <span className="block font-medium">Часы работы</span>
                <span className="text-ink-muted text-sm">{PICKUP.hours}</span>
              </span>
            </li>
            <li className="flex gap-3 px-5 py-4">
              <IconPhone className="text-leaf size-5 shrink-0" />
              <span>
                <span className="block font-medium">Телефон и почта</span>
                <a href={COMPANY.phoneHref} className="hover:text-leaf text-sm">
                  {COMPANY.phone}
                </a>
                <span className="text-ink-muted block text-sm">{COMPANY.email}</span>
              </span>
            </li>
          </ul>
          <p className="text-ink-muted mt-4 text-sm">
            Реквизиты юрлица подставляются после ответов клиента — docs/09-questions.md.
          </p>
          <ButtonLink href={COMPANY.vk} variant="secondary" className="mt-4">
            Сообщество ВКонтакте
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
