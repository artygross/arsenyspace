import { EmptyState } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="shell py-16">
      <h1 className="font-display mb-6 text-3xl font-bold lg:text-4xl">Страница не найдена</h1>
      <EmptyState
        title="Здесь ничего не растёт"
        text="Возможно, сорт уехал в архив или ссылка устарела. Загляните в каталог — там 240 сортов."
        action={{ href: "/catalog", label: "В каталог" }}
      />
    </div>
  );
}
