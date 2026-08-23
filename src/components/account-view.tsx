"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { useFinderResult } from "@/components/finder-store";
import { Glasses } from "@/components/glasses";
import { ProductCard } from "@/components/product-card";
import { useReviews } from "@/components/reviews";
import { Button, ButtonLink, Price, Rating, SectionHeading } from "@/components/ui";
import { useWishlist } from "@/components/wishlist";
import { FACE_LABEL, SHAPE_LABEL, getProduct } from "@/lib/catalog";
import { ADDRESSES, ORDERS, ORDER_STATUS } from "@/lib/orders";
import { formatDate, formatPrice, plural } from "@/lib/format";

const SECTIONS = [
  { id: "orders", title: "Заказы" },
  { id: "wishlist", title: "Избранное" },
  { id: "reviews", title: "Мои отзывы" },
  { id: "finder", title: "Мой подбор" },
  { id: "addresses", title: "Адреса" },
];

export function AccountView() {
  const wishlist = useWishlist();
  const reviews = useReviews();
  const finder = useFinderResult();

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Личный кабинет</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[220px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <h1 className="font-display text-3xl">Кабинет</h1>
          <p className="text-ink-muted mt-2 text-xs leading-relaxed">
            Демонстрационный проект: заказы и адреса — примеры, избранное и отзывы настоящие
            и хранятся в этом браузере.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-ink-muted hover:text-ink">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-16">
          <Orders />
          <WishlistSection
            count={wishlist.ready ? wishlist.count : 0}
            products={wishlist.ready ? wishlist.products.slice(0, 4) : []}
          />
          <MyReviews reviews={reviews.ready ? reviews.all : []} onRemove={reviews.remove} />
          <FinderSection params={finder?.params} savedAt={finder?.savedAt} />
          <Addresses />
        </div>
      </div>
    </div>
  );
}

function Orders() {
  const { add } = useCart();

  return (
    <section id="orders" className="scroll-mt-24">
      <h2 className="font-display text-3xl">Заказы</h2>

      <ul className="mt-6 space-y-4">
        {ORDERS.map((order) => {
          const lines = order.lines.flatMap((l) => {
            const product = getProduct(l.slug);
            const variant = product?.variants.find((v) => v.id === l.variantId);
            return product && variant ? [{ ...l, product, variant }] : [];
          });
          const total = lines.reduce((n, l) => n + l.product.price * l.qty, 0);
          const status = ORDER_STATUS[order.status];

          return (
            <li key={order.number} className="border-line border p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div>
                  <p className="font-medium">№ {order.number}</p>
                  <p className="text-ink-muted mt-1 text-xs">
                    {formatDate(order.date)} · {order.delivery}
                  </p>
                </div>
                <p className={`text-sm ${status.tone}`}>{status.label}</p>
                <p className="text-sm font-medium">{formatPrice(total)}</p>
              </div>

              <ul className="mt-5 flex flex-wrap gap-4">
                {lines.map((l) => (
                  <li key={l.slug} className="flex items-center gap-3">
                    <Link href={`/product/${l.slug}`} className="bg-surface-alt relative block aspect-4/3 w-20">
                      <Glasses
                        shape={l.product.shape}
                        frameHex={l.variant.frameHex}
                        lensHex={l.variant.lensHex}
                        className="absolute inset-0 m-auto w-[84%]"
                        strokeWidth={8}
                      />
                    </Link>
                    <span className="text-xs">
                      <span className="block font-medium">{l.product.model}</span>
                      <span className="text-ink-muted block">{l.product.brand}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  size="s"
                  variant="secondary"
                  onClick={() => lines.forEach((l) => add(l.slug, l.variantId, l.qty))}
                >
                  Повторить заказ
                </Button>
                {order.status === "shipping" && (
                  <Button size="s" variant="ghost">
                    Отследить
                  </Button>
                )}
                {order.status === "delivered" && (
                  <ButtonLink size="s" variant="ghost" href={`/product/${lines[0]?.slug}#reviews`}>
                    Оставить отзыв
                  </ButtonLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function WishlistSection({
  count,
  products,
}: {
  count: number;
  products: ReturnType<typeof useWishlist>["products"];
}) {
  return (
    <section id="wishlist" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl">
          Избранное {count > 0 && <span className="text-ink-muted text-xl">{count}</span>}
        </h2>
        {count > 4 && (
          <Link
            href="/account/wishlist"
            className="border-ink border-b pb-1 text-sm hover:border-accent hover:text-accent"
          >
            Показать все
          </Link>
        )}
      </div>

      {count === 0 ? (
        <p className="text-ink-muted mt-4 text-sm leading-relaxed">
          Пусто. Отмечайте понравившиеся оправы сердечком на карточке — вернётесь к ним позже.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function MyReviews({
  reviews,
  onRemove,
}: {
  reviews: ReturnType<typeof useReviews>["all"];
  onRemove: (id: string) => void;
}) {
  return (
    <section id="reviews" className="scroll-mt-24">
      <h2 className="font-display text-3xl">Мои отзывы</h2>

      {reviews.length === 0 ? (
        <p className="text-ink-muted mt-4 text-sm leading-relaxed">
          Вы ещё не оставляли отзывов. Форма — внизу страницы любой модели.
        </p>
      ) : (
        <ul className="divide-line border-line mt-6 divide-y border-y">
          {reviews.map((r) => {
            const product = getProduct(r.slug);
            return (
              <li key={r.id} className="py-5">
                <div className="flex flex-wrap items-center gap-3">
                  {product && (
                    <Link href={`/product/${r.slug}`} className="text-sm font-medium hover:text-accent">
                      {product.brand} {product.model}
                    </Link>
                  )}
                  <Rating value={r.rating} count={0} compact />
                  <span className="text-ink-muted text-xs">{formatDate(r.date)}</span>
                  {r.faceShape && (
                    <span className="border-line text-ink-muted border px-2 py-0.5 text-[10px] tracking-wide uppercase">
                      {FACE_LABEL[r.faceShape]} лицо
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(r.id)}
                    className="text-ink-muted hover:text-ink ml-auto text-xs underline underline-offset-4"
                  >
                    Удалить
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{r.text}</p>
                {r.photos.length > 0 && (
                  <ul className="mt-3 flex gap-2">
                    {r.photos.map((src, i) => (
                      <li key={i}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" className="border-line size-16 border object-cover" />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FinderSection({ params, savedAt }: { params?: string; savedAt?: string }) {
  const parsed = params ? new URLSearchParams(params) : null;
  const face = parsed?.get("face");
  const size = parsed?.get("size");
  const shapes = parsed?.get("shape")?.split(",") ?? [];
  const priceMax = parsed?.get("priceMax");

  return (
    <section id="finder" className="scroll-mt-24">
      <h2 className="font-display text-3xl">Мой подбор</h2>

      {!parsed ? (
        <>
          <p className="text-ink-muted mt-4 max-w-md text-sm leading-relaxed">
            Вы ещё не проходили подбор. Четыре вопроса — и каталог перестроится под форму
            вашего лица, посадку и бюджет.
          </p>
          <ButtonLink href="/finder" variant="secondary" className="mt-5">
            Пройти подбор
          </ButtonLink>
        </>
      ) : (
        <div className="border-line mt-6 border p-6">
          <p className="text-ink-muted text-xs">Сохранён {savedAt && formatDate(savedAt)}</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-4">
            <Fact label="Форма лица" value={face ? FACE_LABEL[face as keyof typeof FACE_LABEL] : "—"} />
            <Fact
              label="Силуэт"
              value={
                shapes.length > 0
                  ? shapes.map((s) => SHAPE_LABEL[s as keyof typeof SHAPE_LABEL]).join(", ")
                  : "любой"
              }
            />
            <Fact label="Размер" value={size || "любой"} />
            <Fact label="Бюджет" value={priceMax ? `до ${formatPrice(Number(priceMax))}` : "без ограничений"} />
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href={`/catalog?${params}`} size="m">
              Открыть подборку
            </ButtonLink>
            <ButtonLink href="/finder" variant="ghost" size="m">
              Пройти заново
            </ButtonLink>
          </div>
        </div>
      )}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted text-xs">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}

function Addresses() {
  return (
    <section id="addresses" className="scroll-mt-24">
      <h2 className="font-display text-3xl">Адреса</h2>
      <ul className="mt-6 grid gap-px bg-line sm:grid-cols-2">
        {ADDRESSES.map((a) => (
          <li key={a.id} className="bg-surface p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{a.title}</p>
              {a.isDefault && (
                <span className="border-line text-ink-muted border px-2 py-0.5 text-[10px] tracking-wide uppercase">
                  По умолчанию
                </span>
              )}
            </div>
            <p className="text-ink-muted mt-2 text-sm leading-relaxed">{a.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WishlistPage() {
  const { products, count, ready, clear } = useWishlist();

  if (!ready) {
    return (
      <div className="shell py-20">
        <div className="bg-surface-alt h-64 animate-pulse" />
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="shell py-14 lg:py-20">
        <h1 className="font-display text-4xl lg:text-5xl">В избранном пусто</h1>
        <p className="text-ink-muted mt-4 max-w-md leading-relaxed">
          Отмечайте понравившиеся оправы сердечком на карточке — соберём их здесь, чтобы
          вернуться и сравнить на свежую голову.
        </p>
        <ButtonLink href="/catalog" size="l" className="mt-8">
          В каталог
        </ButtonLink>
      </div>
    );
  }

  const total = products.reduce((n, p) => n + p.price, 0);

  return (
    <div className="shell py-8 lg:py-12">
      <nav aria-label="Хлебные крошки" className="text-ink-muted mb-5 text-xs">
        <Link href="/" className="hover:text-ink">
          Главная
        </Link>
        <span className="mx-2">/</span>
        <Link href="/account" className="hover:text-ink">
          Кабинет
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Избранное</span>
      </nav>

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl lg:text-5xl">Избранное</h1>
          <p className="text-ink-muted mt-2 text-sm">
            {count} {plural(count, "модель", "модели", "моделей")} · всего{" "}
            <Price value={total} size="s" />
          </p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-ink-muted hover:text-ink text-sm underline underline-offset-4"
        >
          Очистить
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading eyebrow="Следующий шаг" title="Сравните финалистов" />
        <p className="text-ink-muted max-w-md text-sm leading-relaxed">
          Отметьте до четырёх моделей значком сравнения — таблица подсветит, чем они
          отличаются по посадке, линзе и материалу.
        </p>
      </div>
    </div>
  );
}
