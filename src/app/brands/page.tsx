import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/ui";
import { BRANDS, BRAND_INFO, PRODUCTS, brandSlug } from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";

export const metadata = { title: "Бренды" };

export default function BrandsPage() {
  const brands = BRANDS.map((brand) => {
    const items = PRODUCTS.filter((p) => p.brand === brand);
    return {
      brand,
      slug: brandSlug(brand),
      tagline: BRAND_INFO[brand]?.tagline ?? "",
      count: items.length,
      from: Math.min(...items.map((p) => p.price)),
      collections: [...new Set(items.map((p) => p.collection))],
      hero: items.find((p) => p.isBestseller) ?? items[0],
    };
  });

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Бренды</span>
      </nav>

      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl lg:text-5xl">Бренды каталога</h1>
        <p className="text-ink-muted mt-4 leading-relaxed">
          Мы работаем напрямую с производителями и официальными дистрибьюторами. На каждую
          пару выдаётся сертификат подлинности и двухлетняя гарантия.
        </p>
      </header>

      <ul className="divide-line divide-y border-line border-y">
        {brands.map((b) => (
          <li key={b.brand}>
            <Link
              href={`/brands/${b.slug}`}
              className="hover:bg-surface-alt group flex flex-wrap items-baseline gap-x-6 gap-y-2 px-2 py-6 transition-colors"
            >
              <span className="font-display group-hover:text-accent w-56 text-2xl">{b.brand}</span>
              <span className="text-ink-muted flex-1 text-sm">{b.tagline || b.collections.join(" · ")}</span>
              <span className="text-sm">
                {b.count} {plural(b.count, "модель", "модели", "моделей")}
              </span>
              <span className="text-ink-muted w-32 text-right text-sm">от {formatPrice(b.from)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-20">
        <SectionHeading eyebrow="По одной из каждого" title="Флагманы брендов" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
          {brands.map((b) => (
            <ProductCard key={b.brand} product={b.hero} />
          ))}
        </div>
      </section>
    </div>
  );
}
