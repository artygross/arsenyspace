import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOTS_DIR ?? "./.screenshots";
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["home", "/"],
  ["catalog", "/catalog"],
  ["catalog-filtered", "/catalog?shape=aviator&size=L"],
  ["catalog-empty", "/catalog?priceMin=99000"],
  ["search", "/search?q=" + encodeURIComponent("титан")],
  ["compare", "/compare?items=meridian-cassini-01,nocturne-verso-set,lume-orbita"],
  ["finder", "/finder"],
  ["brands", "/brands"],
  ["brand", "/brands/meridian"],
  ["pdp", "/product/meridian-cassini-01"],
  ["cart-empty", "/cart"],
  ["checkout", "/checkout"],
  ["success", "/checkout/success"],
  ["account", "/account"],
  ["wishlist", "/account/wishlist"],
  ["help", "/help"],
  ["404", "/nope"],
];

const VIEWPORTS = [
  ["desktop", 1440, 900],
  ["mobile", 390, 844],
];

const problems = [];

const browser = await chromium.launch();

for (const [vpName, width, height] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    locale: "ru-RU",
  });
  const page = await ctx.newPage();

  const logs = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") logs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

  for (const [name, path] of PAGES) {
    logs.length = 0;
    const res = await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);

    const status = res?.status();
    if (name === "404" ? status !== 404 : status !== 200) {
      problems.push(`${vpName}/${name}: HTTP ${status}`);
    }

    // Правило: страница не должна прокручиваться по горизонтали
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      const extra = de.scrollWidth - de.clientWidth;
      if (extra <= 1) return null;
      // найти виновника
      const guilty = [];
      for (const el of document.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > de.clientWidth + 1 || r.left < -1)) {
          guilty.push(
            `${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ").slice(0, 3).join(".")} right=${Math.round(r.right)}`,
          );
        }
      }
      return { extra, guilty: guilty.slice(0, 4) };
    });
    if (overflow) {
      problems.push(
        `${vpName}/${name}: горизонтальная прокрутка +${overflow.extra}px → ${overflow.guilty.join(" | ")}`,
      );
    }

    if (logs.length) problems.push(`${vpName}/${name}: ${logs.slice(0, 3).join(" ;; ")}`);

    await page.screenshot({
      path: `${OUT}/${vpName}-${name}.png`,
      fullPage: false,
    });
  }

  await ctx.close();
}

await browser.close();

console.log(problems.length === 0 ? "ПРОБЛЕМ НЕ НАЙДЕНО" : "НАЙДЕНО:\n" + problems.join("\n"));
