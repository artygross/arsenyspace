/**
 * Приём фотографий от клиента.
 *
 * Раскладка: в `Seedlings/assets/photos/<Раздел>/<Сорт>/` кладутся любые снимки сорта
 * как есть — прямо из телефона, из ВКонтакте, из архива. Имена файлов не важны,
 * порядок берётся по алфавиту: первый файл становится главным кадром.
 *
 * Запуск:
 *   node Seedlings/scripts/photo-intake.mjs --init   создать папки под все сорта каталога
 *   node Seedlings/scripts/photo-intake.mjs          разложить снимки в сайт
 *
 * Разбор: снимок обрезается по центру до 4:5 (пропорция сетки каталога), ужимается
 * до 1200×1500 и сохраняется как `site/public/photos/<слаг>.jpg`, `-2`, `-3`.
 * Больше трёх кадров на сорт не берём: в карточке их всё равно три.
 * В конце пересобирается манифест — отдельно `photo-manifest.mjs` запускать не нужно.
 *
 * Список сортов берётся из самого каталога (`site/lib/catalog.ts`), поэтому папки
 * и слаги не могут разойтись с ассортиментом.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getProducts, CULTURE_BY_KEY } from "../site/lib/catalog.ts";

const root = path.resolve(import.meta.dirname, "..");
const intakeDir = path.join(root, "assets/photos");
const outDir = path.join(root, "site/public/photos");

/** Имя папки раздела: то же название, что в каталоге, но без кавычек и слова «тип» */
const folderOf = (culture) =>
  CULTURE_BY_KEY.get(culture).name.replace("тип «фриго»", "фриго").replace(/[«»]/g, "");

const products = getProducts();
const IMAGE = /\.(jpe?g|png|webp|avif|heic|tiff?)$/i;

if (process.argv.includes("--init")) {
  for (const p of products) {
    const dir = path.join(intakeDir, folderOf(p.culture), p.name);
    fs.mkdirSync(dir, { recursive: true });
    // Пустые папки git не хранит, а нужны они именно пустыми — под будущие снимки
    const keep = path.join(dir, ".gitkeep");
    if (!fs.existsSync(keep)) fs.writeFileSync(keep, "");
  }
  console.log(`Готово: ${products.length} папок в ${path.relative(process.cwd(), intakeDir)}`);
  console.log("Кладите снимки внутрь, потом запустите скрипт без --init.");
  process.exit(0);
}

if (!fs.existsSync(intakeDir)) {
  console.error(`Нет папки ${path.relative(process.cwd(), intakeDir)} — запустите с --init.`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

let taken = 0;
let waiting = 0;
for (const p of products) {
  const dir = path.join(intakeDir, folderOf(p.culture), p.name);
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => IMAGE.test(f)).sort((a, b) => a.localeCompare(b, "ru"))
    : [];
  if (!files.length) {
    waiting++;
    continue;
  }
  for (const [i, file] of files.slice(0, 3).entries()) {
    const out = path.join(outDir, `${p.slug}${i ? `-${i + 1}` : ""}.jpg`);
    await sharp(path.join(dir, file))
      .rotate() // разворот по EXIF: снимки с телефона иначе лягут боком
      // Кадрируем от центра, а не «по вниманию»: у клиента на снимках впечатана
      // подпись сорта и водяной знак, и умный кадр резал их пополам.
      .resize(1200, 1500, { fit: "cover", position: "centre" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(out);
    taken++;
  }
  console.log(`  ${p.name} — ${Math.min(files.length, 3)} из ${files.length}`);
}

console.log(`Разобрано кадров: ${taken}. Сортов без снимков: ${waiting} из ${products.length}.`);
await import("./photo-manifest.mjs");
