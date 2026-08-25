import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog-view";
import { CULTURES, getProducts } from "@/lib/catalog";
import { parseQuery, runQuery } from "@/lib/query";

export const metadata: Metadata = {
  title: "Каталог рассады и саженцев",
  description:
    "240 сортов рассады и саженцев из собственного питомника: клубника, малина, смородина, крыжовник, жимолость, овощная и цветочная рассада. Фильтры по сроку созревания, зимостойкости и фасовке.",
};

export default async function CatalogPage(props: PageProps<"/catalog">) {
  const params = await props.searchParams;
  const query = parseQuery(params);
  const result = runQuery(
    query,
    CULTURES.map((c) => ({ key: c.key, name: c.name, slug: c.slug })),
  );

  return (
    <CatalogView
      title="Каталог рассады и саженцев"
      lead={`${getProducts().length} сортов из собственного питомника. У каждого указаны зимостойкость, срок созревания и дата ближайшей отгрузки.`}
      result={result}
      query={query}
      basePath="/catalog"
      crumbs={[{ href: "/", label: "Главная" }, { label: "Каталог" }]}
    />
  );
}
