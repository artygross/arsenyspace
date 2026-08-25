import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink, Faq, SectionHeading } from "@/components/ui";
import { FAQ_ITEMS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Оплата и гарантия приживаемости",
  description:
    "Как оплатить заказ рассады: при получении наличными или картой, предоплата 20 % для предзаказа. Гарантия приживаемости 14 дней с заменой или возвратом денег.",
};

const STEPS = [
  {
    title: "Оплата при получении",
    text: "Наличными или картой курьеру, в пункте выдачи или в питомнике при самовывозе. Ничего платить заранее не нужно.",
  },
  {
    title: "Предоплата 20 % для предзаказа",
    text: "Когда партия ещё не выкопана, предоплата фиксирует за вами цену и место в партии. Остальное — при получении.",
  },
  {
    title: "Онлайн-оплата",
    text: "Подключим после подтверждения эквайринга. Пока это опциональный пункт, а не обещание.",
  },
];

const GUARANTEE = [
  "Гарантия действует 14 дней с даты получения заказа.",
  "Случай гарантийный, если растение не тронулось в рост или погибло при соблюдении памятки по посадке.",
  "Что нужно от вас: фотография растения целиком и крупным планом, номер заказа.",
  "Что делаем мы: заменяем растение в ближайшей отгрузке или возвращаем деньги — выбираете вы.",
  "Не гарантийный случай: механическое повреждение после высадки, вымерзание сорта ниже указанной зимостойкости, отсутствие полива.",
];

export default function GuaranteePage() {
  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Оплата и гарантии" }]} />
      <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
        Оплата и гарантия приживаемости
      </h1>
      <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
        Живой товар нельзя проверить до покупки — поэтому правила должны быть простыми и
        написанными заранее, а не в момент спора.
      </p>

      <section className="mt-10">
        <SectionHeading title="Как оплатить" />
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="card-surface p-5">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <SectionHeading title="Гарантия 14 дней" />
        <ul className="card-surface divide-line divide-y">
          {GUARANTEE.map((g) => (
            <li key={g} className="px-5 py-4 leading-relaxed">
              {g}
            </li>
          ))}
        </ul>
        <p className="text-ink-muted mt-4 text-sm">
          Точный текст гарантии и оферты согласовывается с клиентом до запуска — docs/09-questions.md.
        </p>
        <ButtonLink href="/catalog" size="l" className="mt-6">
          Выбрать сорта
        </ButtonLink>
      </section>

      <section className="mt-12">
        <SectionHeading title="Вопросы" />
        <Faq items={FAQ_ITEMS} />
      </section>
    </div>
  );
}
