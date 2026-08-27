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

const STEPS = [
  {
    title: "Отбираем сорт",
    text: "Ведём маточник и выбираем поставщиков: сорт должен показать урожай и вкус, прежде чем попадёт в каталог.",
  },
  {
    title: "Проверяем каждое растение",
    text: "Отбор идёт вручную перед отгрузкой. Слабые и подозрительные саженцы в заказ не попадают.",
  },
  {
    title: "Собираем и пакуем",
    text: "В день отправки, в коробку с амортизацией по стенкам. Упаковка — 100 ₽ за место.",
  },
  {
    title: "Ведём до получения",
    text: "Созваниваемся перед отправкой, присылаем трек-номер и остаёмся на связи после получения.",
  },
];

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

      {/* Две колонки разной высоты оставляли под контактами пустоту, а шаги в узкой колонке
          ломались на две строки каждый. Развели на две полосы во всю ширину: шаги — процессом
          в четыре колонки, контакты — плашкой */}
      <section className="mt-14">
        <SectionHeading title="Как мы работаем" />
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="card-surface flex flex-col p-5">
              <span className="font-display text-leaf/35 text-4xl leading-none font-bold">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14">
        <SectionHeading title="Контакты" />
        <div className="bg-sand rounded-[28px] p-6 lg:p-8">
          <ul className="grid gap-6 md:grid-cols-3">
            <li className="flex gap-3">
              <IconPin className="text-leaf size-5 shrink-0" />
              <span>
                <span className="block font-medium">Питомник и самовывоз</span>
                <span className="text-ink-muted mt-1 block text-sm leading-relaxed">
                  {PICKUP.address}
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <IconClock className="text-leaf size-5 shrink-0" />
              <span>
                <span className="block font-medium">Часы работы</span>
                <span className="text-ink-muted mt-1 block text-sm leading-relaxed">
                  {PICKUP.hours}. Предупредите о приезде — соберём заказ к вашему появлению.
                </span>
              </span>
            </li>
            <li className="flex gap-3">
              <IconPhone className="text-leaf size-5 shrink-0" />
              <span>
                <span className="block font-medium">Телефон и почта</span>
                <a href={COMPANY.phoneHref} className="hover:text-leaf mt-1 block text-sm">
                  {COMPANY.phone}
                </a>
                <a href={`mailto:${COMPANY.email}`} className="hover:text-leaf block text-sm">
                  {COMPANY.email}
                </a>
              </span>
            </li>
          </ul>

          <div className="border-line mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            <p className="text-ink-muted max-w-xl text-sm leading-relaxed">
              Быстрее всего отвечаем во ВКонтакте — там же в обсуждениях лежат отзывы покупателей
              за несколько сезонов.
            </p>
            <ButtonLink href={COMPANY.vk} variant="secondary" className="shrink-0">
              Сообщество ВКонтакте
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
