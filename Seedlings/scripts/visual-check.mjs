/**
 * Проверка вёрстки: все маршруты в двух брейкпоинтах, скриншоты и ошибки консоли.
 * Запуск: pnpm exec next start Seedlings/site -p 3210 && node Seedlings/scripts/visual-check.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const OUT = process.env.SHOTS_DIR ?? "./.screenshots";
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["catalog", "/catalog"],
  ["catalog-culture", "/catalog/klubnika"],
  ["catalog-filtered", "/catalog/malina?ripening=everbearing&hardiness=25"],
  ["product", "/product/klubnika-polka"],
  ["product-preorder", "/product/malina-polka"],
  ["product-out", "/product/ovoshchnaya-rassada-byche-serdtse"],
  ["cart", "/cart"],
  ["checkout", "/checkout"],
  ["favorites", "/favorites"],
  ["account", "/account"],
  ["search", "/search?q=ремонтантная"],
  ["collection", "/collection/klubnika-na-vsyo-leto"],
  ["article", "/care/obrezka-remontantnoy-maliny"],
  ["compare", "/compare?items=klubnika-polka,klubnika-albion,malina-karamelka"],
  ["sale", "/sale"],
  ["delivery", "/delivery"],
  ["guarantee", "/guarantee"],
  ["care", "/care"],
  ["about", "/about"],
  ["not-found", "/no-such-page"],
];

const VIEWPORTS = [
  ["mobile", 390, 844],
  ["desktop", 1440, 900],
];

const problems = [];
const browser = await chromium.launch();

for (const [vpName, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width, height }, locale: "ru-RU", reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`${page.url()} :: ${e.message}`));
  page.on("console", (m) => {
    // 404 у страницы /no-such-page — ожидаемый ответ, а не дефект
    const text = m.text();
    if (m.type() === "error" && !text.includes("status of 404")) {
      errors.push(`${page.url()} :: console: ${text}`);
    }
  });

  for (const [name, path] of ROUTES) {
    const response = await page.goto(BASE + path, { waitUntil: "networkidle" });
    const status = response?.status() ?? 0;
    const expected = name === "not-found" ? 404 : 200;
    if (status !== expected) problems.push(`${path} → HTTP ${status}, ожидали ${expected}`);

    // Горизонтальный скролл — частый дефект мобильной вёрстки
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) problems.push(`${vpName} ${path} → горизонтальный скролл ${overflow}px`);

    await page.screenshot({ path: `${OUT}/${vpName}-${name}.png`, fullPage: vpName === "desktop" });
  }

  problems.push(...errors.map((e) => `${vpName} ошибка: ${e}`));
  await ctx.close();
}

await browser.close();

if (problems.length) {
  console.log("НАЙДЕНЫ ДЕФЕКТЫ:\n" + problems.map((p) => " · " + p).join("\n"));
  process.exit(1);
}
console.log(`OK: ${ROUTES.length} маршрутов × ${VIEWPORTS.length} брейкпоинта, дефектов нет`);
