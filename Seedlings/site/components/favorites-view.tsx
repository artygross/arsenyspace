"use client";

import { ProductGrid } from "./product-card";
import { EmptyState } from "./ui";
import { getProduct } from "@/lib/catalog";
import { useFavorites } from "@/lib/wishlist";
import { plural } from "@/lib/format";

export function FavoritesView() {
  const slugs = useFavorites();
  const products = slugs.map((s) => getProduct(s)).filter((p) => p !== undefined);

  return (
    <div className="shell py-8 lg:py-10">
      <h1 className="font-display mb-6 text-3xl font-bold lg:text-4xl">
        Избранное{" "}
        {products.length > 0 && (
          <span className="text-ink-muted font-sans text-lg font-normal">
            {products.length} {plural(products.length, "сорт", "сорта", "сортов")}
          </span>
        )}
      </h1>

      {products.length === 0 ? (
        <EmptyState
          title="В избранном пусто"
          text="Нажимайте на сердечко в карточке сорта — вернётесь к подборке, когда откроется отгрузка."
          action={{ href: "/catalog", label: "Перейти в каталог" }}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
