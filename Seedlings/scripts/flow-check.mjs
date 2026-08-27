/**
 * Проверка сценариев: фильтры, поиск, избранное, корзина, промокод, чекаут,
 * накладная, кабинет и подписка на несезонный товар.
 * Запуск: pnpm exec next start Seedlings/site -p 3210 && node Seedlings/scripts/flow-check.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3210";
const OUT = process.env.SHOTS_DIR ?? "./.screenshots";
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, condition, detail = "") =>
  results.push({ name, condition: Boolean(condition), detail });

/**
 * Ждём факт, а не таймер: корзина, избранное и заказы читаются из localStorage после
 * гидрации, и мгновенный замер под нагрузкой врёт в обе стороны. Ожидание с перехватом —
 * несбывшийся сценарий должен попасть в отчёт, а не уронить прогон.
 */
const WAIT = 10_000;
const settle = (locator, opts = {}) => locator.waitFor({ timeout: WAIT, ...opts }).catch(() => {});
const settleFor = (fn, arg) => page.waitForFunction(fn, arg, { timeout: WAIT }).catch(() => {});

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ru-RU", reducedMotion: "reduce" });
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

/* ---------- 1. Главная → каталог культуры ---------- */
await page.goto(BASE + "/");
await page.locator('a[href="/catalog/malina-remontantnaya"]').first().click();
await page.waitForURL("**/catalog/malina-remontantnaya**");
ok("плитка разделов ведёт в каталог раздела", page.url().includes("/catalog/malina-remontantnaya"));

/* ---------- 2. Фасеты: отклик и URL ---------- */
// Фасет проверяем в летней малине: там есть ранние, средние и поздние сорта.
// В разделе «Малина ремонтантная» все сорта ремонтантные, и правильный фильтр
// там ничего не сузит — проверка ловила бы не дефект, а состав раздела.
await page.goto(BASE + "/catalog/malina-letnyaya");
const totalBefore = Number((await page.locator("text=/^\\d+ сорт/").first().innerText()).split(" ")[0]);
const facet = page.locator('label[for="ripening-early"]');
await facet.click();
ok("чекбокс фасета отмечается сразу", await page.locator("#ripening-early").isChecked());
await page.waitForURL("**ripening=early**");
const totalAfter = Number((await page.locator("text=/^\\d+ сорт/").first().innerText()).split(" ")[0]);
ok("фасет пишется в URL и сужает выдачу", totalAfter > 0 && totalAfter < totalBefore, `${totalBefore} → ${totalAfter}`);
await page.screenshot({ path: `${OUT}/flow-facets.png` });

/* ---------- 3. Чипсы и сброс ---------- */
await page.getByRole("button", { name: /Ранний/ }).click();
await page.waitForURL((u) => !u.search.includes("ripening"));
ok("чипс снимает фильтр", !page.url().includes("ripening"));

/* ---------- 4. Поиск ---------- */
await page.getByRole("button", { name: "Поиск по каталогу" }).click();
const searchInput = page.getByLabel("Поисковый запрос");
await searchInput.fill("полька");
const suggestion = page.locator("a", { hasText: "Полька" }).first();
await settle(suggestion);
ok("автокомплит показывает подсказки", await suggestion.isVisible());
await searchInput.press("Enter");
await page.waitForURL("**/search?q=**");
ok("поиск открывает страницу результатов", (await page.locator("article").count()) > 0);

/* ---------- 5. Избранное ---------- */
await page.goto(BASE + "/catalog/malina-remontantnaya");
await page.getByRole("button", { name: "В избранное" }).first().click();
const favBadge = page.locator("header a[href='/favorites'] span");
await settle(favBadge.filter({ hasText: "1" }));
ok("счётчик избранного в шапке обновился", (await favBadge.count()) > 0);
await page.goto(BASE + "/favorites");
const favCards = page.locator("main article");
await settle(favCards.first());
ok("избранное сохранилось между страницами", (await favCards.count()) === 1);

/* ---------- 6. Корзина и промокод ---------- */
await page.goto(BASE + "/catalog/malina-remontantnaya");
// Кнопка на 1.5 с превращается в «Добавлено», и .first() переезжает на соседнюю карточку.
// Ждём факт — счётчик в шапке, а не таймер.
const cartBadge = page.locator("header a[href='/cart'] span");
for (let i = 1; i <= 3; i++) {
  await page.getByRole("button", { name: "В корзину" }).first().click();
  await cartBadge.filter({ hasText: String(i) }).waitFor();
}
await page.goto(BASE + "/cart");
await page.locator("main li").first().waitFor();
ok("корзина переживает навигацию", (await cartBadge.innerText()) === "3", `в счётчике ${await cartBadge.innerText()}`);

await page.getByLabel("Промокод").fill("НЕТТАКОГО");
await page.getByRole("button", { name: "Применить" }).click();
ok("несуществующий промокод даёт ошибку", await page.getByText("Такого промокода нет").isVisible());

await page.getByLabel("Промокод").fill("ВЕСНА15");
await page.getByRole("button", { name: "Применить" }).click();
ok("промокод ВЕСНА15 применяется", await page.getByText("−15 % на малину").isVisible());
await page.screenshot({ path: `${OUT}/flow-cart-promo.png` });

/* ---------- 7. Чекаут ---------- */
await page.getByRole("link", { name: "Забронировать" }).click();
await page.waitForURL("**/checkout");
await page.getByRole("button", { name: /Забронировать/ }).click();
ok("пустая форма не отправляется и подсвечивает поле", await page.getByText("Как к вам обращаться?").isVisible());
ok("фокус переходит на первое ошибочное поле", await page.locator('[name="name"]').evaluate((el) => el === document.activeElement));

await page.getByRole("button", { name: /Самовывоз из питомника/ }).click();
ok("самовывоз убирает поле адреса", (await page.locator('[name="address"]').count()) === 0);
ok("самовывоз обнуляет доставку", await page.getByText("бесплатно").first().isVisible());
await page.getByRole("button", { name: /Курьером на адрес/ }).click();

await page.locator('[name="name"]').fill("Ольга Морозова");
await page.locator('[name="phone"]').fill("+7 900 111-22-33");
await page.locator('[name="email"]').fill("olga@example.com");
await page.locator('[name="address"]').fill("Тула, ул. Садовая, д. 4, кв. 12");
await page.screenshot({ path: `${OUT}/flow-checkout.png` });
await page.getByRole("button", { name: /Забронировать/ }).click();
await page.waitForURL("**/checkout/success**");
const orderHeading = await page.locator("h1").innerText();
ok("бронь оформляется и получает номер", /Бронь СГ-\d+ оформлена/.test(orderHeading), orderHeading);
await settle(cartBadge, { state: "detached" });
ok("корзина очищается после заказа", (await cartBadge.count()) === 0);

/* ---------- 8. Накладная ---------- */
await page.getByRole("link", { name: /Открыть накладную/ }).click();
await page.waitForURL("**/invoice/**");
ok("накладная содержит сумму прописью", /рубл/.test(await page.locator("article").innerText()));
ok("в накладной есть артикулы позиций", (await page.locator("table tbody tr").count()) > 0);
await page.screenshot({ path: `${OUT}/flow-invoice.png`, fullPage: true });

/* ---------- 9. Кабинет и повтор заказа ---------- */
await page.goto(BASE + "/account");
const orderRow = page.getByText(/Заказ СГ-\d+/);
await settle(orderRow.first());
ok("заказ виден в кабинете", (await orderRow.count()) > 0);
await page.getByRole("button", { name: "Повторить заказ" }).click();
await settle(cartBadge.filter({ hasText: "3" }));
ok("повтор заказа кладёт позиции в корзину", (await cartBadge.count()) > 0 && (await cartBadge.innerText()) === "3");

/* ---------- 10. Несезонный товар ---------- */
await page.goto(BASE + "/product/klubnika-frigo-kleri");
const purchaseCard = page.locator("div").filter({ has: page.locator("form#notify") }).last();
ok("вне сезона в блоке покупки нет кнопки корзины", (await purchaseCard.getByRole("button", { name: "В корзину" }).count()) === 0);
await page.locator('input[type="email"]').first().fill("olga@example.com");
await page.getByRole("button", { name: "Сообщить" }).click();
ok("подписка на поступление подтверждается", await page.getByText(/вернётся в продажу/).isVisible());

/* ---------- 11. Фасовка меняет цену ---------- */
await page.goto(BASE + "/product/klubnika-zks-aprika");
const priceBefore = await page.getByTestId("pdp-price").innerText();
await page.locator('input[name="variant"]').nth(1).check();
await settleFor((before) => document.querySelector('[data-testid="pdp-price"]')?.textContent !== before, priceBefore);
const priceAfter = await page.getByTestId("pdp-price").innerText();
ok("выбор фасовки пересчитывает цену", priceBefore !== priceAfter, `${priceBefore} → ${priceAfter}`);


/* ---------- 13. Сравнение сортов ---------- */
await page.goto(BASE + "/catalog/malina-remontantnaya");
// Кнопка после клика меняет подпись на «В сравнении», и nth(0) переезжает на следующую
// карточку. Ждём факт смены подписи: без этого на медленной гидрации второй клик попадает
// по той же карточке и снимает выбор.
const compareButtons = page.getByRole("button", { name: "Сравнить" });
await compareButtons.first().click();
await page.getByRole("button", { name: "В сравнении" }).first().waitFor();
await compareButtons.first().click();
await page.getByRole("button", { name: "В сравнении" }).nth(1).waitFor();
ok("полоса сравнения появляется", await page.getByRole("link", { name: "Сравнить" }).isVisible());
await page.getByRole("link", { name: "Сравнить" }).click();
await page.waitForURL("**/compare**");
// Страница сравнения клиентская: до гидрации в разметке заглушка Suspense,
// поэтому ждём саму таблицу, а не факт навигации
await page.locator("thead th").nth(1).waitFor();
const columns = await page.locator("thead th").count();
ok("в таблице сравнения две колонки сортов", columns === 3, `колонок с подписью: ${columns - 1}`);
const rowsAll = await page.locator("tbody tr").count();
await page.getByText("Только отличия").click();
await settleFor((before) => document.querySelectorAll("tbody tr").length !== before, rowsAll);
const rowsDiff = await page.locator("tbody tr").count();
ok("режим «только отличия» скрывает совпадающие строки", rowsDiff < rowsAll, `${rowsAll} → ${rowsDiff}`);
ok("состав сравнения зашит в адрес страницы", page.url().includes("items="));
await page.screenshot({ path: `${OUT}/flow-compare.png`, fullPage: true });
await page.getByRole("button", { name: "Очистить сравнение" }).click();
await page.getByText("Сравнивать пока нечего").waitFor();
ok("сравнение очищается", await page.getByText("Сравнивать пока нечего").isVisible());

/* ---------- 14. Подборка одной кнопкой ---------- */
await page.goto(BASE + "/collection/malina-na-vsyo-leto");
const collectionItems = await page.locator("ol > li").count();
await page.getByRole("button", { name: "Взять всю подборку" }).click();
await page.getByRole("button", { name: "Подборка в корзине" }).waitFor();
const inCart = await cartBadge.innerText();
ok("подборка кладётся в корзину одной кнопкой", Number(inCart) >= collectionItems, `в корзине ${inCart}, в подборке ${collectionItems}`);

/* ---------- 15. Статья и перелинковка ---------- */
await page.goto(BASE + "/care");
await page.getByRole("link", { name: "Обрезка ремонтантной малины" }).click();
await page.waitForURL("**/care/obrezka-remontantnoy-maliny");
ok("статья открывается", (await page.locator("h1").innerText()).includes("Обрезка"));
await page.getByRole("link", { name: "Смотреть сорта ремонтантной малины" }).click();
await page.waitForURL("**/catalog/malina-remontantnaya");
ok("из статьи есть путь в каталог раздела", page.url().endsWith("/catalog/malina-remontantnaya"));

/* ---------- 16. Микроразметка ---------- */
await page.goto(BASE + "/product/klubnika-zks-aprika");
const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
const types = ld.map((raw) => JSON.parse(raw)["@type"]);
ok("на карточке есть разметка Product и BreadcrumbList", types.includes("Product") && types.includes("BreadcrumbList"), types.join(", "));
const productLd = JSON.parse(ld[types.indexOf("Product")]);
ok("в разметке указаны цена и наличие", productLd.offers?.price > 0 && String(productLd.offers?.availability).includes("schema.org"));

/* ---------- 17. Мобильное меню ---------- */
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ru-RU", reducedMotion: "reduce" });
const mpage = await mobile.newPage();
mpage.on("pageerror", (e) => pageErrors.push(e.message));
await mpage.goto(BASE + "/");
await mpage.getByRole("button", { name: "Открыть меню" }).click();
const mobileMenu = mpage.getByTestId("mobile-menu");
await settle(mobileMenu);
ok("мобильное меню открывается", await mobileMenu.getByRole("link", { name: "Весь каталог" }).isVisible());
// Шторка должна накрывать экран: у шапки backdrop-blur, и вложенная в неё шторка
// получала размеры шапки — меню открывалось полоской поверх страницы
const menuBox = await mobileMenu.boundingBox();
ok(
  "мобильное меню накрывает экран целиком",
  Boolean(menuBox) && menuBox.height >= 800 && menuBox.width >= 390,
  menuBox ? `${Math.round(menuBox.width)}×${Math.round(menuBox.height)}` : "нет блока",
);
await mpage.screenshot({ path: `${OUT}/flow-mobile-menu.png` });

await mpage.goto(BASE + "/catalog");
await mpage.getByRole("button", { name: /Фильтры/ }).click();
ok("шторка фильтров открывается на мобильном", await mpage.getByRole("button", { name: /Показать \d+ сорт/ }).isVisible());
await mpage.screenshot({ path: `${OUT}/flow-mobile-filters.png` });

await browser.close();

const failed = results.filter((r) => !r.condition);
for (const r of results) {
  console.log(`${r.condition ? "OK  " : "FAIL"} ${r.name}${r.detail ? " — " + r.detail : ""}`);
}
if (pageErrors.length) console.log("Ошибки страницы:\n" + pageErrors.map((e) => " · " + e).join("\n"));
console.log(`\n${results.length - failed.length}/${results.length} сценариев прошли`);
if (failed.length || pageErrors.length) process.exit(1);
