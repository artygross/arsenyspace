import Link from "next/link";
import { ActiveChips, CatalogSidebar, CatalogToolbar } from "./catalog-facets";
import { ProductGrid } from "./product-card";
import { Breadcrumbs, ButtonLink, EmptyState, Faq, SectionHeading } from "./ui";
import { activeChips, type CatalogResult, type Query, toSearchParams } from "@/lib/query";
import { CULTURES, type CultureMeta } from "@/lib/catalog";
import { FAQ_ITEMS } from "@/lib/content";

export function CatalogView({
  title,
  lead,
  seo,
  result,
  query,
  culture,
  basePath,
  crumbs,
}: {
  title: string;
  lead?: string;
  seo?: string;
  result: CatalogResult;
  query: Query;
  culture?: CultureMeta;
  basePath: string;
  crumbs: { href?: string; label: string }[];
}) {
  const cultureLocked = Boolean(culture);
  const chips = activeChips(
    cultureLocked ? { ...query, culture: [] } : query,
    CULTURES.map((c) => ({ key: c.key, name: c.name, slug: c.slug })),
  );
  const more = { ...query, page: query.page + 1 };
  const moreParams = toSearchParams(more, cultureLocked).toString();

  return (
    <div className="shell pb-16">
      <Breadcrumbs items={crumbs} />

      <header className="mb-6">
        <h1 className="font-display text-2xl leading-tight font-bold lg:text-4xl">{title}</h1>
        {lead && <p className="text-ink-muted mt-3 max-w-3xl leading-relaxed">{lead}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[264px_1fr] lg:gap-8">
        <CatalogSidebar facets={result.facets} cultureLocked={cultureLocked} sale={query.sale} />

        <div>
          <CatalogToolbar
            total={result.total}
            facets={result.facets}
            cultureLocked={cultureLocked}
            sale={query.sale}
            activeCount={chips.length}
          />
          <ActiveChips chips={chips} />

          {result.items.length === 0 ? (
            <EmptyState
              title="Под эти условия ничего не подошло"
              text="Попробуйте снять часть фильтров — например, ограничение по зимостойкости или фасовке."
              action={{ href: basePath, label: "Сбросить фильтры" }}
            />
          ) : (
            <>
              <ProductGrid products={result.items} />
              {result.shown < result.total && (
                <div className="mt-8 text-center">
                  <ButtonLink
                    href={`${basePath}${moreParams ? `?${moreParams}` : ""}`}
                    variant="secondary"
                    size="l"
                    scroll={false}
                  >
                    Показать ещё {Math.min(12, result.total - result.shown)} из {result.total}
                  </ButtonLink>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Перелинковка по культурам — и навигация, и SEO */}
      <nav aria-label="Другие культуры" className="mt-12">
        <p className="eyebrow mb-3">Смотрите также</p>
        <ul className="flex flex-wrap gap-2">
          {CULTURES.filter((c) => c.key !== culture?.key).map((c) => (
            <li key={c.key}>
              <Link
                href={`/catalog/${c.slug}`}
                className="card-surface hover:border-leaf inline-block px-4 py-2 text-sm"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {seo && (
        <section className="mt-12 max-w-3xl">
          <SectionHeading title={`О ${culture ? culture.genitive : "нашем каталоге"}`} />
          <p className="text-ink-muted leading-relaxed">{seo}</p>
        </section>
      )}

      <section className="mt-12">
        <SectionHeading title="Частые вопросы" />
        <Faq items={FAQ_ITEMS.slice(0, 4)} />
      </section>
    </div>
  );
}
