import type { Metadata } from "next";
import { Breadcrumbs, ButtonLink, Faq, SectionHeading, TrustBlock } from "@/components/ui";
import { IconBox, IconClock, IconPin, IconSnow, IconTruck } from "@/components/icons";
import { DELIVERY_STEPS, FAQ_ITEMS } from "@/lib/content";
import { FaqLd } from "@/components/structured-data";
import { KRONSTADT, METHODS, PACKAGING_PER_PLACE, PICKUP, SPB_PICKUPS } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Доставка и самовывоз",
  description:
    "Шесть способов получить саженцы: СДЭК, Почта России, самовывоз из питомника в Ломоносовском районе, бесплатная выдача у метро в Петербурге весной, курьер на адрес и бесплатный пункт выдачи в Кронштадте. Оплата при получении.",
};

export default function DeliveryPage() {
  return (
    <div className="shell pb-16">
      <FaqLd items={FAQ_ITEMS} />
      <Breadcrumbs items={[{ href: "/", label: "Главная" }, { label: "Доставка" }]} />
      <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
        Доставка живых растений
      </h1>
      <p className="text-ink-muted mt-3 max-w-2xl leading-relaxed">
        Растение — не коробка с товаром: у него есть срок, за который оно должно доехать. Поэтому
        мы собираем заказ в день отправки, пакуем в коробку с амортизацией и не отправляем в мороз.
      </p>

      <section className="mt-10">
        <SectionHeading title="Как проходит заказ" />
        <div className="grid gap-4 md:grid-cols-3">
          {DELIVERY_STEPS.map((s, i) => {
            const Icon = [IconBox, IconClock, IconTruck, IconSnow][i] ?? IconBox;
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
        <SectionHeading
          title="Шесть способов получить заказ"
          text="Отправляем из Ленинградской области. Оплата — при получении, вместе с упаковкой и доставкой."
        />
        <div className="overflow-x-auto">
          <table className="card-surface w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-leaf-soft/60 text-left">
                <th className="px-5 py-3 font-semibold">Способ</th>
                <th className="px-5 py-3 font-semibold">Куда</th>
                <th className="px-5 py-3 font-semibold">Срок</th>
                <th className="px-5 py-3 font-semibold">Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {METHODS.map((m) => (
                <tr key={m.key} className="border-line border-t">
                  <td className="px-5 py-3 font-medium">{m.label}</td>
                  <td className="text-ink-muted px-5 py-3">{m.hint}</td>
                  <td className="px-5 py-3">{m.days}</td>
                  <td className="px-5 py-3">
                    {m.byCarrier ? (
                      <span className="text-ink-muted">по тарифу перевозчика</span>
                    ) : m.base > 0 ? (
                      formatPrice(m.base)
                    ) : (
                      <span className="text-leaf font-medium">бесплатно</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="text-ink-muted mt-3 grid gap-1.5 text-sm">
          <li>
            Тариф СДЭК и Почты считает перевозчик — по договору для юридических лиц он дешевле
            отправки от частного лица. Точную сумму называем, когда созваниваемся и подтверждаем бронь.
          </li>
          <li>Курьером за КАД — 1 500 ₽ плюс 30 ₽ за километр, расстояние считаем при подтверждении.</li>
          <li>Доставка дешевле на 10 % за каждые полные 10 000 ₽ в заказе.</li>
          <li>Упаковка — {formatPrice(PACKAGING_PER_PLACE)} за место: коробка и упаковочный материал.</li>
        </ul>
      </section>

      <section className="mt-12">
        <SectionHeading
          title="Бесплатно в Петербурге и Кронштадте"
          text="Весной выдаём заказы у станций метро, круглый год — в пункте выдачи в Кронштадте."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card-surface p-5">
            <h3 className="font-semibold">Выдача у метро — весной</h3>
            <ul className="mt-3 grid gap-2 text-sm">
              {SPB_PICKUPS.map((p) => (
                <li key={p.station} className="flex justify-between gap-3">
                  <span className="flex gap-2">
                    <IconPin className="text-leaf size-5 shrink-0" /> {p.station}
                  </span>
                  <span className="text-ink-muted shrink-0">
                    {new Date(p.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-ink-muted mt-3 text-sm">
              Встречаемся в шаговой доступности от станции. Время сообщаем накануне.
            </p>
          </div>
          <div className="card-surface p-5">
            <h3 className="font-semibold">Пункт выдачи в Кронштадте</h3>
            <p className="mt-3 flex gap-2 text-sm">
              <IconPin className="text-leaf size-5 shrink-0" /> {KRONSTADT}
            </p>
            <p className="text-ink-muted mt-3 text-sm">
              Бесплатно. Перед доставкой связываемся и согласуем дату и время.
            </p>
          </div>
        </div>
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
                <IconClock className="text-leaf size-5 shrink-0" /> {PICKUP.hours} · {PICKUP.ready}
              </li>
            </ul>
            <p className="text-ink-muted mt-4 max-w-2xl leading-relaxed">
              Перед приездом созвонимся и договоримся о дате и времени. На месте можно выбрать
              конкретные экземпляры и посмотреть корневую систему до оплаты.
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
            дорогу. Мы предупреждаем заранее и согласовываем новую дату — бронь при этом сохраняется.
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
