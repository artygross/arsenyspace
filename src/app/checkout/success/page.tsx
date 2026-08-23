import { ButtonLink, TrustBlock } from "@/components/ui";

export const metadata = { title: "Заказ оформлен" };

const NEXT_STEPS = [
  ["Подтверждение", "Письмо с составом заказа уже отправлено на вашу почту"],
  ["Сборка", "Проверяем оправу и комплектацию — обычно в течение дня"],
  ["Доставка", "Пришлём трек-номер, как только заказ передан курьеру"],
];

export default function CheckoutSuccessPage() {
  return (
    <div className="shell py-14 lg:py-24">
      <div className="max-w-2xl">
        <p className="eyebrow">Заказ принят</p>
        <h1 className="font-display mt-4 text-4xl lg:text-5xl">Спасибо. Мы всё получили.</h1>
        <p className="text-ink-muted mt-5 leading-relaxed">
          Номер заказа <b className="text-ink">№ 26-04817</b>. Это демонстрационный проект —
          реальный заказ не создан и оплата не списана.
        </p>

        <ol className="mt-10 grid gap-px bg-line sm:grid-cols-3">
          {NEXT_STEPS.map(([title, text], i) => (
            <li key={title} className="bg-surface p-5">
              <span className="text-accent text-xs tracking-widest">0{i + 1}</span>
              <p className="mt-3 text-sm font-medium">{title}</p>
              <p className="text-ink-muted mt-1.5 text-xs leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/catalog" size="l">
            Вернуться в каталог
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="l">
            На главную
          </ButtonLink>
        </div>
      </div>

      <div className="mt-16">
        <TrustBlock />
      </div>
    </div>
  );
}
