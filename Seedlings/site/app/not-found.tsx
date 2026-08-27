import { EmptyState } from "@/components/ui";
import { getProducts } from "@/lib/catalog";
import { plural } from "@/lib/format";

export default function NotFound() {
  // Число сортов берём из каталога: вписанное руками оно устаревает с первой же правкой ассортимента
  const count = getProducts().length;
  return (
    <div className="shell py-16">
      <h1 className="font-display mb-6 text-3xl font-bold lg:text-4xl">Страница не найдена</h1>
      <EmptyState
        title="Здесь ничего не растёт"
        text={`Возможно, сорт уехал в архив или ссылка устарела. Загляните в каталог — там ${count} ${plural(count, "сорт", "сорта", "сортов")}.`}
        action={{ href: "/catalog", label: "В каталог" }}
      />
    </div>
  );
}
