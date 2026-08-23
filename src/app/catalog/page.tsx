import Link from "next/link";
import { CatalogView, headline } from "@/components/catalog-view";
import { parseQuery } from "@/lib/catalog";

export const metadata = { title: "Каталог солнцезащитных очков" };

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const sp = await searchParams;
  const q = parseQuery(sp);
  const { title, note } = headline(q);

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{title}</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl lg:text-5xl">{title}</h1>
        {note && <p className="text-ink-muted mt-3 leading-relaxed">{note}</p>}
      </header>

      <CatalogView q={q} />
    </div>
  );
}
