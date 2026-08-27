/**
 * Готовит логотип клиента к вставке в сайт из исходника Seedlings/assets/logo-source.png.
 *
 * Что делает:
 *   1. Убирает белый фон вокруг эмблемы — заливка от краёв, внутренние белые пятна
 *      (тело аиста, блики на лейке) остаются непрозрачными.
 *   2. Обрезает поля по содержимому.
 *   3. Дополняет прозрачным до квадрата: носик лейки выходит за круг вправо, поэтому
 *      эмблема шире, чем выше. В квадратной рамке она встаёт целиком и в любом размере —
 *      обрезать её нельзя (решение D-28).
 *
 * Что кладёт:
 *   site/public/logo/polesie.png  эмблема целиком — шапка, футер, «О питомнике», накладная
 *   site/app/icon.png             фавиконка (соглашение Next.js)
 *   site/app/apple-icon.png       иконка для iOS, на кремовом фоне — прозрачность там чернеет
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
/** Сторона квадрата, в который вписывается эмблема. */
const SIZE = 512;
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

const base = sharp(data, { raw: { width: W, height: H, channels: 4 } });
const png = { compressionLevel: 9, effort: 10 };

fs.mkdirSync(publicDir, { recursive: true });

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;

/**
 * `fit: "contain"` вписывает эмблему целиком и сам добирает прозрачные поля до квадрата.
 * Отдельным `extend` это делать нельзя: sharp выполняет операции в своём порядке и
 * дополняет уже после масштабирования — рамка уезжает, а `resize` по умолчанию режет
 * по `cover`, то есть именно обрезает эмблему.
 */
const square = await base
  .clone()
  .extract({ left: minX, top: minY, width: cropW, height: cropH })
  .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png(png)
  .toBuffer();
fs.writeFileSync(path.join(publicDir, "polesie.png"), square);

const icon = await sharp(square).resize(256, 256).png(png).toBuffer();
fs.writeFileSync(path.join(appDir, "icon.png"), icon);

const apple = await sharp(square)
  .resize(168, 168)
  .extend({ top: 6, bottom: 6, left: 6, right: 6, background: CREAM })
  .flatten({ background: CREAM })
  .png(png)
  .toBuffer();
fs.writeFileSync(path.join(appDir, "apple-icon.png"), apple);

const kb = (b) => `${Math.round(b.length / 102.4) / 10} КБ`;
console.log(`Исходник: ${path.relative(process.cwd(), src)} — ${W}×${H}`);
console.log(`Эмблема после обрезки: ${cropW}×${cropH} → квадрат ${SIZE}×${SIZE} с прозрачными полями`);
console.log(`  public/logo/polesie.png  ${kb(square)}`);
console.log(`  app/icon.png             ${kb(icon)}`);
console.log(`  app/apple-icon.png       ${kb(apple)}`);
