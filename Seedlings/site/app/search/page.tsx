import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";
import { CULTURES } from "@/lib/catalog";
import { parseQuery, runQuery } from "@/lib/query";

export const metadata: Metadata = { title: "Поиск по каталогу", robots: { index: false } };

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const query = parseQuery(params);
  const result = runQuery(
    query,
    CULTURES.map((c) => ({ key: c.key, name: c.name, slug: c.slug })),
  );

  return (
    <CatalogView
      title={query.q ? `Поиск: «${query.q}»` : "Поиск по каталогу"}
      lead={
        query.q
          ? `Нашли ${result.total} совпадений по сортам, типам и описаниям.`
          : "Введите название сорта или раздела — например «ремонтантная малина» или «голубика»."
      }
      result={result}
      query={query}
      basePath={`/search?q=${encodeURIComponent(query.q)}`}
      crumbs={[{ href: "/", label: "Главная" }, { label: "Поиск" }]}
    />
  );
}
