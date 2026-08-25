import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { SeasonBar } from "@/components/season-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://svoya-gryadka.example"),
  title: {
    default: "Своя грядка — рассада и саженцы из своего питомника",
    template: "%s · Своя грядка",
  },
  description:
    "Рассада клубники, саженцы малины, смородины, крыжовника и жимолости из собственного питомника. Закрытая корневая система, гарантия приживаемости 14 дней, доставка по России и самовывоз.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SeasonBar />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
