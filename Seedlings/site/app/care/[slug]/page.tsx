import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, ButtonLink, SectionHeading } from "@/components/ui";
import { ArticleLd, BreadcrumbsLd } from "@/components/structured-data";
import { ProductGrid } from "@/components/product-card";
import { IconCheck } from "@/components/icons";
import { ARTICLES, ARTICLE_BY_SLUG } from "@/lib/articles";
import { CULTURE_BY_SLUG, getProducts } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: PageProps<"/care/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const article = ARTICLE_BY_SLUG.get(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/care/${article.slug}` },
  };
}

export default async function ArticlePage(props: PageProps<"/care/[slug]">) {
  const { slug } = await props.params;
  const article = ARTICLE_BY_SLUG.get(slug);
  if (!article) notFound();

  const cultureSlug = article.cta.href.split("/").pop() ?? "";
  const culture = CULTURE_BY_SLUG.get(cultureSlug);
  const picks = culture
    ? getProducts()
        .filter((p) => p.culture === culture.key && p.availability !== "out_of_season")
        .sort((a, b) => Number(b.isHit) - Number(a.isHit) || b.rating - a.rating)
        .slice(0, 4)
    : [];

  return (
    <div className="shell pb-16">
      <ArticleLd article={article} />
      <BreadcrumbsLd
        items={[
          { href: "/", label: "Главная" },
          { href: "/care", label: "Советы" },
          { href: `/care/${article.slug}`, label: article.title },
        ]}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Главная" },
          { href: "/care", label: "Советы" },
          { label: article.title },
        ]}
      />

      <article className="max-w-3xl">
        <p className="eyebrow">
          {formatDate(article.published)} · {article.minutes} мин чтения
        </p>
        <h1 className="font-display mt-2 text-2xl leading-tight font-bold lg:text-4xl">{article.h1}</h1>
        <p className="mt-4 text-lg leading-relaxed">{article.intro}</p>

        {article.sections.map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="font-display text-xl font-bold lg:text-2xl">{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mt-3 leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}

        <p className="bg-leaf-soft/60 mt-8 flex gap-3 rounded-2xl p-5 leading-relaxed">
          <IconCheck className="text-leaf mt-0.5 size-5 shrink-0" />
          <span>
            <b>Коротко: </b>
            {article.takeaway}
          </span>
        </p>

        <ButtonLink href={article.cta.href} size="l" className="mt-6">
          {article.cta.label}
        </ButtonLink>
      </article>

      {picks.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            eyebrow="Из каталога"
            title={`Сорта ${culture!.genitive} в наличии`}
            action={{ href: article.cta.href, label: "Все сорта" }}
          />
          <ProductGrid products={picks} />
        </section>
      )}

      <nav aria-label="Другие материалы" className="mt-14">
        <p className="eyebrow mb-3">Читайте также</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {ARTICLES.filter((a) => a.slug !== article.slug).map((a) => (
            <li key={a.slug}>
              <Link href={`/care/${a.slug}`} className="card-surface hover:border-leaf block h-full p-4">
                <p className="font-medium">{a.title}</p>
                <p className="text-ink-muted mt-1 text-sm">{a.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
