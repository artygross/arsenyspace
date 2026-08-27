import Link from "next/link";
import { CULTURES } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/collections";
import { COMPANY } from "@/lib/content";
import { PICKUP } from "@/lib/delivery";
import { IconPhone, IconPin } from "./icons";
import { Logo } from "./logo";

const HELP = [
  { href: "/delivery", label: "Доставка и упаковка" },
  { href: "/guarantee", label: "Оплата и гарантия" },
  { href: "/care", label: "Посадка и уход" },
  { href: "/sale", label: "Акции и промокоды" },
  { href: "/about", label: "О питомнике" },
  { href: "/account", label: "Личный кабинет" },
  { href: "/compare", label: "Сравнение сортов" },
];

export function SiteFooter() {
  return (
    <footer className="bg-surface border-line mt-16 border-t no-print">
      <div className="shell grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo className="h-12 w-auto" />
          <p className="text-ink-muted mt-4 text-sm leading-relaxed">
            Питомник саженцев ягодных культур в Ломоносовском районе Ленинградской области.
            Бронь без предоплаты, оплата при получении, отправка СДЭК и Почтой России.
          </p>
          <a
            href="https://vk.ru/kupit_sazhentsy_maliny_klubniki"
            className="text-leaf hover:text-leaf-deep mt-4 inline-block text-sm font-medium"
          >
            Наше сообщество ВКонтакте →
          </a>
        </div>

        <nav aria-label="Каталог">
          <h2 className="eyebrow mb-3">Каталог</h2>
          <ul className="grid gap-2 text-sm">
            {CULTURES.map((c) => (
              <li key={c.key}>
                <Link href={`/catalog/${c.slug}`} className="hover:text-leaf">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Подборки">
          <h2 className="eyebrow mb-3">Подборки</h2>
          <ul className="grid gap-2 text-sm">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/collection/${c.slug}`} className="hover:text-leaf">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Покупателю">
          <h2 className="eyebrow mb-3">Покупателю</h2>
          <ul className="grid gap-2 text-sm">
            {HELP.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-leaf">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow mb-3">Контакты</h2>
          <ul className="grid gap-3 text-sm">
            <li className="flex gap-2">
              <IconPhone className="text-leaf size-5 shrink-0" />
              <a href="tel:+74872000000" className="hover:text-leaf">
                +7 (4872) 00-00-00
              </a>
            </li>
            <li className="flex gap-2">
              <IconPin className="text-leaf size-5 shrink-0" />
              <span className="text-ink-muted">
                {PICKUP.address}
                <br />
                {PICKUP.hours}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-line border-t">
        <div className="shell text-ink-muted flex flex-wrap justify-between gap-3 py-5 text-xs">
          <p>
            © 2026 {COMPANY.legal} · Роскомнадзор № {COMPANY.rkn}. ИНН и ОГРН добавим до запуска
            (docs/09-questions.md).
          </p>
          <p>
            Демонстрационный прототип: цены и остатки условные. Индексация закрыта.
          </p>
        </div>
      </div>
    </footer>
  );
}
