import Link from "next/link";
import {
  CULTURE_BY_KEY,
  keyTrait,
  packLabel,
  pricePerUnit,
  shipsLabel,
  type Product,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { AddToCartButton, FavoriteButton } from "./add-to-cart";
import { CompareToggle } from "./compare-toggle";
import { ProductImage } from "./product-image";
import { Badge, Price, productBadges } from "./ui";

/** Карточка каталога — спецификация в docs/05-ui-system.md §6 */
export function ProductCard({ product }: { product: Product }) {
  const culture = CULTURE_BY_KEY.get(product.culture)!;
  const badges = productBadges(product);

  return (
    <article className="card-surface group hover:shadow-lift relative isolate flex flex-col overflow-hidden transition-all duration-150 hover:-translate-y-0.5">
      <div className="bg-leaf-soft relative">
        <Link href={`/product/${product.slug}`} className="block" tabIndex={-1} aria-hidden="true">
          <ProductImage product={product} className="h-44 w-full sm:h-52" decorative />
        </Link>
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.tone}>
                {b.label}
              </Badge>
            ))}
          </div>
        )}
        <FavoriteButton slug={product.slug} className="absolute top-3 right-3 z-20" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow">{culture.name}</p>
        <h3 className="mt-1 font-medium">
          <Link href={`/product/${product.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {product.name}
          </Link>
        </h3>
        <p className="text-ink-muted mt-1 text-sm">{keyTrait(product)}</p>
        <p className="text-ink-muted mt-0.5 text-sm">{packLabel(product)}</p>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
          <Price value={product.price} oldValue={product.oldPrice} />
          {product.packSize > 1 && (
            <span className="text-ink-muted text-xs">{formatPrice(pricePerUnit(product))}/шт.</span>
          )}
        </div>

        <p
          className={`mt-2 text-xs ${
            product.availability === "in_stock"
              ? "text-leaf"
              : product.availability === "preorder"
                ? "text-sun"
                : "text-ink-muted"
          }`}
        >
          {shipsLabel(product)}
        </p>

        <div className="relative z-20 mt-auto pt-4">
          <AddToCartButton product={product} className="w-full" />
          <CompareToggle slug={product.slug} className="mt-2 w-full justify-center" />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
