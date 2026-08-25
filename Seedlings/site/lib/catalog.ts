/**
 * Слой данных каталога. Модель товара зафиксирована в Seedlings/docs/02-analysis.md.
 * Данные демонстрационные: реальный источник — выгрузка из Бизнес.ру (docs/08-integrations.md §2),
 * подключается заменой getProducts().
 */

export type Culture =
  | "strawberry"
  | "raspberry"
  | "currant"
  | "gooseberry"
  | "honeysuckle"
  | "vegetable"
  | "flower";

/** Срок созревания / плодоношения */
export type Ripening = "early" | "mid" | "late" | "everbearing";

/** Фасовка и корневая система */
export type Container = "cassette" | "p9" | "pot1l" | "okc";

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
    key: "strawberry",
    slug: "klubnika",
    name: "Клубника",
    genitive: "клубники",
    lead: "Садовая земляника с закрытой корневой: ранние, поздние и ремонтантные сорта — ягода с июня до заморозков.",
    seo: "Рассада клубники из собственного питомника: сорта с закрытой корневой системой, проверенные в средней полосе. Указана зимостойкость, срок созревания и урожайность каждого сорта, отгрузка в день сбора, гарантия приживаемости 14 дней.",
    fruitHex: "#d8392f",
    leafHex: "#3f8f4a",
  },
  {
    key: "raspberry",
    slug: "malina",
    name: "Малина",
    genitive: "малины",
    lead: "Крупноплодные и ремонтантные сорта, в том числе бесшипные — для сбора без перчаток.",
    seo: "Саженцы малины с закрытой корневой системой: ремонтантные сорта для осеннего урожая и классические летние. Для каждого сорта указаны зимостойкость, урожайность и наличие шипов.",
    fruitHex: "#c33a63",
    leafHex: "#3d7f43",
  },
  {
    key: "currant",
    slug: "smorodina",
    name: "Смородина",
    genitive: "смородины",
    lead: "Чёрная, красная и белая. Неприхотливая культура, которая прощает новичку почти всё.",
    seo: "Саженцы смородины чёрной, красной и белой из питомника. Двухлетние кусты с закрытой корневой системой, зимостойкость до −35 °C.",
    fruitHex: "#3b2b52",
    leafHex: "#4a8a3f",
  },
  {
    key: "gooseberry",
    slug: "kryzhovnik",
    name: "Крыжовник",
    genitive: "крыжовника",
    lead: "Бесшипные и слабошиповатые сорта с крупной сладкой ягодой.",
    seo: "Саженцы крыжовника, включая бесшипные сорта. Закрытая корневая система, зимостойкость до −30 °C, устойчивость к мучнистой росе.",
    fruitHex: "#7fa93c",
    leafHex: "#43873d",
  },
  {
    key: "honeysuckle",
    slug: "zhimolost",
    name: "Жимолость",
    genitive: "жимолости",
    lead: "Самая ранняя ягода в саду — созревает раньше клубники, в начале июня.",
    seo: "Саженцы съедобной жимолости: крупноплодные сорта сибирской селекции, зимостойкость до −40 °C. Для урожая нужны минимум два разных сорта — опылители подобраны в каталоге.",
    fruitHex: "#4a5fa8",
    leafHex: "#4f8c4a",
  },
  {
    key: "vegetable",
    slug: "ovoshchnaya-rassada",
    name: "Овощная рассада",
    genitive: "овощной рассады",
    lead: "Томаты, перец, огурец, капуста и баклажан в кассетах — крепкая рассада без вытягивания.",
    seo: "Овощная рассада из питомника: томаты, перцы, огурцы, капуста, баклажаны. Выращена в кассетах при досветке, закалённая, готова к высадке в грунт и теплицу.",
    fruitHex: "#d8442c",
    leafHex: "#3e8a45",
  },
  {
    key: "flower",
    slug: "tsvety",
    name: "Цветочная рассада",
    genitive: "цветочной рассады",
    lead: "Однолетники для клумб и балконных ящиков плюс многолетники, которые высаживают в конце лета.",
    seo: "Цветочная рассада: петуния, бархатцы, виола, лаванда, флоксы. Растения в кассетах и горшках P9, цветение в год посадки.",
    fruitHex: "#b45ba8",
    leafHex: "#4d8f4e",
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
};

export const CONTAINER_HINT: Record<Container, string> = {
  cassette: "Кассета с торфяным комом — высадка без пересадочного стресса",
  p9: "Горшок 9×9 см, закрытая корневая система",
  pot1l: "Горшок 1 л, растение второго года",
  okc: "Открытая корневая система, отгрузка только в посадочное окно",
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
  strawberry: [
    { name: "Полка", kind: "Садовая", ripening: "mid", hardiness: -22, yieldPerBush: "0,8–1,2 кг", fruitSize: "25–35 г", height: "25 см", price: 390, oldPrice: 460, packSize: 5, container: "cassette", short: "Эталон вкуса: плотная сладкая ягода, которая не течёт в корзине", hit: true },
    { name: "Альбион", kind: "Ремонтантная", ripening: "everbearing", hardiness: -20, yieldPerBush: "1,2–1,6 кг", fruitSize: "30–50 г", height: "30 см", price: 450, packSize: 5, container: "cassette", short: "Плодоносит волнами с июня до октября, ягода конической формы", hit: true },
    { name: "Зенга Зенгана", kind: "Садовая", ripening: "late", hardiness: -24, yieldPerBush: "0,7–1 кг", fruitSize: "20–30 г", height: "25 см", price: 340, packSize: 5, container: "cassette", short: "Классика для варенья и заморозки: ягода тёмная, ароматная" },
    { name: "Хоней", kind: "Садовая", ripening: "early", hardiness: -22, yieldPerBush: "0,8–1,1 кг", fruitSize: "30–40 г", height: "28 см", price: 400, packSize: 5, container: "cassette", short: "Самая ранняя в нашем питомнике — ягода в первой декаде июня" },
    { name: "Мальвина", kind: "Садовая", ripening: "late", hardiness: -23, yieldPerBush: "0,9–1,2 кг", fruitSize: "35–45 г", height: "30 см", price: 470, packSize: 5, container: "cassette", short: "Закрывает сезон в июле, когда у соседей клубника уже отошла", new: true },
    { name: "Клери", kind: "Садовая", ripening: "early", hardiness: -20, yieldPerBush: "0,7–0,9 кг", fruitSize: "25–40 г", height: "25 см", price: 420, packSize: 5, container: "cassette", short: "Глянцевая ягода с плотной мякотью, хорошо переносит перевозку" },
    { name: "Гигантелла Максим", kind: "Крупноплодная", ripening: "mid", hardiness: -21, yieldPerBush: "1–1,5 кг", fruitSize: "60–90 г", height: "40 см", price: 520, oldPrice: 590, packSize: 5, container: "p9", short: "Ягода размером с яблоко — то, ради чего клубнику показывают гостям" },
    { name: "Монтерей", kind: "Ремонтантная", ripening: "everbearing", hardiness: -20, yieldPerBush: "1,3–1,7 кг", fruitSize: "30–45 г", height: "32 см", price: 480, packSize: 5, container: "cassette", short: "Даёт четыре волны за сезон, вкус слаще Альбиона" },
    { name: "Азия", kind: "Крупноплодная", ripening: "mid", hardiness: -22, yieldPerBush: "1–1,3 кг", fruitSize: "40–60 г", height: "30 см", price: 460, packSize: 5, container: "cassette", short: "Итальянский сорт с земляничным ароматом и крепкой мякотью" },
    { name: "Эльсанта", kind: "Садовая", ripening: "mid", hardiness: -18, yieldPerBush: "0,9–1,2 кг", fruitSize: "30–45 г", height: "28 см", price: 410, packSize: 5, container: "cassette", short: "Промышленный стандарт: ровная ягода, дружная отдача урожая" },
    { name: "Сан Андреас", kind: "Ремонтантная", ripening: "everbearing", hardiness: -19, yieldPerBush: "1,1–1,5 кг", fruitSize: "35–50 г", height: "30 см", price: 490, packSize: 5, container: "p9", short: "Держит жару лучше других ремонтантных — не мельчает в июле", new: true },
    { name: "Лорд", kind: "Садовая", ripening: "late", hardiness: -25, yieldPerBush: "1–1,4 кг", fruitSize: "40–60 г", height: "35 см", price: 380, packSize: 5, container: "cassette", short: "Живёт на грядке до 8 лет без пересадки, прощает ошибки ухода" },
  ],
  raspberry: [
    { name: "Полка", kind: "Ремонтантная", ripening: "everbearing", hardiness: -25, yieldPerBush: "3–4 кг", fruitSize: "6–8 г", height: "1,6 м", price: 490, oldPrice: 560, packSize: 2, container: "p9", availability: "preorder", short: "Ремонтантный лидер: плодоносит с августа до морозов", hit: true },
    { name: "Геракл", kind: "Ремонтантная", ripening: "everbearing", hardiness: -30, yieldPerBush: "2,5–3,5 кг", fruitSize: "6–10 г", height: "1,8 м", price: 440, packSize: 2, container: "p9", availability: "preorder", short: "Мощный куст, не нуждается в шпалере, ягода кисло-сладкая" },
    { name: "Карамелька", kind: "Ремонтантная", ripening: "everbearing", hardiness: -28, yieldPerBush: "3–4,5 кг", fruitSize: "8–12 г", height: "1,5 м", price: 520, packSize: 2, container: "p9", availability: "preorder", short: "Самая сладкая в подборке — дети обрывают куст до сбора", hit: true },
    { name: "Гусар", kind: "Крупноплодная", ripening: "mid", hardiness: -32, yieldPerBush: "3–4 кг", fruitSize: "4–6 г", height: "2,2 м", price: 380, packSize: 2, container: "okc", availability: "preorder", short: "Почти без шипов и без капризов: сорт для тех, кто редко на даче" },
    { name: "Атлант", kind: "Ремонтантная", ripening: "everbearing", hardiness: -30, yieldPerBush: "2,5–3 кг", fruitSize: "7–9 г", height: "1,6 м", price: 470, packSize: 2, container: "p9", availability: "preorder", short: "Ягода снимается сухой — идеальна для заморозки" },
    { name: "Жёлтый гигант", kind: "Жёлтая", ripening: "mid", hardiness: -30, yieldPerBush: "3–5 кг", fruitSize: "6–8 г", height: "2 м", price: 510, packSize: 2, container: "p9", availability: "preorder", short: "Жёлтая малина без кислоты — не вызывает аллергии у детей", new: true },
    { name: "Таруса", kind: "Штамбовая", ripening: "mid", hardiness: -30, yieldPerBush: "2–4 кг", fruitSize: "8–12 г", height: "1,5 м", price: 540, packSize: 2, container: "p9", availability: "preorder", short: "Малиновое дерево: прочный ствол, подвязка не нужна" },
    { name: "Брянское диво", kind: "Ремонтантная", ripening: "everbearing", hardiness: -26, yieldPerBush: "3–4 кг", fruitSize: "10–15 г", height: "1,6 м", price: 560, packSize: 2, container: "p9", availability: "preorder", short: "Самая крупная ягода в каталоге, до 15 г" },
    { name: "Каскад Делайт", kind: "Крупноплодная", ripening: "late", hardiness: -28, yieldPerBush: "4–6 кг", fruitSize: "8–10 г", height: "2 м", price: 590, packSize: 2, container: "p9", availability: "preorder", short: "Рекордная урожайность при шпалерной подвязке" },
    { name: "Новость Кузьмина", kind: "Классическая", ripening: "early", hardiness: -35, yieldPerBush: "1,5–2 кг", fruitSize: "3–4 г", height: "2 м", price: 320, packSize: 2, container: "okc", availability: "preorder", short: "Старый русский сорт: вкус из детства и зимостойкость до −35" },
  ],
  currant: [
    { name: "Селеченская-2", kind: "Чёрная", ripening: "early", hardiness: -32, yieldPerBush: "3–4,5 кг", fruitSize: "3–5 г", height: "1,5 м", price: 450, packSize: 1, container: "pot1l", short: "Десертный вкус и сладость выше кислоты — едят прямо с куста", hit: true },
    { name: "Ядрёная", kind: "Чёрная", ripening: "late", hardiness: -35, yieldPerBush: "3–6 кг", fruitSize: "5–8 г", height: "1,7 м", price: 490, oldPrice: 560, packSize: 1, container: "pot1l", short: "Ягода размером с вишню — сибирская селекция" },
    { name: "Пигмей", kind: "Чёрная", ripening: "mid", hardiness: -33, yieldPerBush: "3–4 кг", fruitSize: "4–7 г", height: "1,5 м", price: 430, packSize: 1, container: "pot1l", short: "Сахара больше 9 %: варенье можно варить с половиной нормы сахара" },
    { name: "Джонкер ван Тетс", kind: "Красная", ripening: "early", hardiness: -30, yieldPerBush: "4–6 кг", fruitSize: "0,7–1 г", height: "1,8 м", price: 420, packSize: 1, container: "pot1l", short: "Длинные кисти по 10 см — собирать быстро и приятно" },
    { name: "Розетта", kind: "Красная", ripening: "late", hardiness: -30, yieldPerBush: "3–5 кг", fruitSize: "0,8–1,2 г", height: "1,6 м", price: 440, packSize: 1, container: "pot1l", short: "Висит на кусте до сентября, не осыпаясь" },
    { name: "Версальская белая", kind: "Белая", ripening: "mid", hardiness: -28, yieldPerBush: "3–4 кг", fruitSize: "0,8–1 г", height: "1,5 м", price: 460, packSize: 1, container: "pot1l", short: "Прозрачная ягода без красящего пигмента — не пачкает руки", new: true },
    { name: "Экзотика", kind: "Чёрная", ripening: "early", hardiness: -30, yieldPerBush: "2,5–3,5 кг", fruitSize: "4–6 г", height: "1,5 м", price: 470, packSize: 1, container: "pot1l", short: "Ранняя, крупная, с плотной кожицей — хорошо переносит перевозку" },
    { name: "Багира", kind: "Чёрная", ripening: "mid", hardiness: -34, yieldPerBush: "3,5–4,5 кг", fruitSize: "3–5 г", height: "1,4 м", price: 410, packSize: 1, container: "pot1l", short: "Компактный куст для маленького участка, урожай стабильный" },
  ],
  gooseberry: [
    { name: "Командор", kind: "Бесшипный", ripening: "mid", hardiness: -30, yieldPerBush: "5–7 кг", fruitSize: "4–7 г", height: "1,5 м", price: 520, packSize: 1, container: "pot1l", short: "Ни одного шипа и до 7 кг с куста — самый частый выбор", hit: true },
    { name: "Черносливовый", kind: "Слабошиповатый", ripening: "mid", hardiness: -32, yieldPerBush: "3–5 кг", fruitSize: "4–6 г", height: "1,5 м", price: 480, packSize: 1, container: "pot1l", short: "Тёмная ягода со вкусом сливы, отличное вино и компот" },
    { name: "Медовый", kind: "Шиповатый", ripening: "mid", hardiness: -30, yieldPerBush: "4–6 кг", fruitSize: "5–6 г", height: "1,6 м", price: 460, oldPrice: 520, packSize: 1, container: "pot1l", short: "Самый сладкий сорт, но с шипами — компромисс за вкус" },
    { name: "Уральский изумруд", kind: "Слабошиповатый", ripening: "early", hardiness: -35, yieldPerBush: "4–6 кг", fruitSize: "5–8 г", height: "1,4 м", price: 500, packSize: 1, container: "pot1l", short: "Зимостойкость до −35 °C, ягода зелёная и очень крупная" },
    { name: "Грушенька", kind: "Бесшипный", ripening: "late", hardiness: -33, yieldPerBush: "5–6 кг", fruitSize: "4–5 г", height: "1,3 м", price: 530, packSize: 1, container: "pot1l", short: "Не болеет мучнистой росой, куст компактный и аккуратный", new: true },
  ],
  honeysuckle: [
    { name: "Бакчарский великан", kind: "Крупноплодная", ripening: "early", hardiness: -40, yieldPerBush: "3–4 кг", fruitSize: "1,8–2,5 г", height: "1,9 м", price: 590, packSize: 1, container: "pot1l", short: "Ягода до 4 см длиной — первый урожай сезона, уже в начале июня", hit: true },
    { name: "Сильгинка", kind: "Десертная", ripening: "early", hardiness: -40, yieldPerBush: "2–3 кг", fruitSize: "1,4–1,8 г", height: "1,5 м", price: 540, packSize: 1, container: "pot1l", short: "Без горечи вообще — сорт для тех, кому жимолость раньше не нравилась" },
    { name: "Восторг", kind: "Крупноплодная", ripening: "mid", hardiness: -38, yieldPerBush: "3–3,5 кг", fruitSize: "1,6–2,2 г", height: "1,7 м", price: 560, oldPrice: 620, packSize: 1, container: "pot1l", short: "Ягода не осыпается — можно собирать раз в неделю" },
    { name: "Юголь", kind: "Опылитель", ripening: "mid", hardiness: -40, yieldPerBush: "2,5–3 кг", fruitSize: "1,3–1,7 г", height: "1,6 м", price: 490, packSize: 1, container: "pot1l", short: "Лучший опылитель для Бакчарского великана — берите вместе" },
    { name: "Дочь великана", kind: "Крупноплодная", ripening: "mid", hardiness: -40, yieldPerBush: "2,5–3,5 кг", fruitSize: "2–2,5 г", height: "1,8 м", price: 610, packSize: 1, container: "pot1l", short: "Самая крупная ягода среди жимолости, вкус сладкий с кислинкой", new: true },
  ],
  vegetable: [
    { name: "Бычье сердце", kind: "Томат", ripening: "late", hardiness: 0, yieldPerBush: "4–6 кг", fruitSize: "300–500 г", height: "1,8 м", price: 290, packSize: 6, container: "cassette", availability: "out_of_season", short: "Мясистый салатный томат, классика для теплицы", hit: true },
    { name: "Черри Ира", kind: "Томат", ripening: "early", hardiness: 0, yieldPerBush: "3–4 кг", fruitSize: "20–25 г", height: "1,6 м", price: 270, packSize: 6, container: "cassette", availability: "out_of_season", short: "Гроздья по 40 ягод, дети едят прямо с куста" },
    { name: "Санька", kind: "Томат", ripening: "early", hardiness: 0, yieldPerBush: "3–4 кг", fruitSize: "80–100 г", height: "60 см", price: 250, packSize: 6, container: "cassette", availability: "out_of_season", short: "Ультраранний детерминантный сорт для открытого грунта" },
    { name: "Ратунда", kind: "Перец", ripening: "mid", hardiness: 0, yieldPerBush: "2–3 кг", fruitSize: "100–150 г", height: "70 см", price: 280, packSize: 6, container: "cassette", availability: "out_of_season", short: "Толстостенный сладкий перец для фаршировки и заморозки" },
    { name: "Джемини F1", kind: "Перец", ripening: "mid", hardiness: 0, yieldPerBush: "3–4 кг", fruitSize: "180–220 г", height: "90 см", price: 320, packSize: 6, container: "cassette", availability: "out_of_season", short: "Гибрид с жёлтым плодом и стенкой 8 мм" },
    { name: "Кураж F1", kind: "Огурец", ripening: "early", hardiness: 0, yieldPerBush: "5–7 кг", fruitSize: "12–14 см", height: "2 м", price: 260, packSize: 6, container: "cassette", availability: "out_of_season", short: "Партенокарпик: завязи без опыления, урожай в теплице до октября" },
    { name: "Слава", kind: "Капуста", ripening: "mid", hardiness: 0, yieldPerBush: "3–5 кг", fruitSize: "3–4 кг кочан", height: "50 см", price: 230, packSize: 10, container: "cassette", availability: "out_of_season", short: "Проверенный сорт для квашения, кочан плотный и сочный" },
    { name: "Алмаз", kind: "Баклажан", ripening: "mid", hardiness: 0, yieldPerBush: "2–3 кг", fruitSize: "150–200 г", height: "60 см", price: 300, packSize: 6, container: "cassette", availability: "out_of_season", short: "Без горечи, плодоносит даже в прохладное лето" },
  ],
  flower: [
    { name: "Петуния Софистика", kind: "Однолетник", ripening: "everbearing", hardiness: 0, yieldPerBush: "—", fruitSize: "цветок 8–10 см", height: "35 см", price: 220, packSize: 6, container: "cassette", availability: "out_of_season", short: "Крупноцветковая петуния для балконных ящиков, цветёт до заморозков" },
    { name: "Бархатцы Кармен", kind: "Однолетник", ripening: "early", hardiness: 0, yieldPerBush: "—", fruitSize: "цветок 6 см", height: "30 см", price: 180, packSize: 10, container: "cassette", availability: "out_of_season", short: "Отпугивают нематоду на грядке — сажают между томатами" },
    { name: "Виола Свисс Джайнтс", kind: "Двулетник", ripening: "early", hardiness: -25, yieldPerBush: "—", fruitSize: "цветок 7 см", height: "20 см", price: 200, packSize: 6, container: "cassette", short: "Высаживают в августе — зацветёт уже в апреле следующего года", hit: true },
    { name: "Лаванда узколистная", kind: "Многолетник", ripening: "mid", hardiness: -25, yieldPerBush: "—", fruitSize: "соцветие 8 см", height: "50 см", price: 390, oldPrice: 450, packSize: 1, container: "p9", short: "Зимует в средней полосе под укрытием, аромат весь июль" },
    { name: "Флокс метельчатый Европа", kind: "Многолетник", ripening: "mid", hardiness: -30, yieldPerBush: "—", fruitSize: "соцветие 20 см", height: "80 см", price: 420, packSize: 1, container: "p9", short: "Белые соцветия с малиновым глазком, аромат вечером усиливается" },
    { name: "Хоста Голубой ангел", kind: "Многолетник", ripening: "mid", hardiness: -35, yieldPerBush: "—", fruitSize: "лист 30 см", height: "70 см", price: 450, packSize: 1, container: "p9", short: "Для тени, где больше ничего не растёт — куст живёт 20 лет", new: true },
  ],
};

/* ---------- Тексты, собираемые из данных ---------- */

const CARE: Record<Culture, string[]> = {
  strawberry: [
    "Высаживайте вечером или в пасмурный день, сердечко куста — строго на уровне почвы.",
    "Первые 10 дней поливайте через день, дальше — раз в неделю, но обильно.",
    "Замульчируйте соломой или агроволокном: ягода останется чистой, а земля влажной.",
    "На четвёртый год пересадите на новое место — старая грядка теряет урожай.",
  ],
  raspberry: [
    "Готовьте траншею 40×40 см, на дно — ведро перегноя и горсть золы.",
    "Между кустами 70 см, между рядами 1,5 м — загущенная малина болеет.",
    "Ремонтантные сорта осенью срезайте под ноль: весь урожай будет на побегах этого года.",
    "Мульча из скошенной травы слоем 10 см заменяет половину поливов.",
  ],
  currant: [
    "Сажайте наклонно, под углом 45°, заглубляя корневую шейку на 5–7 см — куст даст новые побеги.",
    "После посадки обрежьте побеги, оставив 3–4 почки: год потеряете, куст выиграете.",
    "Смородина любит воду: в июне и июле по 2 ведра на куст в неделю.",
    "Каждую осень вырезайте ветви старше 4 лет — они уже не плодоносят.",
  ],
  gooseberry: [
    "Место — солнечное и проветриваемое, в тени крыжовник берёт мучнистую росу.",
    "Заглубление 5 см, после посадки полив 10 л и мульча.",
    "Первую обрезку делайте на второй год, формируя 10–12 разновозрастных ветвей.",
    "Весной до распускания почек пролейте куст горячей водой (+70 °C) от вредителей.",
  ],
  honeysuckle: [
    "Сажайте минимум два разных сорта: жимолость самобесплодна, без опылителя урожая не будет.",
    "Корневую шейку не заглубляйте, приствольный круг замульчируйте.",
    "Первые три года куст растёт медленно — это норма, урожай выходит на полную с 4-го года.",
    "Обрезка только санитарная: жимолость не любит сильного вмешательства.",
  ],
  vegetable: [
    "Перед высадкой закалите рассаду: 3–4 дня выносите на воздух, увеличивая время.",
    "Высаживайте в прогретую до +15 °C почву, лунку пролейте тёплой водой.",
    "Первую неделю притеняйте от прямого солнца — растение переживает пересадку.",
    "Подвязку ставьте сразу при посадке, чтобы позже не повредить корни.",
  ],
  flower: [
    "Не заглубляйте корневую шейку — цветочная рассада этого не прощает.",
    "Первый полив — сразу после посадки, дальше по подсыханию верхнего слоя.",
    "Прищипните верхушку однолетников после приживания: куст станет пышнее.",
    "Отцветшие соцветия убирайте — растение переключится на новые бутоны.",
  ],
};

const REVIEW_POOL: { author: string; region: string; text: string; rating: number }[] = [
  { author: "Ольга М.", region: "Тульская обл.", rating: 5, text: "Пришло 5 кустиков, все живые, ком земли влажный. Высадила в тот же вечер, через неделю пошли новые листья. Ничего не пропало.", },
  { author: "Сергей П.", region: "Подмосковье", rating: 5, text: "Брал уже второй раз. Пересорта нет, сорт именно тот, что заказывал. В прошлом году урожай был ровно как в описании.", },
  { author: "Наталья В.", region: "Рязань", rating: 4, text: "Растения хорошие, упаковка отличная. Снимаю звезду за то, что отгрузку сдвинули на три дня, но предупредили заранее.", },
  { author: "Ирина К.", region: "Калуга", rating: 5, text: "Забирала самовывозом, показали грядки, агроном подсказал, что с чем сажать. Взяла больше, чем планировала :)", },
  { author: "Андрей С.", region: "Владимир", rating: 5, text: "Зимовку перенесли все кусты без укрытия, у нас было −27. Весной проснулись дружно.", },
  { author: "Марина Д.", region: "Тверь", rating: 4, text: "Один саженец подсох в дороге, написала в поддержку с фото — заменили в следующей отправке без вопросов.", },
  { author: "Елена Ф.", region: "Смоленск", rating: 5, text: "Первый раз заказывала растения по интернету и боялась. Зря боялась: коробка как из питомника, корни в коме, всё прижилось.", },
  { author: "Виктор Н.", region: "Брянск", rating: 5, text: "Ягода крупная, как на фото, не обманули. Соседи просят отводки.", },
  { author: "Татьяна Ж.", region: "Ярославль", rating: 4, text: "Хорошая рассада, крепкая, не вытянутая. Хотелось бы побольше вариантов фасовки — беру сразу помногу.", },
  { author: "Дмитрий Л.", region: "Иваново", rating: 5, text: "Заказ собрали за день, накладная пришла на почту сразу. По документам всё чисто.", },
];

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
  strawberry: [4, 9],
  raspberry: [4, 10],
  currant: [4, 10],
  gooseberry: [4, 10],
  honeysuckle: [4, 10],
  vegetable: [3, 6],
  flower: [4, 8],
};

const WEIGHT: Record<Container, number> = {
  cassette: 0.9,
  p9: 1.4,
  pot1l: 2.2,
  okc: 0.7,
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
  // Подтип авторский и уже согласован с названием культуры: «клубника — садовая»,
  // «крыжовник — бесшипный», «овощная рассада — томат». Собирать через родительный падеж нельзя.
  // Если подтип уже назвал срок («ремонтантная»), второй раз про него не пишем.
  const kind = raw.kind.toLowerCase();
  const duplicate = kind.startsWith(RIPENING_LABEL[raw.ripening].toLowerCase().slice(0, 7));
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
  const reviewCount = 3 + (h % 47);
  const picked = [0, 1, 2].map((i) => REVIEW_POOL[(h + i * 7) % REVIEW_POOL.length]);
  const reviews: Review[] = picked.map((r, i) => ({
    ...r,
    date: `2026-0${5 + i}-${String(4 + ((h + i * 5) % 24)).padStart(2, "0")}`,
  }));
  const rating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

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
    sun: culture === "flower" && raw.name.includes("Хоста") ? "Тень и полутень" : "Солнце, лёгкая полутень",
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

/** Ключевая характеристика строкой — для карточки в сетке */
export function keyTrait(p: Product): string {
  const parts = [p.kind];
  const ripening = RIPENING_LABEL[p.ripening].toLowerCase();
  // «Ремонтантная · ремонтантный» — тип и срок совпадают, второе слово лишнее
  if (!p.kind.toLowerCase().startsWith(ripening.slice(0, 7))) parts.push(ripening);
  if (p.hardiness < 0) parts.push(`до ${p.hardiness} °C`);
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
