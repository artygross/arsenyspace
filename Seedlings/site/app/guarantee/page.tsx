import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink, Faq, SectionHeading } from "@/components/ui";
import { FAQ_ITEMS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Оплата, гарантии и возврат",
  description:
    "Оплата саженцев при получении, без предоплаты: в пункте выдачи СДЭК, в почтовом отделении или в питомнике. Гарантия сортности, ответственность за сохранность в дороге и порядок претензии по качеству.",
};

const STEPS = [
  {
    title: "Бронь — бесплатно",
    text: "Вы собираете заказ и оформляете бронь. Предоплаты нет: на этом шаге деньги не берутся вообще.",
  },
  {
    title: "Созваниваемся и отправляем",
    text: "Уточняем состав и срок, отправляем заказ и присылаем номер отправления, чтобы посылку было видно в пути.",
  },
  {
    title: "Платите при получении",
    text: "В пункте выдачи СДЭК, в почтовом отделении или в питомнике при самовывозе. За саженцы, упаковку и доставку сразу.",
  },
];

/** Условия клиента дословно — docs/13-client-source.md. Ничего не додумано и не смягчено */
const GUARANTEE = [
  "Мы отвечаем за сохранность посадочного материала с момента отправки до момента, когда вы получаете его на руки.",
  "Посылку можно вскрыть и осмотреть до оплаты — это правило пунктов выдачи, и мы на нём настаиваем.",
  "Если растение пришло некачественным: сфотографируйте его и пришлите нам вместе с номером заказа.",
  "При нашей вине отправляем замену или возвращаем деньги.",
  "Саженцы по закону возврату и обмену не подлежат — вернуть «просто потому что передумал» нельзя.",
  "Претензии по качеству не рассматриваются, если посылку забрали с опозданием или фотографий нет: за неделю в пункте выдачи растение погибает независимо от того, каким мы его отправили.",
];

export default function GuaranteePage() {
  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Оплата и гарантии" }]} />
      <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
        Оплата, гарантии и возврат
      </h1>
      <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
        Живой товар нельзя проверить до покупки — поэтому правила написаны заранее, а не в момент
        спора. Мы работаем без предоплаты: вы платите, когда посылка уже перед вами.
      </p>

      <section className="mt-10">
        <SectionHeading title="Как проходит заказ" />
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
        <SectionHeading title="Что мы гарантируем и что считается браком" />
        <ul className="card-surface divide-line divide-y">
          {GUARANTEE.map((g) => (
            <li key={g} className="px-5 py-4 leading-relaxed">
              {g}
            </li>
          ))}
        </ul>
        <div className="card-surface bg-leaf-soft/40 mt-4 p-5 text-sm leading-relaxed">
          <p className="font-semibold">Гарантия сортности</p>
          <p className="text-ink-muted mt-1">
            В посылке — тот сорт, который вы заказали. Пересорт выясняется только через год, когда
            растение начинает плодоносить, и разбирать его мы будем так же: по фотографии и с заменой.
          </p>
        </div>
        <p className="text-ink-muted mt-4 text-sm">
          Текст оферты и реквизиты юрлица добавим до запуска — docs/09-questions.md.
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
