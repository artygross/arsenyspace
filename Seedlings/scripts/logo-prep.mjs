/**
 * Готовит логотип клиента к вставке в сайт из исходника Seedlings/assets/logo-source.png.
 *
 * Что делает:
 *   1. Убирает белый фон вокруг эмблемы — заливка от краёв, внутренние белые пятна
 *      (тело аиста, блики на лейке) остаются непрозрачными.
 *   2. Обрезает поля по содержимому.
 *   3. Считает геометрию кольца и вырезает внутренний диск — упрощённый знак
 *      для мелких размеров (docs/05-ui-system.md §11: кольцевая надпись ниже 40 px нечитаема).
 *
 * Что кладёт:
 *   site/public/logo/polesie.png       полная эмблема — «О питомнике», шапка накладной
 *   site/public/logo/polesie-mark.png  знак без кольца — шапка и футер сайта
 *   site/app/icon.png                  фавиконка (соглашение Next.js)
 *   site/app/apple-icon.png            иконка для iOS, на кремовом фоне — прозрачность там чернеет
 *
 * Запуск: node Seedlings/scripts/logo-prep.mjs [путь-к-исходнику]
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const src = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, "assets/logo-source.png");
const publicDir = path.join(root, "site/public/logo");
const appDir = path.join(root, "site/app");

/** Порог «почти белого» для заливки фона и для растушёвки краёв. */
const WHITE = 240;
const WHITE_EDGE = 225;
/**
 * Внутренний знак: доля радиуса кольца и сдвиг центра вниз, тоже в долях радиуса.
 * Смысловой центр эмблемы ниже геометрического — вверху лейка, внизу ягоды,
 * а на 32 px именно ягоды делают знак узнаваемым. Значения подобраны по рендеру.
 */
const MARK_RADIUS = 0.62;
const MARK_SHIFT_Y = 0.18;
const CREAM = { r: 0xfb, g: 0xf8, b: 0xf1, alpha: 1 };

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const pale = (i, t) => data[i * 4] >= t && data[i * 4 + 1] >= t && data[i * 4 + 2] >= t;

// Заливка фона от краёв — так внутренние белые участки рисунка не выедаются.
const outside = new Uint8Array(W * H);
const queue = [];
const seed = (i) => {
  if (!outside[i] && (pale(i, WHITE) || data[i * 4 + 3] < 8)) {
    outside[i] = 1;
    queue.push(i);
  }
};
for (let x = 0; x < W; x++) {
  seed(x);
  seed((H - 1) * W + x);
}
for (let y = 0; y < H; y++) {
  seed(y * W);
  seed(y * W + W - 1);
}
for (let q = 0; q < queue.length; q++) {
  const i = queue[q];
  const x = i % W;
  const y = (i - x) / W;
  if (x > 0) seed(i - 1);
  if (x < W - 1) seed(i + 1);
  if (y > 0) seed(i - W);
  if (y < H - 1) seed(i + W);
}

// Растушёвка: сглаженные пиксели контура остаются белым ореолом, снимаем два слоя.
for (let pass = 0; pass < 2; pass++) {
  const wave = [];
  for (let i = 0; i < W * H; i++) {
    if (outside[i] || !pale(i, WHITE_EDGE)) continue;
    const x = i % W;
    const y = (i - x) / W;
    const near =
      (x > 0 && outside[i - 1]) ||
      (x < W - 1 && outside[i + 1]) ||
      (y > 0 && outside[i - W]) ||
      (y < H - 1 && outside[i + W]);
    if (near) wave.push(i);
  }
  for (const i of wave) outside[i] = 1;
}

let minX = W;
let minY = H;
let maxX = -1;
let maxY = -1;
for (let i = 0; i < W * H; i++) {
  if (outside[i]) {
    data[i * 4 + 3] = 0;
    continue;
  }
  const x = i % W;
  const y = (i - x) / W;
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}

const opaque = (x, y) => !outside[y * W + x];
/** Крайние непрозрачные пиксели вдоль строки или столбца — по ним ищется кольцо. */
const spanX = (y) => {
  let a = -1;
  let b = -1;
  for (let x = 0; x < W; x++) if (opaque(x, y)) { if (a < 0) a = x; b = x; }
  return [a, b];
};
const spanY = (x) => {
  let a = -1;
  let b = -1;
  for (let y = 0; y < H; y++) if (opaque(x, y)) { if (a < 0) a = y; b = y; }
  return [a, b];
};

// Носик лейки выходит за круг вправо вверх, поэтому центр берём по средней строке
// и среднему столбцу, где крайние пиксели принадлежат кольцу, и уточняем итерацией.
let cx = Math.round((minX + maxX) / 2);
let cy = Math.round((minY + maxY) / 2);
let radius = 0;
for (let step = 0; step < 3; step++) {
  const [x1, x2] = spanX(cy);
  const [y1, y2] = spanY(cx);
  cx = Math.round((x1 + x2) / 2);
  cy = Math.round((y1 + y2) / 2);
  radius = ((x2 - x1) / 2 + (y2 - y1) / 2) / 2;
}

const cut = Math.round(radius * MARK_RADIUS);
const markY = Math.round(cy + radius * MARK_SHIFT_Y);
const mark = {
  left: Math.max(0, cx - cut),
  top: Math.max(0, markY - cut),
  width: Math.min(W, cx + cut) - Math.max(0, cx - cut),
  height: Math.min(H, markY + cut) - Math.max(0, markY - cut),
};

const base = sharp(data, { raw: { width: W, height: H, channels: 4 } });
const png = { compressionLevel: 9, effort: 10 };

fs.mkdirSync(publicDir, { recursive: true });

const full = await base
  .clone()
  .extract({ left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 })
  .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
  .png(png)
  .toBuffer();
fs.writeFileSync(path.join(publicDir, "polesie.png"), full);

// Круглая маска: вырезанный квадрат обрезается до диска, кольцо с надписью отсекается.
// Маску строим уже под конечный размер — sharp применяет наложение после масштабирования.
const MARK_PX = 512;
const discSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_PX} ${MARK_PX}" width="${MARK_PX}" height="${MARK_PX}"><circle cx="${MARK_PX / 2}" cy="${MARK_PX / 2}" r="${MARK_PX / 2}" fill="#fff"/></svg>`,
);
const disc = await sharp(discSvg).resize(MARK_PX, MARK_PX).png().toBuffer();
const markPng = await base
  .clone()
  .extract(mark)
  .resize(MARK_PX, MARK_PX, { fit: "cover" })
  .composite([{ input: disc, blend: "dest-in" }])
  .png(png)
  .toBuffer();
fs.writeFileSync(path.join(publicDir, "polesie-mark.png"), markPng);

const icon = await sharp(markPng).resize(256, 256).png(png).toBuffer();
fs.writeFileSync(path.join(appDir, "icon.png"), icon);

const apple = await sharp(markPng)
  .resize(160, 160)
  .extend({ top: 10, bottom: 10, left: 10, right: 10, background: CREAM })
  .flatten({ background: CREAM })
  .png(png)
  .toBuffer();
fs.writeFileSync(path.join(appDir, "apple-icon.png"), apple);

const kb = (b) => `${Math.round(b.length / 102.4) / 10} КБ`;
console.log(`Исходник: ${path.relative(process.cwd(), src)} — ${W}×${H}`);
console.log(`Эмблема после обрезки: ${maxX - minX + 1}×${maxY - minY + 1}, кольцо r=${Math.round(radius)} в центре ${cx},${cy}`);
console.log(`  public/logo/polesie.png       ${kb(full)}`);
console.log(`  public/logo/polesie-mark.png  ${kb(markPng)}`);
console.log(`  app/icon.png                  ${kb(icon)}`);
console.log(`  app/apple-icon.png            ${kb(apple)}`);
