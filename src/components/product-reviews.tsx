"use client";

import { useState } from "react";
import { shrinkImage, useReviews, type UserReview } from "@/components/reviews";
import { Button, Rating, SectionHeading } from "@/components/ui";
import { FACE_LABEL, FACE_SHAPES, type FaceShape, type Product } from "@/lib/catalog";
import { formatDate, plural } from "@/lib/format";

const MAX_PHOTOS = 3;

export function ProductReviews({ product }: { product: Product }) {
  const { forProduct, ready, remove } = useReviews(product.slug);
  const [formOpen, setFormOpen] = useState(false);

  const total = product.reviewCount + (ready ? forProduct.length : 0);

  return (
    <section id="reviews" className="shell section scroll-mt-24">
      <SectionHeading
        eyebrow={`${total} ${plural(total, "отзыв", "отзыва", "отзывов")}`}
        title="Как их носят"
      />

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <div>
          <p className="font-display text-5xl">{product.rating.toFixed(1)}</p>
          <div className="mt-2">
            <Rating value={product.rating} count={product.reviewCount} />
          </div>

          <ul className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const share = star === 5 ? 68 : star === 4 ? 24 : star === 3 ? 6 : 1;
              return (
                <li key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-3 tabular-nums">{star}</span>
                  <span className="bg-line h-1 flex-1">
                    <span className="bg-accent block h-1" style={{ width: `${share}%` }} />
                  </span>
                  <span className="text-ink-muted w-8 text-right tabular-nums">{share}%</span>
                </li>
              );
            })}
          </ul>

          {!formOpen && (
            <Button variant="secondary" className="mt-8 w-full" onClick={() => setFormOpen(true)}>
              Написать отзыв
            </Button>
          )}
        </div>

        <div>
          {formOpen && (
            <ReviewForm
              slug={product.slug}
              onDone={() => setFormOpen(false)}
              onCancel={() => setFormOpen(false)}
            />
          )}

          <ul className="divide-line divide-y">
            {ready &&
              forProduct.map((r) => (
                <MyReview key={r.id} review={r} onRemove={() => remove(r.id)} />
              ))}

            {product.reviews.map((r) => (
              <li key={`${r.author}-${r.date}`} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium">{r.author}</span>
                  <Rating value={r.rating} count={0} compact />
                  <span className="text-ink-muted text-xs">{formatDate(r.date)}</span>
                  {r.faceShape && (
                    <span className="border-line text-ink-muted border px-2 py-0.5 text-[10px] tracking-wide uppercase">
                      {FACE_LABEL[r.faceShape]} лицо
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MyReview({ review, onRemove }: { review: UserReview; onRemove: () => void }) {
  return (
    <li className="border-accent -mx-4 border-l-2 bg-surface-alt px-4 py-6 first:pt-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">{review.author}</span>
        <Rating value={review.rating} count={0} compact />
        <span className="text-ink-muted text-xs">{formatDate(review.date)}</span>
        {review.faceShape && (
          <span className="border-line text-ink-muted border px-2 py-0.5 text-[10px] tracking-wide uppercase">
            {FACE_LABEL[review.faceShape]} лицо
          </span>
        )}
        <span className="text-accent text-[10px] tracking-[0.14em] uppercase">Ваш отзыв</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-ink-muted hover:text-ink ml-auto text-xs underline underline-offset-4"
        >
          Удалить
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed">{review.text}</p>

      {review.photos.length > 0 && (
        <ul className="mt-4 flex gap-2">
          {review.photos.map((src, i) => (
            <li key={i}>
              {/* Фото из localStorage — data URL, оптимизатор next/image здесь неприменим */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Фото из отзыва" className="border-line size-20 border object-cover" />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ReviewForm({
  slug,
  onDone,
  onCancel,
}: {
  slug: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const { add } = useReviews();
  const [rating, setRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [faceShape, setFaceShape] = useState<FaceShape | "">("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ rating?: string; author?: string; text?: string }>({});

  async function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const next = await Promise.all(files.map((f) => shrinkImage(f)));
      setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
    } catch {
      // нечитаемый файл просто не добавляется
    }
    setBusy(false);
    event.target.value = "";
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const e: typeof errors = {};
    if (rating === 0) e.rating = "Поставьте оценку";
    if (author.trim().length < 2) e.author = "Как вас подписать?";
    if (text.trim().length < 10) e.text = "Хотя бы пара предложений — так отзыв полезнее";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    add({
      slug,
      author: author.trim(),
      rating,
      text: text.trim(),
      faceShape: faceShape || undefined,
      photos,
    });
    onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="border-line mb-10 border p-6">
      <h3 className="font-display text-2xl">Ваш отзыв</h3>
      <p className="text-ink-muted mt-2 text-xs leading-relaxed">
        Отзыв сохраняется в этом браузере — демонстрационный проект, на сервер ничего не уходит.
      </p>

      <div className="mt-6">
        <span className="mb-2 block text-xs">Оценка</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              aria-label={`${star} из 5`}
              aria-pressed={rating === star}
              className="p-0.5"
            >
              <svg
                viewBox="0 0 20 20"
                className={`size-7 ${star <= rating ? "fill-accent" : "fill-line"}`}
                aria-hidden="true"
              >
                <path d="M10 1.5l2.47 5.3 5.53.66-4.1 3.9 1.1 5.64L10 14.3l-5 2.7 1.1-5.64-4.1-3.9 5.53-.66z" />
              </svg>
            </button>
          ))}
        </div>
        {errors.rating && <p className="text-sale mt-1.5 text-xs">{errors.rating}</p>}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs">Как вас подписать</span>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={`h-11 w-full border px-3 text-sm ${errors.author ? "border-sale" : "border-line focus:border-ink"}`}
          />
          {errors.author && <span className="text-sale mt-1.5 block text-xs">{errors.author}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-baseline gap-2 text-xs">
            Форма лица <span className="text-ink-muted">— необязательно</span>
          </span>
          <select
            value={faceShape}
            onChange={(e) => setFaceShape(e.target.value as FaceShape | "")}
            className="border-line focus:border-ink h-11 w-full border bg-transparent px-3 text-sm"
          >
            <option value="">Не указывать</option>
            {FACE_SHAPES.map((f) => (
              <option key={f} value={f}>
                {FACE_LABEL[f]}
              </option>
            ))}
          </select>
          <span className="text-ink-muted mt-1.5 block text-xs">
            Помогает другим понять, подойдёт ли им эта форма
          </span>
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs">Впечатления</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Как сидят, что с посадкой, совпал ли цвет с фото"
          className={`w-full border px-3 py-2.5 text-sm ${errors.text ? "border-sale" : "border-line focus:border-ink"}`}
        />
        {errors.text && <span className="text-sale mt-1.5 block text-xs">{errors.text}</span>}
      </label>

      <div className="mt-5">
        <span className="mb-2 flex items-baseline gap-2 text-xs">
          Фотографии <span className="text-ink-muted">— до {MAX_PHOTOS}, необязательно</span>
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {photos.map((src, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="border-line size-20 border object-cover" />
              <button
                type="button"
                onClick={() => setPhotos(photos.filter((_, k) => k !== i))}
                aria-label="Убрать фото"
                className="bg-ink absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center text-xs leading-none text-white"
              >
                ×
              </button>
            </div>
          ))}

          {photos.length < MAX_PHOTOS && (
            <label className="border-line text-ink-muted hover:border-ink hover:text-ink flex size-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed text-[10px]">
              <span className="text-lg leading-none">+</span>
              {busy ? "…" : "Фото"}
              <input type="file" accept="image/*" multiple onChange={onFiles} className="sr-only" />
            </label>
          )}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          Опубликовать
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
