/**
 * Забирает фотографии сортов из публичной папки Яндекс.Диска в папки приёмки
 * `Seedlings/assets/photos/<Раздел>/<Сорт>/`.
 *
 * Публичная ссылка читается официальным API Яндекс.Диска и токена не требует.
 *
 * Имена файлов у клиента — вольная латиница («caramelca», «nizegorodec»), поэтому
 * сорт определяется не точным совпадением, а расстоянием между упрощёнными формами:
 * латиница приводится к общему виду (c→k, ch→sh, zh→j, ya→a…), считается расстояние
 * Левенштейна, пары назначаются от самой уверенной к самой слабой. Что не легло
 * уверенно — не угадывается, а выводится в отчёт: чужое фото на карточке сорта хуже,
 * чем его отсутствие.
 *
 * Запуск:
 *   node Seedlings/scripts/yandex-photos.mjs <публичная-ссылка> [--dry]
 *   --dry — только показать раскладку, ничего не скачивая
 */
import fs from "node:fs";
import path from "node:path";
import { getProducts, CULTURE_BY_KEY } from "../site/lib/catalog.ts";

const API = "https://cloud-api.yandex.net/v1/disk/public/resources";
const link = process.argv[2];
const dry = process.argv.includes("--dry");
if (!link || link.startsWith("--")) {
  console.error("Укажите публичную ссылку: node Seedlings/scripts/yandex-photos.mjs <ссылка>");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const intakeDir = path.join(root, "assets/photos");
const folderOf = (culture) =>
  CULTURE_BY_KEY.get(culture).name.replace("тип «фриго»", "фриго").replace(/[«»]/g, "");

/** Папки клиента → разделы каталога. Единственное место, где нужен ручной ключ. */
const SECTIONS = {
  smorodinazks: "currant",
  Malinaremontatnaya: "raspberry-ever",
  malinaletniya: "raspberry-summer",
  clubnicafrigo: "strawberry-frigo",
  clubnicazks: "strawberry-zks",
  ezhevica: "blackberry",
  golubica: "blueberry",
};

/**
 * Файлы, имя которых ничего не говорит о сорте. Сорт прочитан с самой фотографии:
 * у клиента подпись впечатана в кадр. Ключ — начало имени файла.
 */
const OVERRIDES = {
  "R2-4FI_PvejBpFrEfTXNT0": "klubnika-frigo-kleri",
  "wZJBcA-24UhOz1FTcIb9ME": "klubnika-frigo-malvina",
};

const CYR = {
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",
  н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",щ:"sch",
  ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
};

/** Упрощение написания: разные латинские записи одного звука сводятся к одной букве */
function simplify(s) {
  return s
    .toLowerCase()
    .split("")
    .map((c) => CYR[c] ?? c)
    .join("")
    .replace(/[^a-z]/g, "")
    .replace(/dzh|zh|j/g, "j")
    .replace(/ch|sh|sch/g, "sh")
    .replace(/ck|kh|q/g, "k")
    .replace(/ts/g, "c")
    .replace(/yu|iu/g, "u")
    .replace(/ya|ia/g, "a")
    .replace(/y/g, "i")
    .replace(/ee|e/g, "e");
}

/** Латинская «c» звучит то как «к», то как «ц» — сравниваем оба прочтения */
const variants = (s) => [simplify(s).replace(/c/g, "k"), simplify(s).replace(/c/g, "s")];

function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[a.length][b.length];
}

const score = (name, file) => {
  let best = Infinity;
  for (const a of variants(name)) for (const b of variants(file)) best = Math.min(best, distance(a, b));
  return best;
};

async function api(params) {
  const url = `${API}?${new URLSearchParams({ public_key: link, limit: "200", ...params })}`;
  const r = await fetch(url);
  const j = await r.json();
  if (j.error) throw new Error(`${j.error}: ${j.message}`);
  return j;
}

const products = getProducts();
const report = { taken: [], guessed: [], unmatchedFiles: [], missing: [] };

const rootListing = await api({});
for (const dir of rootListing._embedded.items.filter((i) => i.type === "dir")) {
  const culture = SECTIONS[dir.name];
  if (!culture) {
    console.log(`Папка «${dir.name}» не сопоставлена ни с одним разделом — пропускаю`);
    continue;
  }
  const meta = CULTURE_BY_KEY.get(culture);
  const listing = await api({ path: `/${dir.name}` });
  const files = listing._embedded.items.filter(
    (i) => i.type === "file" && /\.(jpe?g|png|webp|heic)$/i.test(i.name),
  );
  const sorts = products.filter((p) => p.culture === culture);

  const usedFiles = new Set();
  const usedSorts = new Set();

  // Сначала — прочитанные с кадра вручную: они точнее любого сравнения имён
  for (const f of files) {
    const key = Object.keys(OVERRIDES).find((k) => f.name.startsWith(k));
    if (!key) continue;
    const sort = sorts.find((s) => s.slug === OVERRIDES[key]);
    if (!sort) continue;
    usedFiles.add(f.name);
    usedSorts.add(sort.slug);
    report.taken.push({ file: f, sort, meta, d: 0 });
  }

  // Остальные пары назначаются от самой уверенной: одно фото — одному сорту
  const pairs = [];
  for (const f of files)
    for (const s of sorts)
      pairs.push({ file: f, sort: s, d: score(s.name, f.name.replace(/\.[^.]+$/, "")) });
  pairs.sort((a, b) => a.d - b.d);

  const limit = 4; // дальше это уже не опечатка в написании, а другое слово
  for (const p of pairs) {
    if (p.d > limit || usedFiles.has(p.file.name) || usedSorts.has(p.sort.slug)) continue;
    usedFiles.add(p.file.name);
    usedSorts.add(p.sort.slug);
    report.taken.push({ ...p, meta });
  }

  // Остался ровно один сорт и ровно один файл — это они и есть, гадать не о чем
  const restFiles = files.filter((f) => !usedFiles.has(f.name));
  const restSorts = sorts.filter((s) => !usedSorts.has(s.slug));
  if (restFiles.length === 1 && restSorts.length === 1) {
    report.guessed.push({ file: restFiles[0], sort: restSorts[0], meta, d: -1 });
  } else {
    for (const f of restFiles) report.unmatchedFiles.push({ file: f, meta });
    for (const s of restSorts) report.missing.push({ sort: s, meta });
  }
}

for (const item of [...report.taken, ...report.guessed]) {
  const dir = path.join(intakeDir, folderOf(item.sort.culture), item.sort.name);
  const out = path.join(dir, item.file.name);
  const how = item.d === -1 ? "по остатку" : `похоже (${item.d})`;
  console.log(`  ${item.meta.name} · ${item.sort.name} ← ${item.file.name} — ${how}`);
  if (dry) continue;
  fs.mkdirSync(dir, { recursive: true });
  const href = await api({ path: item.file.path.replace(/^disk:/, "") });
  const download = await fetch(href.file ?? item.file.file);
  if (!download.ok) throw new Error(`${download.status} на ${item.file.name}`);
  fs.writeFileSync(out, Buffer.from(await download.arrayBuffer()));
}

console.log(`\nРазложено: ${report.taken.length + report.guessed.length} из ${products.length} сортов.`);
if (report.unmatchedFiles.length) {
  console.log(`\nНе понял, к какому сорту относятся (${report.unmatchedFiles.length}):`);
  for (const u of report.unmatchedFiles) console.log(`  ${u.meta.name} — ${u.file.name}`);
}
if (report.missing.length) {
  console.log(`\nСортов без фотографии (${report.missing.length}):`);
  for (const m of report.missing) console.log(`  ${m.meta.name} — ${m.sort.name}`);
}
