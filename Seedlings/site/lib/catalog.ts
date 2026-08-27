/**
 * Слой данных каталога. Модель товара зафиксирована в Seedlings/docs/02-analysis.md.
 * Данные демонстрационные: реальный источник — выгрузка из Бизнес.ру (docs/08-integrations.md §2),
 * подключается заменой getProducts().
 */

/**
 * Раздел каталога. У клиента ассортимент делится не по ботанике, а по разделам:
 * одна культура может стоять в двух («малина ремонтантная» и «малина летняя»),
 * а тип посадочного материала — часть названия раздела («смородина ЗКС», «клубника фриго»).
 * Разделы согласованы с клиентом 27 августа 2026 и других не будет (решение D-30).
 */
export type Culture =
  | "currant"
  | "raspberry-ever"
  | "raspberry-summer"
  | "strawberry-frigo"
  | "strawberry-zks"
  | "blackberry"
  | "blueberry";

/** Срок созревания / плодоношения */
export type Ripening = "early" | "mid" | "late" | "everbearing";

/** Фасовка и корневая система */
export type Container = "cassette" | "p9" | "pot1l" | "okc" | "frigo";

/** Сезонный статус — ядро логики ниши, docs/02-analysis.md §3 */
export type Availability = "in_stock" | "preorder" | "out_of_season";

export type Review = {
  author: string;
  region: string;
  rating: number;
  date: string;
  text: string;
};

export type Product = {
  slug: string;
  culture: Culture;
  /** Подтип: «Ремонтантная», «Штамбовая», «Крупноплодная» — второй фасет каталога */
  kind: string;
  /** Название сорта */
  name: string;
  ripening: Ripening;
  container: Container;
  /** Штук в упаковке */
  packSize: number;
  /** Цена за упаковку, ₽ */
  price: number;
  oldPrice?: number;
  availability: Availability;
  /** Дата ближайшей отгрузки, ISO */
  shipsFrom: string;
  /** Остаток упаковок в партии */
  stockLeft: number;
  /** Зимостойкость, °C (отрицательное) */
  hardiness: number;
  /** Урожайность с куста */
  yieldPerBush: string;
  /** Размер плода / ягоды */
  fruitSize: string;
  /** Высота взрослого растения */
  height: string;
  /** Требования к свету */
  sun: string;
  /** Окно посадки: [месяц с, месяц по] */
  plantingWindow: [number, number];
  /** Вес упаковки, кг — для расчёта доставки */
  weight: number;
  isNew: boolean;
  isHit: boolean;
  rating: number;
  reviewCount: number;
  short: string;
  description: string;
  care: string[];
  reviews: Review[];
};

/* ---------- Культуры ---------- */

export type CultureMeta = {
  key: Culture;
  /** Сегмент URL: /catalog/[culture] */
  slug: string;
  name: string;
  /** Родительный падеж для заголовков: «сорта клубники» */
  genitive: string;
  lead: string;
  seo: string;
  /** Цвет плода — кормит иллюстрацию товара */
  fruitHex: string;
  leafHex: string;
};

export const CULTURES: CultureMeta[] = [
  {
    key: "currant",
    slug: "smorodina-zks",
    name: "Смородина ЗКС",
    genitive: "смородины",
    lead: "Саженцы с закрытой корневой системой: приживаются в любой месяц сезона, потому что корень едет в горшке и не пересыхает.",
    seo: "Саженцы чёрной смородины с закрытой корневой системой из собственного питомника: Бен Хоупен, Рубен, Титания, Белорусская сладкая. Указаны зимостойкость, урожайность и размер ягоды каждого сорта.",
    fruitHex: "#3b2b52",
    leafHex: "#4a8a3f",
  },
  {
    key: "raspberry-ever",
    slug: "malina-remontantnaya",
    name: "Малина ремонтантная",
    genitive: "ремонтантной малины",
    lead: "Плодоносит на побегах этого года, с августа до морозов. Осенью куст срезается под ноль — ни подвязки, ни зимовки побегов.",
    seo: "Саженцы ремонтантной малины: Карамелька, Полька, Джоан Джей, Зюгана и ещё девять сортов. Закрытая корневая система, урожай с августа до заморозков, зимостойкость до −32 °C.",
    fruitHex: "#c33a63",
    leafHex: "#3d7f43",
  },
  {
    key: "raspberry-summer",
    slug: "malina-letnyaya",
    name: "Малина летняя",
    genitive: "летней малины",
    lead: "Урожай на прошлогодних побегах — с конца июня до конца июля. Ягода крупнее и слаще ремонтантной, но побеги нужно сохранить до весны.",
    seo: "Саженцы летней малины: Соколица, Лячка, Глен Ампл, Октавия и другие сорта. Крупная ягода, урожай с конца июня, закрытая корневая система.",
    fruitHex: "#b8324f",
    leafHex: "#3d7f43",
  },
  {
    key: "strawberry-frigo",
    slug: "klubnika-frigo",
    name: "Клубника тип «фриго»",
    genitive: "клубники фриго",
    lead: "Рассада, выкопанная в состоянии покоя и хранящаяся при −1 °C. Высаживается партиями с апреля по июль, ягода — через 8–9 недель после посадки.",
    seo: "Клубника фриго из питомника: охлаждённая рассада сортов Мальвина и Клери. Высадка партиями с апреля по июль, первый урожай через два месяца после посадки.",
    fruitHex: "#d8392f",
    leafHex: "#3f8f4a",
  },
  {
    key: "strawberry-zks",
    slug: "klubnika-zks",
    name: "Клубника ЗКС",
    genitive: "клубники",
    lead: "Рассада в кассетах с торфяным комом: высаживается весь сезон, включая август — лучший месяц для закладки урожая будущего года.",
    seo: "Рассада клубники с закрытой корневой системой: сорта Априка и Прими в кассетах. Высадка с апреля по сентябрь, бронь без предоплаты.",
    fruitHex: "#d8392f",
    leafHex: "#3f8f4a",
  },
  {
    key: "blackberry",
    slug: "ezhevika",
    name: "Ежевика крупноплодная",
    genitive: "ежевики",
    lead: "Ягода до 20 г и урожай до 9 кг с куста. Требует пригибания на зиму — взамен даёт больше любой другой ягоды на том же метре грядки.",
    seo: "Саженцы крупноплодной ежевики Карака Блэк и Вошито с закрытой корневой системой. Ягода до 20 г, урожайность до 9 кг с куста, инструкция по укрытию на зиму.",
    fruitHex: "#2f2740",
    leafHex: "#3f7f45",
  },
  {
    key: "blueberry",
    slug: "golubika",
    name: "Голубика 1,5–3 года",
    genitive: "голубики",
    lead: "Подрощенные кусты: чем старше саженец, тем ближе первый полноценный урожай. Нужен кислый торфяной грунт — без него голубика не растёт.",
    seo: "Саженцы садовой голубики Дюк, Блюкроп и Сиерра возрастом от 1,5 до 3 лет. Закрытая корневая система, зимостойкость до −34 °C, памятка по кислому грунту.",
    fruitHex: "#4a6fb0",
    leafHex: "#4f8c4a",
  },
];

export const CULTURE_BY_KEY = new Map(CULTURES.map((c) => [c.key, c]));
export const CULTURE_BY_SLUG = new Map(CULTURES.map((c) => [c.slug, c]));

/* ---------- Словари ---------- */

export const RIPENING_LABEL: Record<Ripening, string> = {
  early: "Ранний",
  mid: "Средний",
  late: "Поздний",
  everbearing: "Ремонтантный",
};

export const CONTAINER_LABEL: Record<Container, string> = {
  cassette: "Кассета",
  p9: "Горшок P9",
  pot1l: "Горшок 1 л",
  okc: "Открытая корневая",
  frigo: "Рассада фриго",
};

export const CONTAINER_HINT: Record<Container, string> = {
  cassette: "Кассета с торфяным комом — высадка без пересадочного стресса",
  p9: "Горшок 9×9 см, закрытая корневая система",
  pot1l: "Горшок 1 л, закрытая корневая система",
  okc: "Открытая корневая система, отгрузка только в посадочное окно",
  frigo: "Охлаждённая рассада с открытой корневой: хранится при −1 °C и высаживается партиями с апреля по июль",
};

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  in_stock: "В наличии",
  preorder: "Предзаказ",
  out_of_season: "Сезон закрыт",
};

export const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export const MONTHS_IN = [
  "январе",
  "феврале",
  "марте",
  "апреле",
  "мае",
  "июне",
  "июле",
  "августе",
  "сентябре",
  "октябре",
  "ноябре",
  "декабре",
];

/* ---------- Сезон ---------- */

/** Даты отгрузок партий. В боевой версии приходят из Бизнес.ру. */
export const SHIPMENT = {
  now: "2026-08-28",
  autumn: "2026-09-05",
  spring: "2027-04-15",
};

/* ---------- Сырьё каталога ---------- */

type Raw = {
  name: string;
  kind: string;
  ripening: Ripening;
  hardiness: number;
  yieldPerBush: string;
  fruitSize: string;
  height: string;
  price: number;
  oldPrice?: number;
  packSize: number;
  container: Container;
  availability?: Availability;
  short: string;
  hit?: boolean;
  new?: boolean;
};

const CATALOG_RAW: Record<Culture, Raw[]> = {
  currant: [
    { name: "Бен Хоупен", kind: "Чёрная", ripening: "mid", hardiness: -32, yieldPerBush: "3–4 кг", fruitSize: "1,2–1,6 г", height: "1,8 м", price: 520, packSize: 1, container: "pot1l", short: "Шотландский сорт с устойчивостью к почковому клещу — главной беде чёрной смородины", hit: true },
    { name: "Рубен", kind: "Крупноплодная", ripening: "late", hardiness: -30, yieldPerBush: "4–6 кг", fruitSize: "2–3 г", height: "1,7 м", price: 560, oldPrice: 620, packSize: 1, container: "pot1l", short: "Ягода до 3 г и ровная кисть: собирать можно горстью, а не по одной" },
    { name: "Титания", kind: "Чёрная", ripening: "mid", hardiness: -34, yieldPerBush: "3–5 кг", fruitSize: "1,5–2 г", height: "1,9 м", price: 490, packSize: 1, container: "pot1l", short: "Шведская классика: не берёт мучнистую росу и ржавчину даже в сырое лето", hit: true },
    { name: "Белорусская сладкая", kind: "Десертная", ripening: "early", hardiness: -35, yieldPerBush: "3–4 кг", fruitSize: "1,2–1,5 г", height: "1,5 м", price: 470, packSize: 1, container: "pot1l", short: "Сахара больше, чем кислоты — эту смородину едят с куста, а не варят", new: true },
    { name: "Клауссоновская", kind: "Крупноплодная", ripening: "mid", hardiness: -33, yieldPerBush: "3,5–5 кг", fruitSize: "1,8–2,5 г", height: "1,6 м", price: 540, packSize: 1, container: "pot1l", short: "Белорусский сорт с крупной одномерной ягодой и стабильным урожаем в сырое лето", new: true },
  ],
  "raspberry-ever": [
    { name: "Карамелька", kind: "Десертная", ripening: "everbearing", hardiness: -28, yieldPerBush: "3–4,5 кг", fruitSize: "8–12 г", height: "1,5 м", price: 520, packSize: 1, container: "p9", short: "Самый сладкий сорт раздела: вкус карамели почти без кислинки", hit: true },
    { name: "Поэмат", kind: "Крупноплодная", ripening: "everbearing", hardiness: -25, yieldPerBush: "3,5–4,5 кг", fruitSize: "8–12 г", height: "1,8 м", price: 540, packSize: 1, container: "p9", short: "Польская новинка: ягода плотная, снимается сухой и не печётся в жару", new: true },
    { name: "Полька", kind: "Крупноплодная", ripening: "everbearing", hardiness: -25, yieldPerBush: "3–4 кг", fruitSize: "6–8 г", height: "1,6 м", price: 490, oldPrice: 560, packSize: 1, container: "p9", short: "Промышленный стандарт ремонтантной малины: отдаёт урожай с августа до морозов", hit: true },
    { name: "Полана", kind: "Ранняя", ripening: "everbearing", hardiness: -30, yieldPerBush: "2,5–3,5 кг", fruitSize: "5–7 г", height: "1,5 м", price: 450, packSize: 1, container: "p9", short: "Начинает плодоносить в июле — на три недели раньше Польки" },
    { name: "Джоан Джей", kind: "Бесшипная", ripening: "everbearing", hardiness: -25, yieldPerBush: "3–4 кг", fruitSize: "7–10 г", height: "1,6 м", price: 530, packSize: 1, container: "p9", short: "Ни одного шипа, ягода сама сходит с плодоложа — сбор вдвое быстрее", hit: true },
    { name: "Яна", kind: "Десертная", ripening: "everbearing", hardiness: -26, yieldPerBush: "2,5–3,5 кг", fruitSize: "6–9 г", height: "1,7 м", price: 480, packSize: 1, container: "p9", short: "Ягода светло-красная, ароматная, хорошо держит форму в заморозке" },
    { name: "Нижегородец", kind: "Зимостойкая", ripening: "everbearing", hardiness: -32, yieldPerBush: "2,5–3 кг", fruitSize: "5–8 г", height: "1,6 м", price: 420, packSize: 1, container: "p9", short: "Российская селекция для холодных участков: зимует без пригибания" },
    { name: "Прималба", kind: "Жёлтая", ripening: "everbearing", hardiness: -24, yieldPerBush: "2–3 кг", fruitSize: "5–7 г", height: "1,5 м", price: 560, packSize: 1, container: "p9", short: "Кремово-белая ягода без кислоты — её едят дети, которым нельзя красное", new: true },
    { name: "Геракл", kind: "Крупноплодная", ripening: "everbearing", hardiness: -30, yieldPerBush: "2,5–3,5 кг", fruitSize: "6–10 г", height: "1,8 м", price: 440, packSize: 1, container: "p9", short: "Мощный побег держит урожай без шпалеры, вкус кисло-сладкий" },
    { name: "Мопема", kind: "Крупноплодная", ripening: "everbearing", hardiness: -25, yieldPerBush: "3–4 кг", fruitSize: "7–9 г", height: "1,7 м", price: 500, packSize: 1, container: "p9", short: "Даёт ровную ягоду до заморозков и не мельчает к концу волны" },
    { name: "Энросандира", kind: "Десертная", ripening: "everbearing", hardiness: -24, yieldPerBush: "3–4,5 кг", fruitSize: "8–11 г", height: "1,8 м", price: 550, packSize: 1, container: "p9", short: "Итальянский сорт с плотной ягодой: лежит в холодильнике неделю", new: true },
    { name: "Аврора", kind: "Ранняя", ripening: "everbearing", hardiness: -27, yieldPerBush: "2,5–3,5 кг", fruitSize: "6–8 г", height: "1,6 м", price: 470, packSize: 1, container: "p9", short: "Первая волна в середине июля, вторая — в сентябре" },
    { name: "Зюгана", kind: "Двойного плодоношения", ripening: "everbearing", hardiness: -26, yieldPerBush: "4–5 кг", fruitSize: "7–10 г", height: "2 м", price: 580, packSize: 1, container: "p9", short: "Плодоносит дважды: летом на прошлогодних побегах и осенью на новых", hit: true },
  ],
  "raspberry-summer": [
    { name: "Соколица", kind: "Крупноплодная", ripening: "early", hardiness: -30, yieldPerBush: "3–4 кг", fruitSize: "6–8 г", height: "1,8 м", price: 450, packSize: 1, container: "p9", short: "Польский ранний сорт: ягода светлая, плотная, почти не осыпается", hit: true },
    { name: "Гусар", kind: "Слабошиповатая", ripening: "mid", hardiness: -32, yieldPerBush: "3–4 кг", fruitSize: "4–6 г", height: "2,2 м", price: 380, packSize: 1, container: "p9", short: "Почти без шипов и без капризов — сорт для тех, кто редко на даче" },
    { name: "Лячка", kind: "Крупноплодная", ripening: "early", hardiness: -28, yieldPerBush: "4–5 кг", fruitSize: "8–10 г", height: "2 м", price: 490, packSize: 1, container: "p9", short: "Длинная коническая ягода до 10 г, урожай снимается в три приёма" },
    { name: "Радзиева", kind: "Десертная", ripening: "early", hardiness: -28, yieldPerBush: "3,5–4,5 кг", fruitSize: "7–9 г", height: "1,9 м", price: 470, packSize: 1, container: "p9", short: "Самая ранняя в разделе: ягода в конце июня, вкус сладкий", new: true },
    { name: "Пшехиба", kind: "Крупноплодная", ripening: "mid", hardiness: -28, yieldPerBush: "4–5 кг", fruitSize: "8–12 г", height: "2 м", price: 510, packSize: 1, container: "p9", short: "Ягода до 12 г, куст мощный: нужна шпалера, но урожай её окупает" },
    { name: "Глен Ампл", kind: "Бесшипная", ripening: "mid", hardiness: -26, yieldPerBush: "4–6 кг", fruitSize: "6–9 г", height: "2,5 м", price: 540, oldPrice: 600, packSize: 1, container: "p9", short: "Шотландский бесшипный лидер: рекордная урожайность на шпалере", hit: true },
    { name: "Октавия", kind: "Поздняя", ripening: "late", hardiness: -27, yieldPerBush: "3,5–5 кг", fruitSize: "7–9 г", height: "2 м", price: 520, packSize: 1, container: "p9", short: "Закрывает летний сезон в конце июля, когда у соседей малина отошла" },
  ],
  "strawberry-frigo": [
    { name: "Мальвина", kind: "Поздняя", ripening: "late", hardiness: -23, yieldPerBush: "0,9–1,2 кг", fruitSize: "35–45 г", height: "30 см", price: 750, packSize: 10, container: "frigo", availability: "out_of_season", short: "Самый поздний десертный сорт: ягода идёт в июле, когда у соседей всё отошло" },
    { name: "Клери", kind: "Ранняя", ripening: "early", hardiness: -20, yieldPerBush: "0,7–0,9 кг", fruitSize: "25–40 г", height: "25 см", price: 720, packSize: 10, container: "frigo", availability: "out_of_season", short: "Глянцевая плотная ягода, которая не мнётся при перевозке", hit: true },
  ],
  "strawberry-zks": [
    { name: "Априка", kind: "Ранняя", ripening: "early", hardiness: -21, yieldPerBush: "0,8–1,1 кг", fruitSize: "30–45 г", height: "28 см", price: 450, packSize: 5, container: "cassette", short: "Итальянская ранняя: ровная блестящая ягода с земляничным ароматом", hit: true },
    { name: "Прими", kind: "Крупноплодная", ripening: "mid", hardiness: -21, yieldPerBush: "0,9–1,3 кг", fruitSize: "35–50 г", height: "30 см", price: 480, oldPrice: 540, packSize: 5, container: "cassette", short: "Крупная ягода и дружная отдача: с пяти кустов ведро за сезон", new: true },
  ],
  blackberry: [
    { name: "Карака Блэк", kind: "Крупноплодная", ripening: "early", hardiness: -20, yieldPerBush: "5–8 кг", fruitSize: "12–20 г", height: "3 м", price: 690, packSize: 1, container: "pot1l", short: "Ягода до 20 г и 5 см длиной — самая крупная ежевика в питомнике", hit: true },
    { name: "Вошито", kind: "Бесшипная", ripening: "mid", hardiness: -22, yieldPerBush: "6–9 кг", fruitSize: "8–10 г", height: "2 м", price: 650, packSize: 1, container: "pot1l", short: "Прямостоячие бесшипные побеги: не царапают и почти не требуют шпалеры" },
  ],
  blueberry: [
    { name: "Дюк", kind: "Высокорослая", ripening: "early", hardiness: -32, yieldPerBush: "4–6 кг", fruitSize: "17–20 мм", height: "1,6 м", price: 890, packSize: 1, container: "pot1l", short: "Саженец двух лет. Цветёт поздно, а созревает рано — уходит от возвратных заморозков", hit: true },
    { name: "Блюкроп", kind: "Высокорослая", ripening: "mid", hardiness: -34, yieldPerBush: "6–9 кг", fruitSize: "18–22 мм", height: "1,9 м", price: 1290, oldPrice: 1450, packSize: 1, container: "pot1l", short: "Трёхлетний куст: мировой стандарт голубики, до 9 кг с растения" },
    { name: "Сиерра", kind: "Полувысокорослая", ripening: "mid", hardiness: -30, yieldPerBush: "4–6 кг", fruitSize: "18–20 мм", height: "1,8 м", price: 790, packSize: 1, container: "pot1l", short: "Саженец полутора лет, вкус сладкий с ароматом — лучший в свежем виде", new: true },
  ],
};

/* ---------- Тексты, собираемые из данных ---------- */

const CARE: Record<Culture, string[]> = {
  currant: [
    "Сажайте наклонно, под углом 45°, заглубляя корневую шейку на 5–7 см — куст даст новые побеги от земли.",
    "После посадки обрежьте побеги, оставив 3–4 почки: год потеряете, куст выиграете.",
    "Смородина любит воду: в июне и июле по два ведра на куст в неделю.",
    "Каждую осень вырезайте ветви старше четырёх лет — они уже не плодоносят.",
  ],
  "raspberry-ever": [
    "Готовьте траншею 40×40 см, на дно — ведро перегноя и горсть золы.",
    "Между кустами 70 см, между рядами 1,5 м: загущенная малина болеет.",
    "Осенью срезайте всю надземную часть под ноль — весь урожай будет на побегах следующего года.",
    "Мульча из скошенной травы слоем 10 см заменяет половину поливов.",
  ],
  "raspberry-summer": [
    "Сразу ставьте шпалеру: летние сорта плодоносят на прошлогодних побегах, и их нужно сохранить.",
    "Сразу после сбора вырезайте отплодоносившие стебли под корень — они больше не дадут ягод.",
    "Оставляйте 6–8 сильных побегов замещения на куст, остальное удаляйте молодым.",
    "На зиму побеги пригибайте к земле дугой и фиксируйте: под снегом они не вымерзают.",
  ],
  "strawberry-frigo": [
    "Не размораживайте заранее: рассаду достают из холода и высаживают в тот же день.",
    "Перед посадкой подержите корни в воде 20–30 минут, длинные подрежьте до 10 см.",
    "Сердечко — строго на уровне почвы; корни расправьте вертикально, не загибая.",
    "Первые две недели поливайте ежедневно: у фриго нет кома, корню нужно тронуться в рост.",
  ],
  "strawberry-zks": [
    "Высаживайте вечером или в пасмурный день, сердечко куста — строго на уровне почвы.",
    "Первые 10 дней поливайте через день, дальше — раз в неделю, но обильно.",
    "Замульчируйте соломой или агроволокном: ягода останется чистой, а земля влажной.",
    "На четвёртый год пересадите на новое место — старая грядка теряет урожай.",
  ],
  blackberry: [
    "Место солнечное и защищённое от ветра, между кустами 2–2,5 м: ежевика разрастается.",
    "Шпалера в три яруса — побеги тяжёлые и без опоры ложатся на землю вместе с урожаем.",
    "Отплодоносившие побеги вырезайте сразу после сбора, оставляя 5–6 молодых.",
    "На зиму снимите побеги со шпалеры, пригните и укройте — это обязательная работа, не опция.",
  ],
  blueberry: [
    "Голубике нужен кислый грунт pH 3,5–5: посадочная яма 60×60 см целиком заполняется верховым торфом.",
    "Никакого навоза, золы и извести — они поднимают pH, и куст желтеет и встаёт.",
    "Мульчируйте хвойным опадом или щепой слоем 8–10 см, корень поверхностный и пересыхает первым.",
    "Подкисляйте поливом раз в месяц: чайная ложка лимонной кислоты на ведро воды.",
  ],
};

/*
 * Пул отзывов убран 27 августа 2026: он был вымышленным, а вымышленный отзыв в нише живого
 * товара — обман покупателя, который на него и опирается. Настоящие переносим из обсуждений
 * сообщества ВКонтакте с согласия авторов (docs/09-questions.md).
 */

/* ---------- Сборка ---------- */

/** Детерминированный хэш — чтобы рейтинги и остатки не прыгали между сборками */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function slugify(culture: Culture, name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
    й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
    у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
    э: "e", ю: "yu", я: "ya",
  };
  const base = name
    .toLowerCase()
    .split("")
    .map((c) => (map[c] !== undefined ? map[c] : /[a-z0-9]/.test(c) ? c : "-"))
    .join("")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `${CULTURE_BY_KEY.get(culture)!.slug}-${base}`;
}

const PLANTING: Record<Culture, [number, number]> = {
  currant: [4, 10],
  "raspberry-ever": [4, 10],
  "raspberry-summer": [4, 10],
  // Фриго высаживают партиями с апреля по июль: посаженная позже не успевает отдать урожай
  "strawberry-frigo": [4, 7],
  "strawberry-zks": [4, 9],
  blackberry: [4, 10],
  blueberry: [4, 10],
};

const WEIGHT: Record<Container, number> = {
  cassette: 0.9,
  p9: 1.4,
  pot1l: 2.2,
  okc: 0.7,
  frigo: 0.35,
};

function describe(raw: Raw, culture: Culture): string {
  const c = CULTURE_BY_KEY.get(culture)!;
  const ripe =
    raw.ripening === "everbearing"
      ? "плодоносит волнами весь сезон"
      : `${RIPENING_LABEL[raw.ripening].toLowerCase()} срок созревания`;
  const winter =
    raw.hardiness < 0
      ? `Зимостойкость до ${raw.hardiness} °C — сорт проверен на наших полях в средней полосе.`
      : "Культура теплолюбивая: высаживается после возвратных заморозков, при температуре почвы от +15 °C.";
  // Подтип авторский и уже согласован с названием раздела: «смородина ЗКС — чёрная»,
  // «малина летняя — бесшипная». Собирать через родительный падеж нельзя.
  // Если подтип уже назвал срок («Ранняя», «Поздняя»), второй раз про него не пишем.
  // Сравниваем по основе: «ранний» и «ранняя» — одно и то же слово в разных родах.
  const kind = raw.kind.toLowerCase();
  const stem = RIPENING_LABEL[raw.ripening].toLowerCase().replace(/(ий|ый|ая|ое)$/, "");
  const duplicate = kind.includes(stem);
  return [
    duplicate
      ? `${c.name} «${raw.name}» — ${kind}. ${raw.short}.`
      : `${c.name} «${raw.name}» — ${kind}, ${ripe}. ${raw.short}.`,
    `Урожайность ${raw.yieldPerBush} с растения, размер плода ${raw.fruitSize}, высота взрослого растения ${raw.height}.`,
    winter,
    `Мы выращиваем этот сорт сами: маточник заложен из проверенного посадочного материала, каждое растение отбирается вручную перед отгрузкой. Растения едут ${CONTAINER_HINT[raw.container].toLowerCase()}.`,
  ].join(" ");
}

function build(culture: Culture, raw: Raw): Product {
  const slug = slugify(culture, raw.name);
  const h = hash(slug);
  const availability: Availability = raw.availability ?? "in_stock";
  const reviewCount = 0;
  const reviews: Review[] = [];
  const rating = 0;

  return {
    slug,
    culture,
    kind: raw.kind,
    name: raw.name,
    ripening: raw.ripening,
    container: raw.container,
    packSize: raw.packSize,
    price: raw.price,
    oldPrice: raw.oldPrice,
    availability,
    shipsFrom:
      availability === "in_stock"
        ? SHIPMENT.now
        : availability === "preorder"
          ? SHIPMENT.autumn
          : SHIPMENT.spring,
    stockLeft: availability === "out_of_season" ? 0 : 2 + (h % 40),
    hardiness: raw.hardiness,
    yieldPerBush: raw.yieldPerBush,
    fruitSize: raw.fruitSize,
    height: raw.height,
    // Голубика в полутени даёт кислую и мелкую ягоду — единственная культура с жёстким требованием
    sun: culture === "blueberry" ? "Только солнце" : "Солнце, лёгкая полутень",
    plantingWindow: PLANTING[culture],
    weight: WEIGHT[raw.container] * Math.max(1, raw.packSize / 5),
    isNew: Boolean(raw.new),
    isHit: Boolean(raw.hit),
    rating,
    reviewCount,
    short: raw.short,
    description: describe(raw, culture),
    care: CARE[culture],
    reviews,
  };
}

const PRODUCTS: Product[] = CULTURES.flatMap((c) =>
  CATALOG_RAW[c.key].map((raw) => build(c.key, raw)),
);

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function countByCulture(): Record<Culture, number> {
  const out = {} as Record<Culture, number>;
  for (const c of CULTURES) out[c.key] = 0;
  for (const p of PRODUCTS) out[p.culture]++;
  return out;
}

/** Цена за штуку — эконом-сегмент считает именно её (docs/02 §5) */
export function pricePerUnit(p: Product): number {
  return Math.round(p.price / p.packSize);
}

export function packLabel(p: Product): string {
  if (p.packSize === 1) return CONTAINER_LABEL[p.container];
  return `${p.packSize} шт. · ${CONTAINER_LABEL[p.container].toLowerCase()}`;
}

/** Зимостойкость с типографским минусом: в интерфейсе «−28 °C», а не дефис */
export function hardinessLabel(hardiness: number): string {
  return `${String(hardiness).replace("-", "\u2212")} °C`;
}

/** Ключевая характеристика строкой — для карточки в сетке */
export function keyTrait(p: Product): string {
  const parts = [p.kind];
  const ripening = RIPENING_LABEL[p.ripening].toLowerCase();
  const stem = ripening.replace(/(ий|ый|ая|ое)$/, "");
  // Срок не повторяем, если его уже назвал тип сорта («Ранняя») или сам раздел
  // («Малина ремонтантная»): иначе на карточке трижды одно и то же слово.
  const named =
    p.kind.toLowerCase().includes(stem) ||
    (CULTURE_BY_KEY.get(p.culture)?.name.toLowerCase().includes(stem) ?? false);
  if (!named) parts.push(ripening);
  if (p.hardiness < 0) parts.push(`до ${hardinessLabel(p.hardiness)}`);
  return parts.join(" · ");
}

export function shipsLabel(p: Product): string {
  const d = new Date(p.shipsFrom);
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  if (p.availability === "in_stock") return `Отгрузка с ${date}`;
  if (p.availability === "preorder") return `Отгрузка партии с ${date}`;
  return `Вернётся в продажу ${date}`;
}

export function plantingLabel(p: Product): string {
  const [from, to] = p.plantingWindow;
  return `${MONTHS[from - 1].replace(/я$/, "ь")}–${MONTHS[to - 1]}`.replace("апрель", "апрель");
}

/** Товары, которые уместно сажать в указанном месяце и которые можно купить сейчас */
export function seasonalPicks(month: number, limit = 8): Product[] {
  return PRODUCTS.filter(
    (p) =>
      p.availability !== "out_of_season" &&
      month >= p.plantingWindow[0] &&
      month <= p.plantingWindow[1],
  )
    .sort((a, b) => Number(b.isHit) - Number(a.isHit) || b.rating - a.rating)
    .slice(0, limit);
}

export function hits(limit = 8): Product[] {
  return PRODUCTS.filter((p) => p.isHit).slice(0, limit);
}

export function onSale(limit = 12): Product[] {
  return PRODUCTS.filter((p) => p.oldPrice).slice(0, limit);
}

export function related(p: Product, limit = 4): Product[] {
  return PRODUCTS.filter((x) => x.culture === p.culture && x.slug !== p.slug)
    .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
    .slice(0, limit);
}

/** Допродажа комплектом: другой срок созревания той же культуры (docs/02 §1) */
export function alsoBuy(p: Product, limit = 3): Product[] {
  return PRODUCTS.filter(
    (x) => x.slug !== p.slug && x.availability !== "out_of_season" &&
      (x.culture === p.culture ? x.ripening !== p.ripening : x.isHit),
  )
    .sort((a, b) => Number(a.culture !== p.culture) - Number(b.culture !== p.culture))
    .slice(0, limit);
}

/* ---------- Фасовки одного сорта ---------- */

export type Variant = {
  id: string;
  container: Container;
  packSize: number;
  price: number;
  oldPrice?: number;
  hint: string;
};

/**
 * Варианты фасовки. В боевой версии каждая фасовка — отдельная позиция номенклатуры
 * Бизнес.ру со своим артикулом и остатком (docs/08-integrations.md §2).
 */
export function variantsOf(p: Product): Variant[] {
  const base: Variant = {
    id: p.slug,
    container: p.container,
    packSize: p.packSize,
    price: p.price,
    oldPrice: p.oldPrice,
    hint: CONTAINER_HINT[p.container],
  };
  if (p.container === "cassette") {
    return [
      base,
      {
        id: `${p.slug}--p9`,
        container: "p9",
        packSize: 1,
        price: Math.round((p.price / p.packSize) * 1.7),
        hint: CONTAINER_HINT.p9,
      },
    ];
  }
  if (p.container === "pot1l") {
    return [
      base,
      {
        id: `${p.slug}--okc`,
        container: "okc",
        packSize: 1,
        price: Math.round(p.price * 0.72),
        hint: CONTAINER_HINT.okc,
      },
    ];
  }
  return [base];
}

/** Слаг товара без суффикса фасовки */
export function baseSlug(id: string): string {
  return id.split("--")[0];
}

/**
 * Разбор идентификатора позиции корзины: «слаг» или «слаг--фасовка».
 * Возвращает товар с подставленными ценой, фасовкой и весом выбранной фасовки.
 */
export function resolveSku(id: string): Product | undefined {
  const base = getProduct(baseSlug(id));
  if (!base) return undefined;
  if (!id.includes("--")) return base;
  const variant = variantsOf(base).find((v) => v.id === id);
  if (!variant) return base;
  return {
    ...base,
    slug: id,
    container: variant.container,
    packSize: variant.packSize,
    price: variant.price,
    oldPrice: variant.oldPrice,
    weight: WEIGHT[variant.container] * Math.max(1, variant.packSize / 5),
  };
}
