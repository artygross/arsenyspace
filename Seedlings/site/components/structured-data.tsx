import { CULTURE_BY_KEY, RIPENING_LABEL, type Product } from "@/lib/catalog";
import { COMPANY } from "@/lib/content";
import type { Article } from "@/lib/articles";

const SITE = "https://polesie.example";

/**
 * Микроразметка. Рекомендация Next: рендерить JSON-LD тегом <script> прямо на странице,
 * экранируя «<» — иначе строка из данных может вынести разметку.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function OrganizationLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "GardenStore",
        name: COMPANY.name,
        url: SITE,
        telephone: COMPANY.phone,
        email: COMPANY.email,
        sameAs: [COMPANY.vk],
        address: {
          "@type": "PostalAddress",
          streetAddress: "д. Воронкино, ул. Луговая, 36",
          addressLocality: "Ломоносовский район",
          addressRegion: "Ленинградская область",
          addressCountry: "RU",
        },
      }}
    />
  );
}

export function BreadcrumbsLd({ items }: { items: { href: string; label: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.label,
          item: `${SITE}${item.href}`,
        })),
      }}
    />
  );
}

export function FaqLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }}
    />
  );
}

const AVAILABILITY_SCHEMA = {
  in_stock: "https://schema.org/InStock",
  preorder: "https://schema.org/PreOrder",
  out_of_season: "https://schema.org/OutOfStock",
} as const;

export function ProductLd({ product }: { product: Product }) {
  const culture = CULTURE_BY_KEY.get(product.culture)!;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: `${culture.name} «${product.name}»`,
        description: product.description,
        category: culture.name,
        additionalProperty: [
          { "@type": "PropertyValue", name: "Срок созревания", value: RIPENING_LABEL[product.ripening] },
          ...(product.hardiness < 0
            ? [{ "@type": "PropertyValue", name: "Зимостойкость", value: `${product.hardiness} °C` }]
            : []),
          { "@type": "PropertyValue", name: "Урожайность", value: product.yieldPerBush },
        ],
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "RUB",
          availability: AVAILABILITY_SCHEMA[product.availability],
          url: `${SITE}/product/${product.slug}`,
          seller: { "@type": "Organization", name: COMPANY.name },
        },
        // Рейтинг и отзывы попадают в разметку только когда они настоящие:
        // размечать несуществующие оценки — это и обман покупателя, и нарушение правил Google
        ...(product.reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewCount,
              },
              review: product.reviews.slice(0, 3).map((r) => ({
                "@type": "Review",
                author: { "@type": "Person", name: r.author },
                datePublished: r.date,
                reviewBody: r.text,
                reviewRating: { "@type": "Rating", ratingValue: r.rating },
              })),
            }
          : {}),
      }}
    />
  );
}

export function ArticleLd({ article }: { article: Article }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.h1,
        description: article.excerpt,
        datePublished: article.published,
        author: { "@type": "Organization", name: COMPANY.name },
        publisher: { "@type": "Organization", name: COMPANY.name },
        mainEntityOfPage: `${SITE}/care/${article.slug}`,
      }}
    />
  );
}

export function ItemListLd({ products, path }: { products: Product[]; path: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        url: `${SITE}${path}`,
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE}/product/${p.slug}`,
          name: p.name,
        })),
      }}
    />
  );
}
