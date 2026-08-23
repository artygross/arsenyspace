import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CompareBar } from "@/components/compare-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "О́птика — солнцезащитные очки премиальных брендов",
    template: "%s · О́птика",
  },
  description:
    "Мультибрендовый магазин солнцезащитных очков: подбор по форме лица, сравнение моделей, отзывы покупателей. Официальный дилер, возврат 14 дней.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CompareBar />
      </body>
    </html>
  );
}
