import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductBuy } from "@/components/product-detail";
import { ProductReviews } from "@/components/product-reviews";
import { SectionHeading, TrustBlock } from "@/components/ui";
import {
  FACE_LABEL,
  GENDER_LABEL,
  LENS_LABEL,
  MATERIAL_LABEL,
  PRODUCTS,
  SHAPE_LABEL,
  SIZE_LABEL,
  brandSlug,
  getProduct,
  similarTo,
} from "@/lib/catalog";


export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Модель не найдена" };
  return {
    title: `${p.brand} ${p.model} — ${SHAPE_LABEL[p.shape].toLowerCase()}`,
    description: p.description,
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const similar = similarTo(product);

  return (
    <>
      <div className="shell py-8 lg:py-12">
        <nav aria-label="Хлебные крошки" className="text-ink-muted mb-8 text-xs">
          <Link href="/" className="hover:text-ink">
            Главная
          </Link>
          <span className="mx-2">/</span>
          <Link href="/catalog" className="hover:text-ink">
            Каталог
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/catalog?shape=${product.shape}`} className="hover:text-ink">
            {SHAPE_LABEL[product.shape]}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.model}</span>
        </nav>

        <ProductBuy product={product} />
      </div>

      {/* Доверие */}
      <div className="shell pb-14 lg:pb-20">
        <TrustBlock />
      </div>

      {/* Характеристики */}
      <section className="bg-surface-alt">
        <div className="shell section grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl">Характеристики</h2>
            <p className="text-ink-muted mt-3 max-w-sm text-sm leading-relaxed">
              Полный набор параметров модели. Все значения — те же, по которым работают фильтры
              каталога.
            </p>
          </div>
          <dl className="divide-line divide-y text-sm">
            <Spec label="Бренд" value={product.brand} href={`/brands/${brandSlug(product.brand)}`} />
            <Spec label="Коллекция" value={product.collection} />
            <Spec label="Форма оправы" value={SHAPE_LABEL[product.shape]} href={`/catalog?shape=${product.shape}`} />
            <Spec label="Материал" value={MATERIAL_LABEL[product.material]} />
            <Spec label="Кому" value={GENDER_LABEL[product.gender]} />
            <Spec label="Тип линзы" value={product.lensTypes.map((l) => LENS_LABEL[l]).join(", ")} />
            <Spec label="Защита" value={`UV400 · категория светопропускания ${product.lensCategory}`} />
            <Spec
              label="Размеры"
              value={`${product.dimensions.lens}□${product.dimensions.bridge}-${product.dimensions.temple} мм · ${SIZE_LABEL[product.size]}`}
            />
            <Spec
              label="Подойдут лицу"
              value={product.faceShapes.map((f) => FACE_LABEL[f].toLowerCase()).join(", ")}
              href={`/catalog?face=${product.faceShapes[0]}`}
            />
            <Spec label="В комплекте" value="Жёсткий футляр, салфетка из микрофибры, сертификат" />
          </dl>
        </div>
      </section>

      <ProductReviews product={product} />

      {/* Похожие */}
      <section className="shell pb-14 lg:pb-24">
        <SectionHeading eyebrow="Тот же силуэт" title="Похожие модели" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {similar.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}

function Spec({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex justify-between gap-6 py-3.5">
      <dt className="text-ink-muted shrink-0">{label}</dt>
      <dd className="text-right">
        {href ? (
          <Link href={href} className="hover:text-accent underline-offset-4 hover:underline">
            {value}
          </Link>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
