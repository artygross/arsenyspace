import Link from "next/link";
import { Glasses, ShapeIcon } from "@/components/glasses";
import { ProductCard } from "@/components/product-card";
import { ButtonLink, SectionHeading, TrustBlock } from "@/components/ui";
import {
  BRANDS,
  PRODUCTS,
  SHAPES,
  SHAPE_LABEL,
  brandSlug,
  filterProducts,
  parseQuery,
} from "@/lib/catalog";
import { plural } from "@/lib/format";

export default function HomePage() {
  const base = parseQuery({});
  const isNew = filterProducts({ ...base, sort: "new" }).filter((p) => p.isNew).slice(0, 4);
  const sale = filterProducts({ ...base, sale: true, sort: "popular" }).slice(0, 4);
  const hero = PRODUCTS.find((p) => p.slug === "meridian-cassini-01") ?? PRODUCTS[0];

  return (
    <>
      {/* Hero-кампания */}
      <section className="bg-surface-alt relative overflow-hidden">
        <div className="shell grid items-center gap-10 py-14 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="rise">
            <p className="eyebrow">Коллекция Horizon SS26</p>
            <h1 className="font-display mt-4 text-5xl leading-[1.05] sm:text-6xl xl:text-7xl">
              Свет, который
              <br />
              вы выбираете сами
            </h1>
            <p className="text-ink-muted mt-6 max-w-md leading-relaxed">
              {BRANDS.length} {plural(BRANDS.length, "бренд", "бренда", "брендов")},{" "}
              {PRODUCTS.length} {plural(PRODUCTS.length, "модель", "модели", "моделей")} в наличии. Поляризация,
              фотохром и градиент — с примеркой формы до покупки.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/catalog" size="l">
                Смотреть каталог
              </ButtonLink>
              <ButtonLink href="/finder" variant="secondary" size="l">
                Подобрать по форме лица
              </ButtonLink>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto aspect-square max-w-lg">
              <div className="bg-surface absolute inset-0 m-auto aspect-square w-[85%] rounded-full" />
              <Glasses
                shape={hero.shape}
                frameHex={hero.variants[0].frameHex}
                lensHex={hero.variants[0].lensHex}
                className="absolute inset-0 m-auto w-[90%]"
                strokeWidth={4}
              />
            </div>
            <Link
              href={`/product/${hero.slug}`}
              className="border-line bg-surface absolute right-0 bottom-2 border px-4 py-3 text-xs hover:border-ink lg:right-6"
            >
              <span className="tracking-[0.14em] uppercase">{hero.brand}</span>
              <span className="mt-0.5 block font-medium">{hero.model} →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Быстрый вход по форме оправы */}
      <section className="shell section">
        <SectionHeading
          eyebrow="Начните с формы"
          title="Выберите силуэт"
          action={{ href: "/catalog", label: "Все модели" }}
        />
        <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4 lg:grid-cols-8">
          {SHAPES.map((s) => (
            <li key={s}>
              <Link
                href={`/catalog?shape=${s}`}
                className="bg-surface hover:bg-surface-alt group flex flex-col items-center gap-3 px-2 py-6 transition-colors"
              >
                <ShapeIcon shape={s} className="text-ink-muted group-hover:text-accent h-9 w-full transition-colors" />
                <span className="text-center text-xs leading-tight">{SHAPE_LABEL[s]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Новинки */}
      <section className="shell pb-14 lg:pb-24">
        <SectionHeading
          eyebrow="Только привезли"
          title="Новинки сезона"
          action={{ href: "/catalog?sort=new", label: "Все новинки" }}
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {isNew.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Промо квиза подбора */}
      <section className="bg-ink text-white">
        <div className="shell grid items-center gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <p className="text-[11px] tracking-[0.18em] text-white/50 uppercase">Подбор за минуту</p>
            <h2 className="font-display mt-4 text-4xl leading-tight lg:text-5xl">
              Очки идут не всем.
              <br />
              Вам подойдут эти.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-white/65">
              Четыре вопроса о форме лица, посадке и бюджете — и каталог перестраивается
              под вас. Никаких обязательств: результат остаётся обычной выдачей, из которой
              вы выбираете сами.
            </p>
            <ButtonLink
              href="/finder"
              size="l"
              className="mt-8 border border-white bg-white text-ink hover:bg-transparent hover:text-white"
            >
              Пройти подбор
            </ButtonLink>
          </div>
          <ol className="grid gap-px bg-white/15 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
            {[
              ["01", "Форма лица", "Пять типов с иллюстрациями — выбираете глазами, а не по описанию"],
              ["02", "Стиль", "Классика, минимализм, характерная форма или спорт"],
              ["03", "Размер", "Подсказка, как измерить свою нынешнюю оправу за 10 секунд"],
              ["04", "Бюджет", "Диапазон, за который не хотите выходить"],
            ].map(([n, t, d]) => (
              <li key={n} className="bg-ink p-6">
                <span className="text-accent text-xs tracking-widest">{n}</span>
                <p className="mt-3 font-medium">{t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Бренды */}
      <section className="shell section">
        <SectionHeading eyebrow="Официальный дилер" title="Бренды каталога" action={{ href: "/brands", label: "Все бренды" }} />
        <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4 lg:grid-cols-8">
          {BRANDS.map((b) => (
            <li key={b}>
              <Link
                href={`/brands/${brandSlug(b)}`}
                className="bg-surface hover:bg-surface-alt font-display flex h-24 items-center justify-center px-3 text-center text-sm transition-colors lg:h-28 lg:text-base"
              >
                {b}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Sale */}
      {sale.length > 0 && (
        <section className="shell pb-14 lg:pb-24">
          <SectionHeading
            eyebrow="Конец сезона"
            title="Со скидкой"
            action={{ href: "/catalog?sale=1", label: "Весь sale" }}
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {sale.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Доверие */}
      <section className="bg-surface-alt">
        <div className="shell py-14 lg:py-20">
          <TrustBlock />
        </div>
      </section>
    </>
  );
}
