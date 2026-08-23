import Link from "next/link";
import { CatalogView } from "@/components/catalog-view";
import { parseQuery } from "@/lib/catalog";

export const metadata = { title: "Поиск" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = parseQuery(sp);

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Поиск</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Результаты поиска</p>
        <h1 className="font-display mt-3 text-4xl lg:text-5xl">
          {q.q ? `«${q.q}»` : "Что ищете?"}
        </h1>
        {!q.q && (
          <p className="text-ink-muted mt-3 leading-relaxed">
            Введите бренд, форму оправы или тип линзы — например, «авиаторы» или «поляризация».
          </p>
        )}
      </header>

      {/* Та же система фильтров, что и в каталоге — запрос просто ещё одно условие */}
      <CatalogView q={q} />
    </div>
  );
}
