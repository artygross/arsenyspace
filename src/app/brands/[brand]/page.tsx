import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { Glasses } from "@/components/glasses";
import {
  BRANDS,
  BRAND_INFO,
  PRODUCTS,
  SHAPE_LABEL,
  brandFromSlug,
  brandSlug,
  parseQuery,
} from "@/lib/catalog";
import { formatPrice, plural } from "@/lib/format";

export function generateStaticParams() {
  return BRANDS.map((brand) => ({ brand: brandSlug(brand) }));
}

export async function generateMetadata({ params }: PageProps<"/brands/[brand]">) {
  const { brand: slug } = await params;
  const brand = brandFromSlug(slug);
  if (!brand) return { title: "Бренд не найден" };
  return {
    title: `${brand} — солнцезащитные очки`,
    description: BRAND_INFO[brand]?.about,
  };
}

export default async function BrandPage({ params, searchParams }: PageProps<"/brands/[brand]">) {
  const { brand: slug } = await params;
  const brand = brandFromSlug(slug);
  if (!brand) notFound();

  const sp = await searchParams;
  const q = parseQuery(sp);
  const items = PRODUCTS.filter((p) => p.brand === brand);
  const info = BRAND_INFO[brand];
  const hero = items.find((p) => p.isBestseller) ?? items[0];
  const from = Math.min(...items.map((p) => p.price));
  const shapes = [...new Set(items.map((p) => p.shape))];

  return (
    <>
      {/* Имиджевый хедер бренда */}
      <section className="bg-surface-alt">
        <div className="shell py-8 lg:py-12">
          <nav aria-label="Хлебные крошки" className="text-ink-muted mb-8 text-xs">
            <Link href="/" className="hover:text-ink">
              Главная
            </Link>
            <span className="mx-2">/</span>
            <Link href="/brands" className="hover:text-ink">
              Бренды
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{brand}</span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow">
                {info?.country} · с {info?.founded}
              </p>
              <h1 className="font-display mt-4 text-5xl leading-[1.05] lg:text-6xl">{brand}</h1>
              {info && <p className="text-ink-muted mt-5 max-w-md leading-relaxed">{info.tagline}</p>}

              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
                <div>
                  <dt className="text-ink-muted text-xs">В каталоге</dt>
                  <dd className="mt-1 font-medium">
                    {items.length} {plural(items.length, "модель", "модели", "моделей")}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted text-xs">Цены</dt>
                  <dd className="mt-1 font-medium">от {formatPrice(from)}</dd>
                </div>
                <div>
                  <dt className="text-ink-muted text-xs">Формы</dt>
                  <dd className="mt-1 font-medium">
                    {shapes.map((s) => SHAPE_LABEL[s]).join(", ")}
                  </dd>
                </div>
              </dl>
            </div>

            <Link href={`/product/${hero.slug}`} className="group relative block">
              <div className="bg-surface relative aspect-4/3">
                <Glasses
                  shape={hero.shape}
                  frameHex={hero.variants[0].frameHex}
                  lensHex={hero.variants[0].lensHex}
                  className="absolute inset-0 m-auto w-[76%] transition-transform duration-500 group-hover:scale-105"
                  strokeWidth={4}
                />
              </div>
              <p className="mt-3 text-xs">
                <span className="eyebrow">Флагман</span>
                <span className="group-hover:text-accent mt-1 block font-medium">
                  {hero.model} → {formatPrice(hero.price)}
                </span>
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* О бренде */}
      {info && (
        <section className="shell py-14 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
            <h2 className="font-display text-2xl">О бренде</h2>
            <p className="max-w-2xl leading-relaxed">{info.about}</p>
          </div>
        </section>
      )}

      {/* Каталог бренда: фасет «Бренд» скрыт — он здесь предопределён */}
      <div className="shell pb-14 lg:pb-24">
        <CatalogView q={q} base={items} hideFacets={["brand"]}>
          <h2 className="font-display mb-6 text-3xl">Все модели {brand}</h2>
        </CatalogView>
      </div>
    </>
  );
}
