/**
 * Примеры фотографий: по одному кадру на каждый сорт каталога.
 *
 * Нужны, чтобы прототип не выглядел пустым, пока клиент собирает настоящие снимки.
 * Кадр честно подписан «пример фото» — его нельзя спутать со снимком растения.
 * Имена файлов те же, что у настоящих фотографий, поэтому подмена — это просто
 * запуск `photo-intake.mjs`: он перезапишет пример реальным кадром.
 *
 * Запуск: node Seedlings/scripts/photo-samples.mjs [--force]
 * Без --force уже существующие файлы не трогаются — настоящее фото не затрётся примером.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getProducts, CULTURE_BY_KEY } from "../site/lib/catalog.ts";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "site/public/photos");
const force = process.argv.includes("--force");

const W = 1200;
const H = 1500;
const INK = "#1c2b21";
const MUTED = "#5d6f63";
const CREAM = "#fbf8f1";

/**
 * Смешение цвета с кремовым фоном. Считаем оттенок числом, а не задаём прозрачность
 * в градиенте: разные рендереры SVG кладут stop-opacity по-разному, и вместо
 * светлой подложки получается тёмное пятно.
 */
function mix(hex, t, base = CREAM) {
  const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = rgb(hex);
  const [r2, g2, b2] = rgb(base);
  const c = (a, b) => Math.round(a * t + b * (1 - t)).toString(16).padStart(2, "0");
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
}

/** Ягода раздела. Формы те же, что в параметрической иллюстрации (components/plant-art.tsx). */
function berry(culture, x, y, r, hex) {
  if (culture.startsWith("strawberry")) {
    return `<path d="M${x - r} ${y} a${r} ${r} 0 0 1 ${2 * r} 0 q0 ${r * 1.1} -${r} ${r * 1.7} q-${r} -${r * 0.6} -${r} -${r * 1.7} z" fill="${hex}"/>
      <path d="M${x - r * 0.85} ${y - r * 0.45} q${r * 0.85} -${r * 0.5} ${r * 1.7} 0 q-${r * 0.85} ${r * 0.35} -${r * 1.7} 0 z" fill="#3f8f4a"/>`;
  }
  if (culture.startsWith("raspberry") || culture === "blackberry") {
    const rows = culture === "blackberry" ? [0, 0.55, 1.1, 1.65] : [0, 0.5, 1];
    return rows
      .map((dy, i) =>
        (i % 2 ? [-0.6, 0.6] : [0])
          .map((dx) => `<circle cx="${x + dx * r}" cy="${y + dy * r}" r="${r * 0.58}" fill="${hex}"/>`)
          .join(""),
      )
      .join("");
  }
  if (culture === "blueberry") {
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${hex}"/>
      <path d="M${x - r * 0.45} ${y - r * 0.75} l${r * 0.45} ${r * 0.3} l${r * 0.45} -${r * 0.3} l-${r * 0.2} ${r * 0.55} h-${r * 0.5} z" fill="#2b3d63" opacity="0.7"/>`;
  }
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${hex}"/>`;
}

function card(product) {
  const meta = CULTURE_BY_KEY.get(product.culture);
  const { fruitHex: fruit, leafHex: leaf } = meta;
  // Разброс ягод завязан на слаг: соседние карточки в сетке не выглядят одинаковыми
  const seed = [...product.slug].reduce((h, c) => (h * 33 + c.charCodeAt(0)) % 9973, 7);
  const spots = [
    [500, 590, 104],
    [706, 664, 88],
    [592, 806, 74],
  ].slice(0, 2 + (seed % 2));

  const wash = mix(leaf, 0.14);
  const disc = mix(fruit, 0.16);
  const stem = mix(leaf, 0.75);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CREAM}"/>
      <stop offset="1" stop-color="${wash}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${CREAM}"/>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="600" cy="620" r="330" fill="${disc}"/>
  <path d="M600 880 V560" stroke="${stem}" stroke-width="16" stroke-linecap="round"/>
  <path d="M600 700 q-130 -50 -168 -168" stroke="${stem}" stroke-width="14" fill="none" stroke-linecap="round"/>
  <path d="M600 640 q130 -58 168 -178" stroke="${stem}" stroke-width="14" fill="none" stroke-linecap="round"/>
  ${spots.map(([x, y, r]) => berry(product.culture, x, y, r, fruit)).join("\n  ")}
  <text x="600" y="1150" text-anchor="middle" font-family="DejaVu Sans" font-size="36" fill="${MUTED}">${meta.name}</text>
  <text x="600" y="1246" text-anchor="middle" font-family="DejaVu Sans" font-size="76" font-weight="bold" fill="${INK}">${product.name}</text>
  <rect x="474" y="1344" width="252" height="56" rx="28" fill="#ffffff" stroke="${mix(INK, 0.18)}"/>
  <text x="600" y="1381" text-anchor="middle" font-family="DejaVu Sans" font-size="26" letter-spacing="3" fill="${MUTED}">ПРИМЕР ФОТО</text>
</svg>`);
}

fs.mkdirSync(outDir, { recursive: true });
const products = getProducts();
let made = 0;
let kept = 0;
for (const p of products) {
  const out = path.join(outDir, `${p.slug}.jpg`);
  if (fs.existsSync(out) && !force) {
    kept++;
    continue;
  }
  await sharp(card(p)).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
  made++;
}
console.log(`Примеров создано: ${made}, пропущено (файл уже есть): ${kept}`);
await import("./photo-manifest.mjs");
