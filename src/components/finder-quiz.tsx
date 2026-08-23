"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveFinderResult } from "@/components/finder-store";
import { Button } from "@/components/ui";
import { FACE_LABEL, filterProducts, parseQuery, type FaceShape, type FrameShape } from "@/lib/catalog";
import { plural } from "@/lib/format";

/* ---------- Шаги ---------- */

const FACES: { id: FaceShape; hint: string }[] = [
  { id: "oval", hint: "Пропорции сбалансированы, подбородок мягко сужается" },
  { id: "round", hint: "Ширина и высота близки, черты мягкие" },
  { id: "square", hint: "Широкая челюсть, выраженные углы" },
  { id: "heart", hint: "Широкий лоб, узкий подбородок" },
  { id: "oblong", hint: "Лицо заметно длиннее, чем шире" },
];

const STYLES: { id: string; title: string; note: string; shapes: FrameShape[] }[] = [
  { id: "classic", title: "Классика", note: "Авиаторы и вайфареры", shapes: ["aviator", "wayfarer"] },
  { id: "minimal", title: "Минимализм", note: "Тонкие прямоугольники и овалы", shapes: ["rectangle", "oval"] },
  { id: "statement", title: "Характерная форма", note: "Кошачий глаз, круглые, oversize", shapes: ["cat-eye", "round", "oversize"] },
  { id: "sport", title: "Спорт", note: "Обтекающая посадка", shapes: ["sport"] },
];

const SIZES = [
  { id: "S", title: "S", note: "Узкое лицо, линза до 50 мм" },
  { id: "M", title: "M", note: "Средняя посадка, 51—56 мм" },
  { id: "L", title: "L", note: "Широкое лицо, от 57 мм" },
  { id: "", title: "Не знаю", note: "Покажем все размеры" },
];

const BUDGETS = [
  { id: "20000", title: "до 20 000 ₽" },
  { id: "35000", title: "до 35 000 ₽" },
  { id: "60000", title: "до 60 000 ₽" },
  { id: "", title: "Без ограничений" },
];

type Answers = { face?: FaceShape; style?: string; size?: string; budget?: string };

const TOTAL = 4;

export function FinderQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  // Ответы копятся в одном объекте — шаг назад ничего не теряет
  const [answers, setAnswers] = useState<Answers>({});

  const { params, matches, dropped } = resolveResult(answers);

  function pick<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((a) => ({ ...a, [key]: value }));
    if (step < TOTAL - 1) setStep(step + 1);
  }

  const canGoNext =
    (step === 0 && answers.face) ||
    (step === 1 && answers.style) ||
    (step === 2 && answers.size !== undefined) ||
    (step === 3 && answers.budget !== undefined);

  return (
    <div className="shell py-8 lg:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Прогресс */}
        <div className="flex items-center gap-4">
          <ol className="flex flex-1 gap-1.5" aria-label="Прогресс подбора">
            {Array.from({ length: TOTAL }, (_, i) => (
              <li
                key={i}
                aria-current={i === step ? "step" : undefined}
                className={`h-0.5 flex-1 ${i <= step ? "bg-ink" : "bg-line"}`}
              />
            ))}
          </ol>
          <span className="text-ink-muted text-xs tabular-nums">
            {step + 1} / {TOTAL}
          </span>
        </div>

        <div className="mt-10">
          {step === 0 && (
            <StepShell
              title="Какая у вас форма лица?"
              note="Посмотрите на себя анфас: важнее всего ширина скул относительно лба и челюсти."
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {FACES.map((f) => (
                  <li key={f.id}>
                    <Option
                      selected={answers.face === f.id}
                      onClick={() => pick("face", f.id)}
                      title={FACE_LABEL[f.id]}
                      note={f.hint}
                      icon={<FaceIcon shape={f.id} />}
                    />
                  </li>
                ))}
              </ul>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell title="Какой силуэт вам ближе?" note="Можно выбрать по настроению — форму мы уже учли на первом шаге.">
              <ul className="grid gap-3 sm:grid-cols-2">
                {STYLES.map((s) => (
                  <li key={s.id}>
                    <Option
                      selected={answers.style === s.id}
                      onClick={() => pick("style", s.id)}
                      title={s.title}
                      note={s.note}
                    />
                  </li>
                ))}
              </ul>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell
              title="Какой размер оправы вам нужен?"
              note="Если не уверены — посмотрите на внутреннюю сторону заушника своих очков: первое число это ширина линзы."
            >
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {SIZES.map((s) => (
                  <li key={s.id || "any"}>
                    <Option
                      selected={answers.size === s.id}
                      onClick={() => pick("size", s.id)}
                      title={s.title}
                      note={s.note}
                    />
                  </li>
                ))}
              </ul>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="До какой суммы подбирать?" note="Это фильтр, а не обязательство — его можно снять на выдаче.">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {BUDGETS.map((b) => (
                  <li key={b.id || "any"}>
                    <Option
                      selected={answers.budget === b.id}
                      onClick={() => setAnswers((a) => ({ ...a, budget: b.id }))}
                      title={b.title}
                    />
                  </li>
                ))}
              </ul>
            </StepShell>
          )}
        </div>

        {/* Навигация */}
        <div className="border-line mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <button
            type="button"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="text-ink-muted hover:text-ink text-sm underline underline-offset-4 disabled:opacity-30"
          >
            ← Назад
          </button>

          <div className="flex items-center gap-4">
            {answers.face && (
              <span className="text-ink-muted text-xs">
                {matches > 0
                  ? `Подходит ${matches} ${plural(matches, "модель", "модели", "моделей")}`
                  : "Пока ничего не подходит"}
              </span>
            )}
            {step < TOTAL - 1 ? (
              <Button
                size="m"
                disabled={!canGoNext}
                onClick={() => setStep(step + 1)}
              >
                Дальше
              </Button>
            ) : (
              <Button
                size="l"
                disabled={!canGoNext}
                onClick={() => {
                  const qs = params.toString();
                  saveFinderResult(qs);
                  router.push(`/catalog?${qs}`);
                }}
              >
                Показать {matches} {plural(matches, "модель", "модели", "моделей")}
              </Button>
            )}
          </div>
        </div>

        {step === TOTAL - 1 && dropped.length > 0 && (
          <p className="border-line text-ink-muted mt-6 border-l-2 pl-4 text-xs leading-relaxed">
            Под все ваши условия сразу ничего не нашлось, поэтому мы не учитываем{" "}
            <span className="text-ink">{dropped.join(" и ")}</span>. Форму лица и бюджет
            оставили — их можно поменять на выдаче.
          </p>
        )}

        <p className="text-ink-muted mt-8 text-center text-xs">
          Не хотите отвечать?{" "}
          <Link href="/catalog" className="underline underline-offset-4">
            Откройте весь каталог
          </Link>
        </p>
      </div>
    </div>
  );
}

/**
 * Строгая комбинация ответов легко даёт пустую выдачу: «квадратное лицо +
 * классика + размер M + до 35 000» в каталоге не встречается вовсе.
 * Отправлять человека на пустую страницу после четырёх вопросов нельзя,
 * поэтому условия ослабляются по одному — от наименее важного к самому важному.
 * Бюджет и форма лица не снимаются никогда: первое — жёсткое ограничение
 * пользователя, второе — смысл всего подбора.
 */
const RELAXATION: { key: keyof Answers; label: string }[] = [
  { key: "style", label: "силуэт" },
  { key: "size", label: "размер" },
];

function countFor(a: Answers): number {
  return filterProducts(parseQuery(Object.fromEntries(buildParams(a)))).length;
}

function resolveResult(a: Answers): {
  params: URLSearchParams;
  matches: number;
  dropped: string[];
} {
  let current = a;
  const dropped: string[] = [];

  for (let i = 0; i <= RELAXATION.length; i++) {
    const matches = countFor(current);
    if (matches > 0 || i === RELAXATION.length) {
      return { params: buildParams(current), matches, dropped };
    }
    const { key, label } = RELAXATION[i];
    if (current[key]) {
      dropped.push(label);
      current = { ...current, [key]: undefined };
    }
  }

  return { params: buildParams(current), matches: countFor(current), dropped };
}

/** Результат — не тройка моделей, а предфильтрованная выдача. Решение D-11. */
function buildParams(a: Answers): URLSearchParams {
  const p = new URLSearchParams();
  if (a.face) p.set("face", a.face);
  if (a.style) {
    const shapes = STYLES.find((s) => s.id === a.style)?.shapes ?? [];
    if (shapes.length) p.set("shape", shapes.join(","));
  }
  if (a.size) p.set("size", a.size);
  if (a.budget) p.set("priceMax", a.budget);
  p.set("inStock", "1");
  return p;
}

function StepShell({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="rise">
      <h1 className="font-display text-3xl lg:text-4xl">{title}</h1>
      <p className="text-ink-muted mt-3 max-w-xl text-sm leading-relaxed">{note}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Option({
  selected,
  onClick,
  title,
  note,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  note?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-full w-full border p-4 text-left transition-colors ${
        selected ? "border-ink bg-surface-alt" : "border-line hover:border-ink"
      }`}
    >
      {icon && <span className="mb-3 block">{icon}</span>}
      <span className="block text-sm font-medium">{title}</span>
      {note && <span className="text-ink-muted mt-1 block text-xs leading-relaxed">{note}</span>}
    </button>
  );
}

function FaceIcon({ shape }: { shape: FaceShape }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.5 };
  return (
    <svg viewBox="0 0 60 76" className="text-ink-muted h-14 w-full" aria-hidden="true">
      {shape === "oval" && <ellipse cx="30" cy="38" rx="20" ry="27" {...common} />}
      {shape === "round" && <circle cx="30" cy="38" r="24" {...common} />}
      {shape === "square" && <rect x="8" y="14" width="44" height="48" rx="8" {...common} />}
      {shape === "heart" && (
        <path d="M8 26c0-8 10-14 22-14s22 6 22 14c0 16-12 26-22 38C20 52 8 42 8 26z" {...common} />
      )}
      {shape === "oblong" && <ellipse cx="30" cy="38" rx="16" ry="32" {...common} />}
    </svg>
  );
}
