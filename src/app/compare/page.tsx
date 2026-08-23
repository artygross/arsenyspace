import Link from "next/link";
import { CompareTable, EmptyCompare } from "@/components/compare-table";
import { COMPARE_LIMIT } from "@/lib/compare-shared";
import { getProduct } from "@/lib/catalog";

export const metadata = {
  title: "Сравнение моделей",
  description: "Сравните до четырёх оправ по форме, размерам, материалу и типу линзы.",
};

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.items) ? sp.items[0] : sp.items;

  // Список живёт в URL — сравнение шарится ссылкой, как и выдача каталога
  const slugs = (raw ?? "").split(",").filter(Boolean).slice(0, COMPARE_LIMIT);
  const products = slugs.flatMap((slug) => {
    const p = getProduct(slug);
    return p ? [p] : [];
  });

  if (products.length === 0) return <EmptyCompare />;

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/catalog" className="hover:text-ink">
          Каталог
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Сравнение</span>
      </nav>

      <CompareTable products={products} />
    </div>
  );
}
