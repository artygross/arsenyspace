import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductReviews } from "@/components/product-reviews";
import { ProductGrid } from "@/components/product-card";
import { Badge, Breadcrumbs, Rating, SectionHeading, TrustBlock, productBadges } from "@/components/ui";
import { BreadcrumbsLd, ProductLd } from "@/components/structured-data";
import { IconClock, IconPin, IconShield, IconSnow, IconSun, IconTruck } from "@/components/icons";
import {
  CULTURE_BY_KEY,
  RIPENING_LABEL,
  CONTAINER_LABEL,
  MONTHS,
  alsoBuy,
  getProduct,
  getProducts,
  plantingLabel,
  related,
} from "@/lib/catalog";
import { PICKUP } from "@/lib/delivery";
import { sku } from "@/lib/sku";

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  const culture = CULTURE_BY_KEY.get(product.culture)!;
  return {
    title: `${culture.name} «${product.name}» — купить в питомнике`,
    description: `${product.short}. ${RIPENING_LABEL[product.ripening]} срок, зимостойкость до ${product.hardiness} °C, урожайность ${product.yieldPerBush}. Гарантия приживаемости 14 дней.`,
    alternates: { canonical: `/product/${product.slug}` },
  };
}

export default async function ProductPage(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const culture = CULTURE_BY_KEY.get(product.culture)!;
  const badges = productBadges(product);
  const specs: { label: string; value: string }[] = [
    { label: "Культура", value: culture.name },
    { label: "Тип", value: product.kind },
    { label: "Срок созревания", value: RIPENING_LABEL[product.ripening] },
    ...(product.hardiness < 0
      ? [{ label: "Зимостойкость", value: `до ${product.hardiness} °C` }]
      : [{ label: "Условия", value: "Теплолюбивая культура, высадка после заморозков" }]),
    { label: "Урожайность", value: product.yieldPerBush },
    { label: "Размер плода", value: product.fruitSize },
    { label: "Высота растения", value: product.height },
    { label: "Свет", value: product.sun },
    { label: "Окно посадки", value: plantingLabel(product) },
    { label: "Фасовка", value: CONTAINER_LABEL[product.container] },
    { label: "Артикул", value: sku(product.slug) },
  ];

  return (
    <div className="shell pb-16">
      <ProductLd product={product} />
      <BreadcrumbsLd
        items={[
          { href: "/", label: "Главная" },
          { href: "/catalog", label: "Каталог" },
          { href: `/catalog/${culture.slug}`, label: culture.name },
          { href: `/product/${product.slug}`, label: product.name },
        ]}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/catalog", label: "Каталог" },
          { href: `/catalog/${culture.slug}`, label: culture.name },
          { label: product.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:gap-10">
        <div>
          <div className="bg-leaf-soft relative overflow-hidden rounded-[28px]">
            <ProductImage product={product} className="h-72 w-full lg:h-[460px]" sizes="(max-width: 1024px) 100vw, 620px" priority />
            {badges.length > 0 && (
              <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                {badges.map((b) => (
                  <Badge key={b.label} tone={b.tone}>
                    {b.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <p className="text-ink-muted mt-3 text-sm">
            Иллюстрация сорта. Фотосъёмку заменим на реальные кадры растения, корневой системы
            и урожая — см. docs/05-ui-system.md §10.
          </p>
        </div>

        <div>
          <p className="eyebrow">{culture.name} · {product.kind}</p>
          <h1 className="font-display mt-2 text-3xl leading-tight font-bold lg:text-4xl">
            {product.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <a href="#reviews" className="hover:text-leaf">
              <Rating value={product.rating} count={product.reviewCount} />
            </a>
          </div>
          <p className="mt-4 leading-relaxed">{product.short}.</p>

          <div className="mt-6">
            <ProductPurchase product={product} />
          </div>

          <ul className="mt-4 grid gap-2 text-sm">
            <li className="flex items-start gap-2">
              <IconTruck className="text-leaf size-5 shrink-0" />
              Доставка от 300 ₽, бесплатно от 5 000 ₽. Термокороб и влагоудерживающий гель — в цене.
            </li>
            <li className="flex items-start gap-2">
              <IconPin className="text-leaf size-5 shrink-0" />
              Самовывоз 0 ₽: {PICKUP.address}
            </li>
            <li className="flex items-start gap-2">
              <IconShield className="text-leaf size-5 shrink-0" />
              Гарантия приживаемости 14 дней: не прижилось — заменим или вернём деньги.
            </li>
          </ul>
        </div>
      </div>

      {/* Характеристики */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <h2 className="font-display text-2xl font-bold">Характеристики сорта</h2>
          <dl className="divide-line card-surface mt-4 divide-y">
            {specs.map((s) => (
              <div key={s.label} className="flex gap-4 px-5 py-3 text-sm">
                <dt className="text-ink-muted w-44 shrink-0">{s.label}</dt>
                <dd className="font-medium">{s.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="font-display mt-10 text-2xl font-bold">Описание</h2>
          <p className="mt-3 leading-relaxed">{product.description}</p>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold">Посадка и уход</h2>
          <ol className="mt-4 grid gap-3">
            {product.care.map((step, i) => (
              <li key={step} className="card-surface flex gap-3 p-4">
                <span className="bg-leaf-soft text-leaf-deep flex size-8 shrink-0 items-center justify-center rounded-full font-semibold">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>

          <div className="bg-sand/60 mt-4 grid gap-3 rounded-2xl p-4 text-sm">
            <p className="flex items-center gap-2">
              <IconClock className="text-leaf size-5" />
              Окно посадки: {plantingLabel(product)}
            </p>
            <p className="flex items-center gap-2">
              <IconSun className="text-leaf size-5" />
              {product.sun}
            </p>
            {product.hardiness < 0 && (
              <p className="flex items-center gap-2">
                <IconSnow className="text-leaf size-5" />
                Переносит мороз до {product.hardiness} °C
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="mt-12">
        <TrustBlock />
      </div>

      <div className="mt-14">
        <ProductReviews
          slug={product.slug}
          reviews={product.reviews}
          rating={product.rating}
          count={product.reviewCount}
        />
      </div>

      {/* Допродажа комплектом — docs/02-analysis.md §1 */}
      <section className="mt-14">
        <SectionHeading
          eyebrow="Собрать грядку"
          title="С этим сортом берут"
          text="Разный срок созревания на одной грядке растягивает урожай на всё лето."
        />
        <ProductGrid products={alsoBuy(product, 4)} />
      </section>

      <section className="mt-14">
        <SectionHeading title={`Похожие сорта ${culture.genitive}`} action={{ href: `/catalog/${culture.slug}`, label: "Все сорта" }} />
        <ProductGrid products={related(product, 4)} />
      </section>

      <p className="text-ink-muted mt-10 text-xs">
        Ближайшая отгрузка партии: {new Date(product.shipsFrom).getDate()}{" "}
        {MONTHS[new Date(product.shipsFrom).getMonth()]}. Даты приходят из учётной системы.
      </p>
    </div>
  );
}
