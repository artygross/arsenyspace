import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink, Faq, SectionHeading, TrustBlock } from "@/components/ui";
import { IconBox, IconClock, IconPin, IconSnow, IconTruck } from "@/components/icons";
import { DELIVERY_STEPS, FAQ_ITEMS } from "@/lib/content";
import { FREE_FROM, PICKUP, ZONES } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Доставка и самовывоз",
  description:
    "Как мы упаковываем и доставляем живые растения: термокороб, торфяной ком, сроки и тарифы по зонам. Самовывоз из питомника бесплатно, ежедневно с 9:00 до 18:00.",
};

export default function DeliveryPage() {
  return (
    <div className="shell pb-16">
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Доставка" }]} />
      <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
        Доставка живых растений
      </h1>
      <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
        Растение — не коробка с товаром: у него есть срок, за который оно должно доехать. Поэтому
        мы собираем заказ в день отгрузки, пакуем в термокороб и не отправляем в мороз.
      </p>

      <section className="mt-10">
        <SectionHeading title="Как мы упаковываем" />
        <div className="grid gap-4 md:grid-cols-3">
          {DELIVERY_STEPS.map((s, i) => {
            const Icon = [IconBox, IconTruck, IconClock][i];
            return (
              <div key={s.title} className="card-surface p-5">
                <span className="bg-leaf-soft text-leaf-deep flex size-10 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="text-ink-muted mt-1.5 text-sm leading-relaxed">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading title="Тарифы и сроки" text={`Бесплатно при заказе от ${formatPrice(FREE_FROM)}. Стоимость считается автоматически в корзине по весу заказа.`} />
        <div className="overflow-x-auto">
          <table className="card-surface w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-leaf-soft/60 text-left">
                <th className="px-5 py-3 font-semibold">Зона</th>
                <th className="px-5 py-3 font-semibold">Куда</th>
                <th className="px-5 py-3 font-semibold">Срок</th>
                <th className="px-5 py-3 font-semibold">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.key} className="border-line border-t">
                  <td className="px-5 py-3 font-medium">{z.label}</td>
                  <td className="text-ink-muted px-5 py-3">{z.hint}</td>
                  <td className="px-5 py-3">{z.days}</td>
                  <td className="px-5 py-3">
                    от {formatPrice(z.base)}
                    {z.thermo > 0 && (
                      <span className="text-ink-muted"> + термоупаковка {formatPrice(z.thermo)}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-ink-muted mt-3 text-sm">
          Свыше 5 кг добавляется надбавка за вес: она указана в корзине до оформления, скрытых
          доплат при получении нет.
        </p>
      </section>

      <section className="mt-12">
        <div className="bg-sand grid gap-6 rounded-[28px] p-6 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="eyebrow">Самовывоз — 0 ₽</p>
            <h2 className="font-display mt-2 text-2xl font-bold">Забрать в питомнике</h2>
            <ul className="mt-4 grid gap-2 text-sm">
              <li className="flex gap-2">
                <IconPin className="text-leaf size-5 shrink-0" /> {PICKUP.address}
              </li>
              <li className="flex gap-2">
                <IconClock className="text-leaf size-5 shrink-0" /> {PICKUP.hours} · {PICKUP.ready} · {PICKUP.keep}
              </li>
            </ul>
            <p className="text-ink-muted mt-4 max-w-2xl leading-relaxed">
              Когда заказ готов, приходит письмо с датой и сроком хранения. На месте можно выбрать
              конкретные экземпляры и задать вопросы агроному.
            </p>
          </div>
          <ButtonLink href="/catalog" size="l" className="justify-self-start lg:justify-self-end">
            Собрать заказ
          </ButtonLink>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading title="Когда мы не отправляем" />
        <div className="card-surface flex gap-4 p-5">
          <IconSnow className="text-leaf size-6 shrink-0" />
          <p className="leading-relaxed">
            При устойчивом минусе и в жару выше +30 °C отправку переносим: растение не переживёт
            дорогу. Мы предупреждаем заранее и согласовываем новую дату — заказ при этом сохраняется,
            а цена фиксируется.
          </p>
        </div>
      </section>

      <div className="mt-12">
        <TrustBlock />
      </div>

      <section className="mt-12">
        <SectionHeading title="Частые вопросы" />
        <Faq items={FAQ_ITEMS} />
      </section>
    </div>
  );
}
