import type { Metadata } from "next";
import { ProductGrid } from "@/components/product-card";
import { Breadcrumbs, EmptyState, SectionHeading } from "@/components/ui";
import { onSale } from "@/lib/catalog";
import { PROMOS } from "@/lib/promo";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Акции и промокоды",
  description:
    "Действующие акции питомника: скидки на сорта сезона, промокоды на клубнику, бесплатная доставка от 3 000 ₽ и скидка за самовывоз.",
};

export default function SalePage() {
  const products = onSale(12);

  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Акции" }]} />
      <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">Акции и промокоды</h1>
      <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
        Скидки на сорта сезона и промокоды, которые можно применить в корзине. Промокод суммируется
        со скидкой распродажи — это сознательное решение: осенью важнее оборот партии, чем маржа с упаковки.
      </p>

      <section className="mt-8">
        <SectionHeading title="Промокоды" />
        <ul className="grid gap-4 md:grid-cols-2">
          {PROMOS.map((p) => (
            <li key={p.code} className="card-surface flex flex-col p-5">
              <p className="font-display text-xl font-bold">{p.title}</p>
              <p className="text-ink-muted mt-2 flex-1 text-sm leading-relaxed">{p.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="border-leaf text-leaf-deep inline-block rounded-xl border-2 border-dashed bg-white px-4 py-2 font-bold tracking-wider">
                  {p.code}
                </span>
                <span className="text-ink-muted text-sm">действует до {formatDate(p.until)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Сорта со скидкой"
          text="Цена снижена на партии, которые нужно отдать в этом окне отгрузки."
          action={{ href: "/catalog?sale=1", label: "Все со скидкой" }}
        />
        {products.length === 0 ? (
          <EmptyState
            title="Сейчас скидок нет"
            text="Подпишитесь на письма — сообщим, когда откроется распродажа партии."
            action={{ href: "/catalog", label: "В каталог" }}
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
