import Link from "next/link";
import { BRANDS, SHAPES, SHAPE_LABEL, brandSlug } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="bg-ink mt-auto text-white">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
        <div>
          <p className="font-display text-2xl">
            О́птика<span className="text-accent">.</span>
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Мультибрендовый магазин солнцезащитных очков. Официальный дилер всех брендов
            каталога.
          </p>
        </div>

        <FooterColumn title="Каталог">
          {SHAPES.slice(0, 6).map((s) => (
            <FooterLink key={s} href={`/catalog?shape=${s}`}>
              {SHAPE_LABEL[s]}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Бренды">
          {BRANDS.slice(0, 6).map((b) => (
            <FooterLink key={b} href={`/brands/${brandSlug(b)}`}>
              {b}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Помощь">
          <FooterLink href="/help#delivery">Доставка и оплата</FooterLink>
          <FooterLink href="/help#returns">Возврат и обмен</FooterLink>
          <FooterLink href="/help#warranty">Гарантия оригинальности</FooterLink>
          <FooterLink href="/help#size">Как выбрать размер оправы</FooterLink>
          <FooterLink href="/finder">Подбор по форме лица</FooterLink>
        </FooterColumn>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-6 text-xs text-white/50">
        <p>© 2026 О́птика. Демонстрационный проект.</p>
        <p>Цены и наличие — мок-данные, заказ не оформляется.</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-[11px] tracking-[0.18em] text-white/40 uppercase">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-white/75 hover:text-white">
        {children}
      </Link>
    </li>
  );
}
