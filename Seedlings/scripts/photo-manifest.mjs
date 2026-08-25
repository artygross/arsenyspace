/**
 * Пересобирает манифест фотографий по содержимому Seedlings/site/public/photos.
 * Имя файла = слаг сорта, необязательный суффикс -2, -3 — дополнительные кадры.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../site");
const dir = path.join(root, "public/photos");
const out = path.join(root, "lib/photos.generated.ts");

const files = fs
  .readdirSync(dir)
  .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "ru"));

const map = new Map();
for (const file of files) {
  const base = file.replace(/\.[^.]+$/, "");
  const slug = base.replace(/-\d+$/, "");
  if (!map.has(slug)) map.set(slug, []);
  map.get(slug).push(`/photos/${file}`);
}

const body = [...map.entries()]
  .map(([slug, list]) => `  ${JSON.stringify(slug)}: [${list.map((p) => JSON.stringify(p)).join(", ")}],`)
  .join("\n");

fs.writeFileSync(
  out,
  `/**\n * Сгенерировано \`node Seedlings/scripts/photo-manifest.mjs\` — вручную не править.\n * Ключ — слаг сорта, значение — пути к файлам в /public/photos.\n */\nexport const PHOTOS: Record<string, string[]> = {\n${body}\n};\n`,
);

console.log(`Файлов: ${files.length}, сортов с фото: ${map.size}`);
for (const [slug, list] of map) console.log(`  ${slug} — ${list.length}`);
