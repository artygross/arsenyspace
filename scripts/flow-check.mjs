import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.SHOTS_DIR ?? "./.screenshots";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, cond, detail = "") =>
  results.push(`${cond ? "OK  " : "FAIL"} ${name}${detail ? " — " + detail : ""}`);

const browser = await chromium.launch();

/* ---------- Desktop ---------- */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ru-RU" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// 1. Мега-меню каталога
await page.goto(BASE + "/");
await page.getByRole("button", { name: "Каталог" }).hover();
await page.waitForTimeout(300);
ok("мега-меню каталога раскрывается", await page.getByText("Форма оправы").first().isVisible());
await page.screenshot({ path: `${OUT}/flow-megamenu.png` });

// 2. Оверлей поиска по Ctrl+K
await page.keyboard.press("Escape");
await page.mouse.move(700, 500);
await page.keyboard.press("Control+k");
await page.waitForTimeout(300);
const input = page.getByLabel("Поисковый запрос");
ok("Ctrl+K открывает поиск", await input.isVisible());
await input.fill("ави");
await page.waitForTimeout(300);
const sugg = await page.locator("ul li button").filter({ hasText: "Авиаторы" }).count();
ok("автокомплит находит «Авиаторы»", sugg > 0);
await page.screenshot({ path: `${OUT}/flow-search.png` });
await input.press("ArrowDown");
await input.press("Enter");
await page.waitForURL(/\/catalog|\/search/);
ok("выбор подсказки ведёт на выдачу", true, new URL(page.url()).pathname + new URL(page.url()).search);

// 3. Фильтр каталога пишется в URL и «назад» работает
await page.goto(BASE + "/catalog");
const before = await page.locator("section p span.font-medium").first().innerText();
await page.getByRole("checkbox", { name: /Meridian/ }).check();
await page.waitForTimeout(600);
const after = await page.locator("section p span.font-medium").first().innerText();
ok("фасет меняет выдачу", before !== after, `${before} → ${after}`);
ok("фасет попал в URL", page.url().includes("brand=Meridian"));
await page.goBack();
await page.waitForTimeout(600);
const back = await page.locator("section p span.font-medium").first().innerText();
ok("кнопка «назад» возвращает выдачу", back === before, `${after} → ${back}`);

// 4. Сравнение: чекбокс на карточке → панель → страница
await page.goto(BASE + "/catalog");
const cards = page.locator("article");
await cards.nth(0).hover();
await cards.nth(0).getByRole("button", { name: /к сравнению/ }).click();
await cards.nth(1).hover();
await cards.nth(1).getByRole("button", { name: /к сравнению/ }).click();
await page.waitForTimeout(400);
const bar = page.getByRole("link", { name: /Сравнить/ });
ok("панель сравнения появилась", await bar.isVisible());
await page.screenshot({ path: `${OUT}/flow-comparebar.png` });
await bar.click();
await page.waitForURL(/\/compare/);
ok("панель ведёт на сравнение с двумя моделями", page.url().includes("items=") && page.url().split("items=")[1].split(",").length === 2);

// 5. Корзина: добавление с PDP не уводит со страницы
await page.goto(BASE + "/product/lume-orbita");
await page.getByRole("button", { name: "В корзину", exact: true }).click();
await page.waitForTimeout(400);
ok("остались на карточке товара", page.url().includes("/product/lume-orbita"));
ok("показалось подтверждение", await page.getByText(/добавлены в корзину/).isVisible());
const badge = await page.locator("header a[aria-label='Корзина'] span").first().innerText();
ok("счётчик корзины обновился", badge === "1", `значение «${badge}»`);
await page.screenshot({ path: `${OUT}/flow-addtocart.png` });

// 6. Корзина переживает переход и перезагрузку
await page.goto(BASE + "/cart");
ok("позиция видна в корзине", await page.getByText("Orbita").first().isVisible());
await page.reload();
await page.waitForTimeout(400);
ok("корзина пережила перезагрузку", await page.getByText("Orbita").first().isVisible());

// 7. Чекаут: валидация по blur и запрет отправки пустой формы
await page.goto(BASE + "/checkout");
await page.getByRole("button", { name: "Подтвердить заказ" }).click();
await page.waitForTimeout(300);
ok("пустая форма не отправляется", page.url().includes("/checkout") && !page.url().includes("success"));
ok("показаны ошибки полей", (await page.getByText("Укажите имя и фамилию").count()) > 0);
await page.getByLabel("Телефон").fill("89990001122");
await page.waitForTimeout(200);
const phone = await page.getByLabel("Телефон").inputValue();
ok("телефон автоформатируется", phone.startsWith("+7 999"), `«${phone}»`);
await page.screenshot({ path: `${OUT}/flow-checkout-errors.png` });

// 8. Квиз подбора
await page.goto(BASE + "/finder");
await page.getByRole("button", { name: /Квадратное/ }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /Классика/ }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /^M/ }).first().click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /до 35 000/ }).click();
await page.waitForTimeout(200);
const finish = page.getByRole("button", { name: /Показать \d+/ });
const finishText = await finish.innerText();
ok("квиз дошёл до результата", await finish.isVisible(), finishText);
ok("квиз не ведёт в пустую выдачу", !/Показать 0 /.test(finishText), finishText);
ok("ослабление условий объяснено", (await page.getByText(/не учитываем/).count()) > 0);
await finish.click();
await page.waitForURL(/\/catalog/);
ok(
  "результат — предфильтрованный каталог",
  page.url().includes("/catalog") && page.url().includes("face=square") && page.url().includes("priceMax=35000"),
  new URL(page.url()).search,
);
await page.goto(BASE + "/account");
await page.waitForTimeout(400);
ok("подбор сохранился в кабинете", await page.getByText("Открыть подборку").isVisible());

ok("нет ошибок исполнения (desktop)", errors.length === 0, errors.slice(0, 2).join(" | "));
await ctx.close();

/* ---------- Mobile ---------- */
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ru-RU", isMobile: true, hasTouch: true });
const m = await mctx.newPage();
const merrors = [];
m.on("pageerror", (e) => merrors.push(e.message));

await m.goto(BASE + "/");
await m.getByRole("button", { name: "Открыть меню" }).click();
await m.waitForTimeout(300);
ok("мобильное меню открывается", await m.getByText("Поиск по каталогу").isVisible());
await m.screenshot({ path: `${OUT}/flow-mobile-menu.png` });
await m.getByRole("button", { name: "Закрыть меню" }).click();

await m.goto(BASE + "/catalog");
await m.getByRole("button", { name: "Фильтры" }).click();
await m.waitForTimeout(400);
const apply = m.getByRole("button", { name: /Показать \d+/ });
ok("панель фильтров открывается на мобильном", await apply.isVisible(), await apply.innerText());
await m.screenshot({ path: `${OUT}/flow-mobile-filters.png` });
await apply.click();
await m.waitForTimeout(300);
ok("панель закрывается по кнопке", !(await apply.isVisible().catch(() => false)));

ok("нет ошибок исполнения (mobile)", merrors.length === 0, merrors.slice(0, 2).join(" | "));
await mctx.close();

await browser.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL")).length;
console.log(`\nИтого: ${results.length - failed} из ${results.length}`);
