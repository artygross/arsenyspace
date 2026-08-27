import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink, SectionHeading, TrustBlock } from "@/components/ui";
import { IconClock, IconPhone, IconPin } from "@/components/icons";
import { Logo } from "@/components/logo";
import { COMPANY } from "@/lib/content";
import { PICKUP } from "@/lib/delivery";

export const metadata: Metadata = {
  title: "О питомнике",
  description:
    "КФХ Полесье — питомник саженцев в Ломоносовском районе Ленинградской области. Малина, клубника, смородина, ежевика, голубика. Бронь без предоплаты, оплата при получении, отправка по России.",
};

export default function AboutPage() {
  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "О питомнике" }]} />
      <div className="flex flex-wrap items-center gap-5">
        <Logo wordmark={false} className="h-28 w-auto lg:h-32" />
        <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
          Питомник саженцев «Полесье»
        </h1>
      </div>
      <p className="text-ink-muted mt-4 max-w-3xl text-lg leading-relaxed">
        КФХ «Полесье» в Ломоносовском районе Ленинградской области. Выращиваем ягодные культуры
        и отбираем сорта в белорусских питомниках — те, что из года в год дают урожай и вкус,
        ради которого их и сажают. Продаём напрямую садоводам: бронь без предоплаты, оплата
        при получении, отправка СДЭК и Почтой России по всей стране.
      </p>

      <div className="mt-10">
        <TrustBlock />
      </div>

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionHeading title="Как мы работаем" />
          <ol className="grid gap-3">
            {[
              "Ведём маточник и отбираем поставщиков: сорт должен показать урожай и вкус, прежде чем попадёт в каталог.",
              "Отбираем растения вручную перед отгрузкой: слабые и подозрительные в заказ не идут.",
              "Собираем заказ в день отправки и пакуем в коробку с амортизацией — 100 ₽ за место.",
              "Созваниваемся перед отправкой, присылаем трек-номер и остаёмся на связи после получения.",
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
                <a href={`mailto:${COMPANY.email}`} className="hover:text-leaf block text-sm">
                  {COMPANY.email}
                </a>
              </span>
            </li>
          </ul>
          <ButtonLink href={COMPANY.vk} variant="secondary" className="mt-4">
            Сообщество ВКонтакте
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
