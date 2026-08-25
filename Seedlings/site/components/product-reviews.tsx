"use client";

import { useState } from "react";
import { createStore } from "@/lib/store";
import type { Review } from "@/lib/catalog";
import { formatDate, plural } from "@/lib/format";
import { Button, Rating } from "./ui";
import { IconStar } from "./icons";

const store = createStore<Record<string, Review[]>>("sg_reviews_v1", {});

export function ProductReviews({ slug, reviews, rating, count }: { slug: string; reviews: Review[]; rating: number; count: number }) {
  const mine = store.useValue();
  const own = mine[slug] ?? [];
  const all = [...own, ...reviews];
  const [open, setOpen] = useState(false);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    share: Math.round((all.filter((r) => Math.round(r.rating) === star).length / all.length) * 100),
  }));

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold lg:text-3xl">
          Отзывы <span className="text-ink-muted font-sans text-base font-normal">{count}</span>
        </h2>
        <Button variant="secondary" onClick={() => setOpen((v) => !v)}>
          {open ? "Свернуть форму" : "Написать отзыв"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="card-surface h-fit p-5">
          <p className="font-display text-4xl font-bold">{rating.toFixed(1)}</p>
          <Rating value={rating} count={count} compact />
          <p className="text-ink-muted mt-1 text-sm">
            {count} {plural(count, "отзыв", "отзыва", "отзывов")}
          </p>
          <ul className="mt-4 grid gap-1.5">
            {distribution.map((d) => (
              <li key={d.star} className="flex items-center gap-2 text-sm">
                <span className="w-3 tabular-nums">{d.star}</span>
                <IconStar className="text-sun size-3.5" />
                <span className="bg-line h-1.5 flex-1 overflow-hidden rounded-full">
                  <span className="bg-sun block h-full rounded-full" style={{ width: `${d.share}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {open && <ReviewForm slug={slug} onDone={() => setOpen(false)} />}
          <ul className="grid gap-4">
            {all.map((r, i) => (
              <li key={`${r.author}-${i}`} className="card-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {r.author} <span className="text-ink-muted font-normal">· {r.region}</span>
                  </p>
                  <span className="text-ink-muted text-sm">{formatDate(r.date)}</span>
                </div>
                <div className="mt-1">
                  <Rating value={r.rating} count={0} compact />
                </div>
                <p className="mt-2 leading-relaxed">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ReviewForm({ slug, onDone }: { slug: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState("");
  const [region, setRegion] = useState("");
  const [text, setText] = useState("");

  return (
    <form
      className="card-surface mb-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const current = store.read();
        const review = {
          author: author.trim(),
          region: region.trim() || "Регион не указан",
          rating,
          text: text.trim(),
          date: new Date().toISOString().slice(0, 10),
        };
        store.write({ ...current, [slug]: [review, ...(current[slug] ?? [])] });
        onDone();
      }}
    >
      <p className="mb-3 font-medium">Ваш отзыв</p>
      <div className="mb-3 flex items-center gap-1" role="radiogroup" aria-label="Оценка">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} из 5`}
            onClick={() => setRating(star)}
            className={star <= rating ? "text-sun" : "text-line"}
          >
            <IconStar filled={star <= rating} className="size-7" />
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Имя"
          aria-label="Имя"
          className="field"
        />
        <input
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Регион"
          aria-label="Регион"
          className="field"
        />
      </div>
      <textarea
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Как прижилось растение, что понравилось, что нет"
        aria-label="Текст отзыва"
        className="field mt-3"
      />
      <div className="mt-3 flex gap-2">
        <Button type="submit">Отправить</Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Отмена
        </Button>
      </div>
      <p className="text-ink-muted mt-3 text-xs">
        Прототип сохраняет отзыв в браузере. В боевой версии он уходит на модерацию.
      </p>
    </form>
  );
}
