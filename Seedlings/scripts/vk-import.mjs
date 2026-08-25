/**
 * Импорт из сообщества ВКонтакте: название, описание, товары, цены, фотографии.
 *
 * Страницы ВК закрыты антибот-проверкой, поэтому берём данные официальным API —
 * это и легально, и стабильно.
 *
 * Запуск:
 *   VK_TOKEN=<токен> node Seedlings/scripts/vk-import.mjs
 *   VK_TOKEN=<токен> node Seedlings/scripts/vk-import.mjs --group kupit_sazhentsy_maliny_klubniki
 *
 * Токен: сервисный ключ Standalone-приложения (vk.com/dev → Мои приложения) либо ключ
 * сообщества с доступом к товарам, стене и фотографиям.
 *
 * Что делает:
 *   1. groups.getById   — название, описание, контакты, обложка
 *   2. market.get       — товары: название, описание, цена, наличие, фото
 *   3. photos.getAll    — фотографии со стены, если товаров нет
 *   4. wall.get         — тексты постов: часто именно там описания сортов
 *   5. Скачивает фотографии в Seedlings/site/public/photos/vk/
 *   6. Складывает сырьё в Seedlings/vk-export/ для разбора
 */
import fs from "node:fs";
import path from "node:path";

const API = "https://api.vk.com/method";
const VERSION = "5.199";
const TOKEN = process.env.VK_TOKEN ?? readTokenFile();
const groupArg = process.argv.indexOf("--group");
const GROUP = groupArg > -1 ? process.argv[groupArg + 1] : "kupit_sazhentsy_maliny_klubniki";

const root = path.resolve(import.meta.dirname, "..");
const exportDir = path.join(root, "vk-export");
const photoDir = path.join(root, "site/public/photos/vk");

function readTokenFile() {
  const candidates = [path.resolve(process.cwd(), ".vk-token")];
  for (const file of candidates) {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim();
  }
  return null;
}

if (!TOKEN) {
  console.error(
    "Нет токена. Передайте VK_TOKEN=<токен> или положите его в файл .vk-token в корне репозитория.",
  );
  process.exit(1);
}

async function call(method, params = {}) {
  const query = new URLSearchParams({ ...params, access_token: TOKEN, v: VERSION });
  const response = await fetch(`${API}/${method}?${query}`);
  const data = await response.json();
  if (data.error) {
    throw new Error(`${method}: [${data.error.error_code}] ${data.error.error_msg}`);
  }
  return data.response;
}

/** Постранично забирает всё, что отдаёт метод с count/offset */
async function collect(method, params, limit = 200) {
  const items = [];
  let offset = 0;
  for (;;) {
    const page = await call(method, { ...params, count: limit, offset });
    const batch = page?.items ?? [];
    items.push(...batch);
    offset += batch.length;
    if (batch.length < limit || offset >= (page?.count ?? 0)) break;
  }
  return items;
}

/** Из набора размеров ВК берём самый крупный */
function bestPhoto(photo) {
  const sizes = photo?.sizes ?? [];
  return sizes.reduce((best, s) => (!best || s.width > best.width ? s : best), null)?.url ?? null;
}

async function download(url, file) {
  if (fs.existsSync(file)) return false;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} на ${url}`);
  fs.writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  return true;
}

fs.mkdirSync(exportDir, { recursive: true });
fs.mkdirSync(photoDir, { recursive: true });

/* 1. Сообщество */
const [group] = await call("groups.getById", {
  group_id: GROUP,
  fields: "description,contacts,city,site,status,members_count,cover,addresses,market",
});
console.log(`Сообщество: ${group.name} (id ${group.id}), участников ${group.members_count ?? "—"}`);
if (group.description) console.log(`Описание: ${group.description.slice(0, 200)}…`);

const ownerId = -group.id;

/* 2. Товары */
let market = [];
try {
  market = await collect("market.get", { owner_id: ownerId, extended: 1 });
  console.log(`Товаров в разделе «Товары»: ${market.length}`);
} catch (e) {
  console.log(`Товары недоступны — ${e.message}`);
}

/* 3. Фотографии */
let photos = [];
try {
  photos = await collect("photos.getAll", { owner_id: ownerId, photo_sizes: 1 }, 200);
  console.log(`Фотографий на стене: ${photos.length}`);
} catch (e) {
  console.log(`Фотографии недоступны — ${e.message}`);
}

/* 4. Посты — в них обычно лежат описания сортов */
let wall = [];
try {
  wall = await collect("wall.get", { owner_id: ownerId }, 100);
  console.log(`Постов на стене: ${wall.length}`);
} catch (e) {
  console.log(`Стена недоступна — ${e.message}`);
}

/* 5. Скачиваем фотографии товаров */
let saved = 0;
for (const item of market) {
  const list = item.photos?.length ? item.photos : item.thumb_photo ? [{ sizes: [{ url: item.thumb_photo, width: 1 }] }] : [];
  for (const [i, photo] of list.entries()) {
    const url = bestPhoto(photo) ?? photo.sizes?.[0]?.url;
    if (!url) continue;
    const file = path.join(photoDir, `market-${item.id}${i ? `-${i + 1}` : ""}.jpg`);
    try {
      if (await download(url, file)) saved++;
    } catch (e) {
      console.log(`  не скачалось ${file}: ${e.message}`);
    }
  }
}
console.log(`Скачано фотографий товаров: ${saved} → ${path.relative(process.cwd(), photoDir)}`);

/* 6. Сырьё для разбора */
const dump = {
  group: {
    id: group.id,
    name: group.name,
    screen_name: group.screen_name,
    description: group.description ?? null,
    status: group.status ?? null,
    site: group.site ?? null,
    city: group.city?.title ?? null,
    addresses: group.addresses ?? null,
    contacts: group.contacts ?? null,
  },
  market: market.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    price: m.price?.amount ? Number(m.price.amount) / 100 : null,
    currency: m.price?.currency?.name ?? null,
    availability: m.availability,
    category: m.category?.name ?? null,
    url: m.url ?? null,
    photos: (m.photos ?? []).map(bestPhoto).filter(Boolean),
  })),
  wall: wall.map((p) => ({
    id: p.id,
    date: new Date(p.date * 1000).toISOString().slice(0, 10),
    text: p.text,
    photos: (p.attachments ?? [])
      .filter((a) => a.type === "photo")
      .map((a) => bestPhoto(a.photo))
      .filter(Boolean),
  })),
  photos: photos.map((p) => ({ id: p.id, text: p.text ?? "", url: bestPhoto(p) })),
};

const dumpFile = path.join(exportDir, "vk-dump.json");
fs.writeFileSync(dumpFile, JSON.stringify(dump, null, 2));
console.log(`Сырьё сохранено: ${path.relative(process.cwd(), dumpFile)}`);
console.log("\nДальше: разбор дампа в модель товара (lib/catalog.ts) и манифест фото.");
