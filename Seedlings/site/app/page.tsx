import Link from "next/link";
import { LeafMark } from "@/components/plant-art";
import { ProductImage } from "@/components/product-image";
import { ProductGrid } from "@/components/product-card";
import { SubscribeForm } from "@/components/subscribe-form";
import { ButtonLink, Faq, Rating, SectionHeading, TrustBlock } from "@/components/ui";
import { FaqLd, OrganizationLd } from "@/components/structured-data";
import { IconBox, IconClock, IconPin, IconTruck } from "@/components/icons";
import {
  CULTURES,
  MONTHS_IN,
  countByCulture,
  getProducts,
  hits,
  seasonalPicks,
} from "@/lib/catalog";
import { ADVANTAGES, DELIVERY_STEPS, FAQ_ITEMS, REVIEWS_HOME } from "@/lib/content";
import { ARTICLES } from "@/lib/articles";
import { COLLECTIONS, collectionItems } from "@/lib/collections";
import { FREE_FROM, PICKUP, ZONES } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

export default function HomePage() {
  const month = new Date().getMonth() + 1;
  const counts = countByCulture();
  const products = getProducts();
  const seasonal = seasonalPicks(month, 4);
  const bestsellers = hits(8);

  return (
    <>
      <OrganizationLd />
      <FaqLd items={FAQ_ITEMS} />

      {/* 1. Первый экран */}
      <section className="bg-sand/60">
        <div className="shell grid items-center gap-8 py-10 lg:grid-cols-[1.1fr_.9fr] lg:py-16">
          <div>
            <p className="eyebrow">Питомник с 2014 года · Тульская область</p>
            <h1 className="font-display mt-3 text-[2rem] leading-[1.1] font-bold lg:text-5xl">
              Рассада и саженцы
              <br />
              из своего питомника
            </h1>
            <p className="text-ink-muted mt-4 max-w-xl text-lg leading-relaxed">
              Выращиваем сами — от маточника до вашей грядки. Сорта, проверенные в средней полосе,
              с закрытой корневой системой. Отгружаем в срок и упаковываем так, чтобы растение доехало живым.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/catalog" size="l">
                Выбрать рассаду
              </ButtonLink>
              <ButtonLink href="#season" variant="secondary" size="l">
                Что сажать сейчас
              </ButtonLink>
            </div>
            <p className="text-ink-muted mt-5 text-sm">
              Осенняя отгрузка — с 5 сентября. Предзаказ открыт, цена фиксируется сегодняшняя.
            </p>
          </div>

          <div className="relative">
            <div className="bg-leaf-soft grid grid-cols-2 gap-3 rounded-[28px] p-4">
              {products.slice(0, 2).concat(products.slice(12, 14)).map((p) => (
                <Link
                  key={p.slug}
                  href={`/product/${p.slug}`}
                  className="bg-surface hover:shadow-lift rounded-2xl p-2 transition-shadow"
                >
                  <ProductImage product={p} className="h-28 w-full lg:h-32 rounded-xl" sizes="200px" decorative />
                  <p className="truncate px-1 pb-1 text-center text-xs font-medium">{p.name}</p>
                </Link>
              ))}
            </div>
            <LeafMark className="text-grass/40 absolute -top-6 -right-2 size-16 rotate-12" />
          </div>
        </div>

        <div className="shell pb-10">
          <TrustBlock />
        </div>
      </section>

      {/* 2. Плитка культур */}
      <section className="shell section">
        <SectionHeading
          eyebrow="Каталог"
          title="Что у нас растёт"
          text="Семь направлений, 240 сортов. У каждого сорта указаны зимостойкость, срок созревания и окно посадки."
          action={{ href: "/catalog", label: "Весь каталог" }}
        />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
          {CULTURES.map((c) => {
            const sample = products.find((p) => p.culture === c.key)!;
            return (
              <li key={c.key}>
                <Link
                  href={`/catalog/${c.slug}`}
                  className="card-surface hover:shadow-lift flex h-full flex-col items-center p-3 text-center transition-all hover:-translate-y-0.5"
                >
                  <ProductImage product={sample} className="h-24 w-full rounded-xl" sizes="160px" decorative />
                  <span className="mt-1 font-medium">{c.name}</span>
                  <span className="text-ink-muted text-sm">{counts[c.key]} сортов</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 3. Сезонная лента */}
      <section id="season" className="bg-leaf-soft/50 scroll-mt-20">
        <div className="shell section">
          <SectionHeading
            eyebrow="Сезон"
            title={`Что сажать в ${MONTHS_IN[month - 1]}`}
            text="Подборка меняется вместе с календарём: показываем только то, что сейчас в окне посадки и есть на складе."
            action={{ href: "/catalog?availability=in_stock", label: "Всё в наличии" }}
          />
          <ProductGrid products={seasonal} />
        </div>
      </section>

      {/* 4. Хиты */}
      <section className="shell section">
        <SectionHeading
          eyebrow="Выбор покупателей"
          title="Хиты сезона"
          action={{ href: "/catalog?sort=popular", label: "Смотреть все" }}
        />
        <ProductGrid products={bestsellers} />
      </section>

      {/* 4a. Готовые подборки */}
      <section className="shell pb-4">
        <SectionHeading
          eyebrow="Готовые решения"
          title="Не знаете, с чего начать"
          text="Подборки собраны под задачу, а не под культуру: их берут одной кнопкой и правят состав уже в корзине."
        />
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {COLLECTIONS.map((c) => {
            const items = collectionItems(c);
            const sum = items
              .filter((p) => p.availability !== "out_of_season")
              .reduce((s, p) => s + p.price, 0);
            return (
              <li key={c.slug}>
                <Link
                  href={`/collection/${c.slug}`}
                  className="card-surface hover:shadow-lift flex h-full flex-col p-5 transition-all hover:-translate-y-0.5"
                >
                  <div className="bg-leaf-soft -mx-2 -mt-2 mb-3 flex gap-1 rounded-2xl px-2 py-1">
                    {items.slice(0, 3).map((p) => (
                      <ProductImage key={p.slug} product={p} className="h-20 w-1/3 rounded-lg" sizes="120px" decorative />
                    ))}
                  </div>
                  <p className="font-display text-lg font-bold">{c.title}</p>
                  <p className="text-ink-muted mt-1 flex-1 text-sm leading-relaxed">{c.promise}</p>
                  <p className="text-leaf mt-3 text-sm font-medium">
                    {items.length} {items.length === 1 ? "сорт" : items.length < 5 ? "сорта" : "сортов"} · от {formatPrice(sum)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 5. Преимущества */}
      <section className="bg-sand/60">
        <div className="shell section">
          <SectionHeading eyebrow="Почему нам доверяют" title="Живой товар требует честных правил" />
          <div className="grid gap-4 md:grid-cols-2">
            {ADVANTAGES.map((a, i) => (
              <div key={a.title} className="card-surface p-6">
                <span className="text-grass font-display text-3xl font-bold">0{i + 1}</span>
                <h3 className="font-display mt-2 text-xl font-bold">{a.title}</h3>
                <p className="text-ink-muted mt-2 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Доставка */}
      <section className="shell section">
        <SectionHeading
          eyebrow="Доставка"
          title="Доставим живым — или заменим"
          text="Растения едут в термокоробе. Отправляем в день сбора и не отправляем в мороз: дождёмся окна и предупредим вас."
          action={{ href: "/delivery", label: "Подробно о доставке" }}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {DELIVERY_STEPS.map((s, i) => {
            const StepIcon = [IconBox, IconTruck, IconClock][i];
            return (
            <div key={s.title} className="card-surface p-5">
              <span className="bg-leaf-soft text-leaf-deep flex size-10 items-center justify-center rounded-full">
                <StepIcon className="size-5" />
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">{s.text}</p>
            </div>
            );
          })}
        </div>
        <ul className="text-ink-muted mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {ZONES.map((z) => (
            <li key={z.key} className="card-surface px-4 py-3">
              <span className="text-ink block font-medium">{z.label}</span>
              {z.days} · от {formatPrice(z.base)}
            </li>
          ))}
        </ul>
        <p className="text-leaf mt-3 text-sm font-medium">
          Бесплатно при заказе от {formatPrice(FREE_FROM)}
        </p>
      </section>

      {/* 7. Самовывоз */}
      <section className="shell">
        <div className="bg-sand grid gap-6 rounded-[28px] p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="eyebrow">Самовывоз — 0 ₽</p>
            <h2 className="font-display mt-2 text-2xl font-bold lg:text-3xl">
              Заберите сами и посмотрите растение вживую
            </h2>
            <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
              Питомник открыт ежедневно с 9:00 до 18:00. Соберём заказ к вашему приезду — обычно за
              день, в разгар сезона до двух. Можно выбрать конкретные экземпляры на месте, задать
              вопросы агроному и увидеть, как выглядит корневая система, до того как заплатите.
            </p>
            <ul className="mt-5 grid gap-2 text-sm">
              <li className="flex gap-2">
                <IconPin className="text-leaf size-5 shrink-0" /> {PICKUP.address}
              </li>
              <li className="flex gap-2">
                <IconClock className="text-leaf size-5 shrink-0" /> {PICKUP.hours} · {PICKUP.keep}
              </li>
            </ul>
          </div>
          <ButtonLink href="/catalog" size="l" className="justify-self-start lg:justify-self-end">
            Собрать заказ
          </ButtonLink>
        </div>
      </section>

      {/* 8. Акция и промокод */}
      <section className="shell section">
        <div className="border-leaf bg-leaf-soft/60 flex flex-wrap items-center gap-6 rounded-[28px] border border-dashed p-6 lg:p-8">
          <div className="flex-1">
            <p className="eyebrow">Акция месяца</p>
            <h2 className="font-display mt-2 text-2xl font-bold">Весенняя цена до 30 сентября</h2>
            <p className="text-ink-muted mt-2 max-w-2xl">
              Скидка 15 % на всю малину при заказе от 3 саженцев. Промокод суммируется со скидками
              на распродаже.
            </p>
          </div>
          <div className="text-center">
            <span className="border-leaf text-leaf-deep font-display inline-block rounded-2xl border-2 border-dashed bg-white px-6 py-3 text-2xl font-bold tracking-wider">
              ВЕСНА15
            </span>
            <p className="text-ink-muted mt-2 text-xs">Введите в корзине</p>
          </div>
          <ButtonLink href="/sale" variant="secondary" size="l">
            Все акции
          </ButtonLink>
        </div>
      </section>

      {/* 9. Отзывы */}
      <section className="bg-leaf-soft/50">
        <div className="shell section">
          <SectionHeading
            eyebrow="Отзывы"
            title="Что пишут покупатели"
            text="Отзывы переносим из сообщества ВКонтакте с разрешения авторов."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {REVIEWS_HOME.map((r) => (
              <figure key={r.author} className="card-surface flex flex-col p-5">
                <Rating value={r.rating} count={0} compact />
                <blockquote className="mt-3 flex-1 leading-relaxed">{r.text}</blockquote>
                <figcaption className="text-ink-muted mt-4 text-sm">
                  {r.author} · {r.region}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Советы */}
      <section className="shell section">
        <SectionHeading
          eyebrow="Советы"
          title="Как не загубить растение"
          action={{ href: "/care", label: "Все материалы" }}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {ARTICLES.map((a) => (
            <Link key={a.slug} href={`/care/${a.slug}`} className="card-surface hover:shadow-lift p-5 transition-shadow">
              <p className="eyebrow">{a.minutes} мин чтения</p>
              <h3 className="font-display mt-2 text-lg font-bold">{a.title}</h3>
              <p className="text-ink-muted mt-2 text-sm leading-relaxed">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 11. FAQ */}
      <section className="shell section pt-0">
        <SectionHeading eyebrow="Вопросы" title="Коротко о главном" />
        <Faq items={FAQ_ITEMS} />
      </section>

      {/* 12. CTA и подписка */}
      <section className="shell pb-16">
        <div className="bg-ink grid gap-6 rounded-[28px] p-8 text-white lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="font-display text-2xl font-bold lg:text-3xl">
              Сообщим, когда откроется отгрузка
            </h2>
            <p className="mt-3 leading-relaxed text-white/80">
              Одно письмо в начале сезона и одно, когда появятся редкие сорта. Без спама, отписка в один клик.
            </p>
          </div>
          <div className="self-center">
            <SubscribeForm />
            <p className="mt-3 text-sm text-white/60">
              Нажимая «Подписаться», вы соглашаетесь с политикой обработки персональных данных.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
