import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView } from "@/components/catalog-view";
import { CULTURES, CULTURE_BY_SLUG, countByCulture } from "@/lib/catalog";
import { parseQuery, runQuery } from "@/lib/query";

export function generateStaticParams() {
  return CULTURES.map((c) => ({ culture: c.slug }));
}

export async function generateMetadata(props: PageProps<"/catalog/[culture]">): Promise<Metadata> {
  const { culture } = await props.params;
  const meta = CULTURE_BY_SLUG.get(culture);
  if (!meta) return {};
  return {
    title: `${meta.name} — саженцы и рассада из питомника`,
    description: meta.seo,
    alternates: { canonical: `/catalog/${meta.slug}` },
  };
}

export default async function CulturePage(props: PageProps<"/catalog/[culture]">) {
  const { culture } = await props.params;
  const meta = CULTURE_BY_SLUG.get(culture);
  if (!meta) notFound();

  const params = await props.searchParams;
  const query = parseQuery(params, culture);
  const result = runQuery(
    query,
    CULTURES.map((c) => ({ key: c.key, name: c.name, slug: c.slug })),
  );
  const counts = countByCulture();

  return (
    <CatalogView
      title={`${meta.name}: ${counts[meta.key]} сортов`}
      lead={meta.lead}
      seo={meta.seo}
      result={result}
      query={query}
      culture={meta}
      basePath={`/catalog/${meta.slug}`}
      crumbs={[{ href: "/", label: "Главная" }, { href: "/catalog", label: "Каталог" }, { label: meta.name }]}
    />
  );
}
