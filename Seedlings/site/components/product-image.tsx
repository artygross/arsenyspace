import Image from "next/image";
import { baseSlug, CULTURE_BY_KEY, type Product } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos.generated";
import { PlantArt } from "./plant-art";

export function photosOf(product: Product): string[] {
  return PHOTOS[baseSlug(product.slug)] ?? [];
}

/** Есть ли у сорта фотография — по этому же признаку решается, нужна ли подложка */
export function hasPhoto(product: Product): boolean {
  return photosOf(product).length > 0;
}

/**
 * Изображение товара: фотография, если она есть в /public/photos, иначе
 * параметрическая иллюстрация (решение D-13). Замена фотоконтентом — подстановка файлов,
 * а не переписывание компонентов: см. public/photos/README.md.
 *
 * Зелёная подложка нужна только иллюстрации: она рисуется на прозрачном фоне и без подложки
 * висит в пустоте. Под фотографией та же подложка вылезала цветной полосой по краям кадра.
 */
export function ProductImage({
  product,
  className = "",
  sizes = "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 320px",
  priority = false,
  decorative = false,
  index = 0,
}: {
  product: Product;
  className?: string;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  index?: number;
}) {
  const photos = photosOf(product);
  const photo = photos[index];

  if (!photo) {
    return <PlantArt product={product} className={className} decorative={decorative} />;
  }

  const culture = CULTURE_BY_KEY.get(product.culture)!;
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image
        src={photo}
        alt={decorative ? "" : `${culture.name} «${product.name}»`}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </span>
  );
}
