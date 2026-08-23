import Link from "next/link";
import { ButtonLink } from "@/components/ui";

export const metadata = { title: "Доставка, возврат и гарантия" };

const SECTIONS = [
  {
    id: "delivery",
    title: "Доставка и оплата",
    items: [
      ["Курьер по Москве и Санкт-Петербургу", "490 ₽, 1—2 дня. Бесплатно при заказе от 15 000 ₽."],
      ["Пункты выдачи СДЭК", "290 ₽, 2—5 дней, более 2 000 точек по России. Бесплатно от 15 000 ₽."],
      ["Почта России", "350 ₽, 5—12 дней, включая удалённые регионы. Бесплатно от 25 000 ₽."],
      ["Самовывоз из шоурума", "Бесплатно. Москва, Столешников переулок 9, ежедневно 11:00—21:00."],
      ["Оплата", "Картой онлайн, СБП, при получении или четырьмя платежами «Долями»."],
    ],
  },
  {
    id: "returns",
    title: "Возврат и обмен",
    items: [
      ["14 дней без объяснения причин", "Отсчёт со дня получения. Очки должны быть без следов носки, с футляром и биркой."],
      ["Доставка возврата за наш счёт", "Оформите заявку в личном кабинете — курьер приедет в удобное время."],
      ["Обмен на другой размер", "Меняем на любую модель того же бренда. Разницу в цене доплачиваете или возвращаем."],
      ["Деньги", "Возврат на ту же карту в течение 3—10 рабочих дней после приёмки."],
    ],
  },
  {
    id: "warranty",
    title: "Гарантия оригинальности",
    items: [
      ["Официальный дилер", "Каждый бренд каталога поставляется напрямую или через официального дистрибьютора."],
      ["Сертификат в комплекте", "В коробке — фирменный сертификат с серийным номером модели."],
      ["Гарантия 2 года", "На оправу, петли и покрытие линзы. Не распространяется на механические повреждения."],
      ["Проверка", "Серийный номер можно сверить на сайте бренда — мы прикладываем инструкцию."],
    ],
  },
  {
    id: "size",
    title: "Как выбрать размер оправы",
    items: [
      ["Маркировка на заушнике", "Три числа вида 52□18-145: ширина линзы, переносица, длина заушника — в миллиметрах."],
      ["Если маркировки нет", "Измерьте линейкой ширину одной линзы в самом широком месте."],
      ["Допустимое отклонение", "До 2 мм почти незаметно. Больше 4 мм — оправа будет давить или сползать."],
      ["Сводный размер", "S — линза до 50 мм, M — 51—56 мм, L — от 57 мм. Указан на каждой карточке товара."],
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Помощь</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <h1 className="font-display text-3xl">Помощь</h1>
          <ul className="mt-6 space-y-3 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-muted hover:text-ink">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
          <ButtonLink href="/finder" variant="secondary" size="s" className="mt-8">
            Подобрать очки
          </ButtonLink>
        </aside>

        <div className="space-y-16">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-display text-3xl">{s.title}</h2>
              <dl className="divide-line mt-6 divide-y border-line border-t">
                {s.items.map(([term, def]) => (
                  <div key={term} className="grid gap-2 py-5 sm:grid-cols-[220px_1fr] sm:gap-6">
                    <dt className="text-sm font-medium">{term}</dt>
                    <dd className="text-ink-muted text-sm leading-relaxed">{def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
