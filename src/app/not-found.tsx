import { ProductCard } from "@/components/product-card";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { PRODUCTS } from "@/lib/catalog";

export const metadata = { title: "Страница не найдена" };

export default function NotFound() {
  const popular = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);
  return (
    <div className="shell py-14 lg:py-24">
      <div className="max-w-xl">
        <p className="eyebrow">Ошибка 404</p>
        <h1 className="font-display mt-4 text-4xl lg:text-5xl">Такой страницы нет</h1>
        <p className="text-ink-muted mt-4 leading-relaxed">
          Возможно, модель распродана и её карточку убрали. Загляните в каталог — скорее всего,
          у того же бренда есть похожая оправа.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/catalog" size="l">
            В каталог
          </ButtonLink>
          <ButtonLink href="/finder" variant="secondary" size="l">
            Подобрать по форме лица
          </ButtonLink>
        </div>
      </div>

      <div className="mt-20">
        <SectionHeading eyebrow="Выбирают чаще всего" title="Хиты каталога" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {popular.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
