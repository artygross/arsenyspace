import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionBuy } from "@/components/collection-buy";
import { ProductGrid } from "@/components/product-card";
import { Breadcrumbs, SectionHeading, TrustBlock } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { COLLECTIONS, COLLECTION_BY_SLUG, collectionItems } from "@/lib/collections";
import { CULTURE_BY_KEY, RIPENING_LABEL, shipsLabel } from "@/lib/catalog";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/collection/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const collection = COLLECTION_BY_SLUG.get(slug);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.seo,
    alternates: { canonical: `/collection/${collection.slug}` },
  };
}

export default async function CollectionPage(props: PageProps<"/collection/[slug]">) {
  const { slug } = await props.params;
  const collection = COLLECTION_BY_SLUG.get(slug);
  if (!collection) notFound();

  const items = collectionItems(collection);

  return (
    <div className="shell pb-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/catalog", label: "Каталог" },
          { label: collection.title },
        ]}
      />

      <header className="max-w-3xl">
        <p className="eyebrow">Подборка</p>
        <h1 className="font-display mt-2 text-2xl leading-tight font-bold lg:text-4xl">
          {collection.h1}
        </h1>
        <p className="text-ink-muted mt-3 leading-relaxed">{collection.lead}</p>
        <p className="text-leaf-deep mt-4 flex items-center gap-2 font-medium">
          <IconCheck className="size-5 shrink-0" />
          {collection.promise}
        </p>
      </header>

      <div className="mt-6">
        <CollectionBuy products={items} />
      </div>

      {/* Состав подборки: видно, за что отвечает каждая позиция */}
      <section className="mt-10">
        <SectionHeading title="Что входит и зачем" />
        <ol className="grid gap-3">
          {items.map((p, i) => (
            <li key={p.slug} className="card-surface flex flex-wrap items-center gap-4 p-4">
              <span className="bg-leaf-soft text-leaf-deep flex size-9 shrink-0 items-center justify-center rounded-full font-semibold">
                {i + 1}
              </span>
              <div className="min-w-48 flex-1">
                <Link href={`/product/${p.slug}`} className="hover:text-leaf font-medium">
                  {CULTURE_BY_KEY.get(p.culture)!.name} «{p.name}»
                </Link>
                <p className="text-ink-muted mt-0.5 text-sm">{p.short}</p>
              </div>
              <p className="text-ink-muted text-sm">
                {RIPENING_LABEL[p.ripening]} · {shipsLabel(p)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <SectionHeading title="Сорта подборки" action={{ href: "/catalog", label: "Весь каталог" }} />
        <ProductGrid products={items} />
      </section>

      <div className="mt-12">
        <TrustBlock />
      </div>

      <nav aria-label="Другие подборки" className="mt-12">
        <p className="eyebrow mb-3">Другие подборки</p>
        <ul className="grid gap-3 md:grid-cols-3">
          {COLLECTIONS.filter((c) => c.slug !== collection.slug).map((c) => (
            <li key={c.slug}>
              <Link href={`/collection/${c.slug}`} className="card-surface hover:border-leaf block h-full p-4">
                <p className="font-medium">{c.title}</p>
                <p className="text-ink-muted mt-1 text-sm">{c.promise}</p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
