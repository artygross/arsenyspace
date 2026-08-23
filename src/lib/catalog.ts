/**
 * Слой данных каталога. Модель товара зафиксирована в Test/docs/02-analysis.md.
 * Данные мок-овые: реальный источник подключается заменой getProducts().
 */

export type FrameShape =
  | "aviator"
  | "wayfarer"
  | "cat-eye"
  | "round"
  | "rectangle"
  | "oval"
  | "sport"
  | "oversize";

export type FaceShape = "oval" | "round" | "square" | "heart" | "oblong";
export type LensType = "polarized" | "mirrored" | "gradient" | "photochromic";
export type Material = "acetate" | "metal" | "titanium" | "combined";
export type Gender = "women" | "men" | "unisex";
export type FrameSize = "S" | "M" | "L";

export type Variant = {
  id: string;
  frame: string;
  frameHex: string;
  lens: string;
  lensHex: string;
};

export type Review = {
  author: string;
  rating: number;
  date: string;
  text: string;
  faceShape?: FaceShape;
};

export type Product = {
  slug: string;
  brand: string;
  model: string;
  collection: string;
  shape: FrameShape;
  material: Material;
  gender: Gender;
  lensTypes: LensType[];
  lensCategory: 0 | 1 | 2 | 3 | 4;
  dimensions: { lens: number; bridge: number; temple: number };
  size: FrameSize;
  faceShapes: FaceShape[];
  price: number;
  oldPrice?: number;
  inStock: boolean;
  stockLeft: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestseller: boolean;
  variants: Variant[];
  description: string;
  reviews: Review[];
};

/* ---------- Словари (русские подписи) ---------- */

export const SHAPE_LABEL: Record<FrameShape, string> = {
  aviator: "Авиаторы",
  wayfarer: "Вайфареры",
  "cat-eye": "Кошачий глаз",
  round: "Круглые",
  rectangle: "Прямоугольные",
  oval: "Овальные",
  sport: "Спортивные",
  oversize: "Oversize",
};

export const FACE_LABEL: Record<FaceShape, string> = {
  oval: "Овальное",
  round: "Круглое",
  square: "Квадратное",
  heart: "Сердцевидное",
  oblong: "Вытянутое",
};

export const LENS_LABEL: Record<LensType, string> = {
  polarized: "Поляризация",
  mirrored: "Зеркальные",
  gradient: "Градиент",
  photochromic: "Фотохром",
};

export const MATERIAL_LABEL: Record<Material, string> = {
  acetate: "Ацетат",
  metal: "Металл",
  titanium: "Титан",
  combined: "Комбинированный",
};

export const GENDER_LABEL: Record<Gender, string> = {
  women: "Женские",
  men: "Мужские",
  unisex: "Унисекс",
};

export const SIZE_LABEL: Record<FrameSize, string> = {
  S: "S — узкая",
  M: "M — средняя",
  L: "L — широкая",
};

/* ---------- Палитры вариаций ---------- */

const FRAME = {
  black: ["Чёрный", "#16161a"],
  havana: ["Гавана", "#6b4423"],
  gold: ["Золото", "#c9a227"],
  silver: ["Серебро", "#b0b5bb"],
  crystal: ["Прозрачный", "#d6d2cb"],
  tortoise: ["Тёмная черепаха", "#4a2c17"],
  khaki: ["Хаки", "#5b5f4a"],
  burgundy: ["Бордо", "#5c1f2b"],
  rose: ["Розовое золото", "#c4917c"],
  cream: ["Кремовый", "#e2d8c6"],
} as const;

const LENSC = {
  g15: ["Зелёный G-15", "#2f4034"],
  grey: ["Серый", "#4c4c4c"],
  brown: ["Коричневый", "#4a3524"],
  blueMirror: ["Синее зеркало", "#2f5488"],
  smoke: ["Дымчатый градиент", "#77757a"],
  roseGrad: ["Розовый градиент", "#c08a91"],
  amber: ["Янтарный", "#93601f"],
  silverMirror: ["Серебряное зеркало", "#93a0aa"],
} as const;

type FrameKey = keyof typeof FRAME;
type LensKey = keyof typeof LENSC;

function v(id: string, f: FrameKey, l: LensKey): Variant {
  return {
    id,
    frame: FRAME[f][0],
    frameHex: FRAME[f][1],
    lens: LENSC[l][0],
    lensHex: LENSC[l][1],
  };
}

/* ---------- Каталог ---------- */

type Seed = Omit<Product, "slug" | "reviews"> & { slug: string; reviews?: Review[] };

const REVIEW_POOL: Review[] = [
  {
    author: "Марина К.",
    rating: 5,
    date: "2026-07-14",
    text: "Сидят идеально, не сползают. Заказывала размер M по подсказке на странице — совпало.",
    faceShape: "oval",
  },
  {
    author: "Дмитрий В.",
    rating: 4,
    date: "2026-06-30",
    text: "Оправа отличная, линза чуть темнее, чем на фото. За качество сборки — пять.",
    faceShape: "square",
  },
  {
    author: "Алина П.",
    rating: 5,
    date: "2026-06-02",
    text: "Пришли в фирменном футляре, есть сертификат. Именно то, что искала на лето.",
    faceShape: "heart",
  },
  {
    author: "Сергей Н.",
    rating: 4,
    date: "2026-05-19",
    text: "Поляризация работает как надо — за рулём разница заметная.",
    faceShape: "round",
  },
];

function make(s: Seed): Product {
  return { ...s, reviews: s.reviews ?? REVIEW_POOL.slice(0, 3) };
}

export const PRODUCTS: Product[] = [
  make({
    slug: "meridian-cassini-01",
    brand: "Meridian",
    model: "Cassini",
    collection: "Horizon SS26",
    shape: "aviator",
    material: "titanium",
    gender: "unisex",
    lensTypes: ["polarized", "gradient"],
    lensCategory: 3,
    dimensions: { lens: 58, bridge: 14, temple: 140 },
    size: "L",
    faceShapes: ["square", "heart", "oval"],
    price: 34900,
    oldPrice: 41900,
    inStock: true,
    stockLeft: 6,
    rating: 4.8,
    reviewCount: 124,
    isNew: false,
    isBestseller: true,
    variants: [v("gold-brown", "gold", "brown"), v("silver-g15", "silver", "g15"), v("black-grey", "black", "grey")],
    description:
      "Классический авиатор в титане: 22 грамма, двойная переносица, поляризационная линза с градиентом. Форма, которая не выходит из моды с 1937 года.",
  }),
  make({
    slug: "nocturne-verso-set",
    brand: "Nocturne",
    model: "Verso",
    collection: "Noir",
    shape: "wayfarer",
    material: "acetate",
    gender: "unisex",
    lensTypes: ["polarized"],
    lensCategory: 3,
    dimensions: { lens: 52, bridge: 18, temple: 145 },
    size: "M",
    faceShapes: ["oval", "round", "oblong"],
    price: 24900,
    inStock: true,
    stockLeft: 14,
    rating: 4.7,
    reviewCount: 89,
    isNew: false,
    isBestseller: true,
    variants: [v("black-grey", "black", "grey"), v("havana-g15", "havana", "g15"), v("crystal-smoke", "crystal", "smoke")],
    description:
      "Плотный итальянский ацетат, ручная полировка 48 часов. Универсальная форма, которая работает и с деловым костюмом, и с футболкой.",
  }),
  make({
    slug: "atelier-voss-lumine",
    brand: "Atelier Voss",
    model: "Lumine",
    collection: "Atelier",
    shape: "cat-eye",
    material: "acetate",
    gender: "women",
    lensTypes: ["gradient"],
    lensCategory: 2,
    dimensions: { lens: 54, bridge: 16, temple: 140 },
    size: "M",
    faceShapes: ["round", "square", "oval"],
    price: 41900,
    inStock: true,
    stockLeft: 3,
    rating: 4.9,
    reviewCount: 46,
    isNew: true,
    isBestseller: false,
    variants: [v("tortoise-roseGrad", "tortoise", "roseGrad"), v("black-smoke", "black", "smoke"), v("cream-amber", "cream", "amber")],
    description:
      "Скульптурный кошачий глаз с приподнятым внешним углом. Розовый градиент осветляет линию скул — форма, придуманная для круглого и квадратного лица.",
  }),
  make({
    slug: "lume-orbita",
    brand: "Lume",
    model: "Orbita",
    collection: "Round",
    shape: "round",
    material: "metal",
    gender: "unisex",
    lensTypes: ["mirrored", "gradient"],
    lensCategory: 3,
    dimensions: { lens: 47, bridge: 21, temple: 145 },
    size: "S",
    faceShapes: ["square", "oblong", "heart"],
    price: 18900,
    oldPrice: 23900,
    inStock: true,
    stockLeft: 21,
    rating: 4.5,
    reviewCount: 212,
    isNew: false,
    isBestseller: true,
    variants: [v("gold-amber", "gold", "amber"), v("silver-silverMirror", "silver", "silverMirror"), v("black-grey", "black", "grey")],
    description:
      "Тонкая круглая оправа из нержавеющей стали, вес 18 грамм. Смягчает угловатые черты — лучший выбор для квадратного лица.",
  }),
  make({
    slug: "castelli-riva",
    brand: "Castelli",
    model: "Riva",
    collection: "Costa",
    shape: "oversize",
    material: "acetate",
    gender: "women",
    lensTypes: ["gradient", "polarized"],
    lensCategory: 3,
    dimensions: { lens: 60, bridge: 15, temple: 140 },
    size: "L",
    faceShapes: ["oval", "heart", "oblong"],
    price: 52900,
    inStock: true,
    stockLeft: 2,
    rating: 4.8,
    reviewCount: 31,
    isNew: true,
    isBestseller: false,
    variants: [v("havana-smoke", "havana", "smoke"), v("black-grey", "black", "grey"), v("burgundy-roseGrad", "burgundy", "roseGrad")],
    description:
      "Крупная оправа с максимальным покрытием и поляризацией. Сделана для яркого солнца и для тех, кто не любит компромиссов в защите.",
  }),
  make({
    slug: "orville-pacer",
    brand: "Orville",
    model: "Pacer",
    collection: "Motion",
    shape: "sport",
    material: "combined",
    gender: "men",
    lensTypes: ["polarized", "mirrored"],
    lensCategory: 4,
    dimensions: { lens: 62, bridge: 12, temple: 130 },
    size: "L",
    faceShapes: ["oval", "square", "oblong"],
    price: 22900,
    inStock: true,
    stockLeft: 18,
    rating: 4.6,
    reviewCount: 167,
    isNew: false,
    isBestseller: false,
    variants: [v("black-blueMirror", "black", "blueMirror"), v("khaki-g15", "khaki", "g15")],
    description:
      "Обтекающая форма с резиновыми упорами на переносице и заушниках. Категория 4 — для высокогорья и открытой воды.",
  }),
  make({
    slug: "vanta-linea",
    brand: "Vanta",
    model: "Linea",
    collection: "Minimal",
    shape: "rectangle",
    material: "titanium",
    gender: "men",
    lensTypes: ["polarized"],
    lensCategory: 3,
    dimensions: { lens: 55, bridge: 17, temple: 145 },
    size: "M",
    faceShapes: ["round", "oval", "heart"],
    price: 38900,
    inStock: true,
    stockLeft: 9,
    rating: 4.7,
    reviewCount: 54,
    isNew: true,
    isBestseller: false,
    variants: [v("silver-grey", "silver", "grey"), v("black-g15", "black", "g15"), v("gold-brown", "gold", "brown")],
    description:
      "Узкая прямоугольная оправа из японского титана. Чёткая горизонталь, которая уравновешивает круглое лицо.",
  }),
  make({
    slug: "solara-duna",
    brand: "Solara",
    model: "Duna",
    collection: "Desert",
    shape: "oval",
    material: "metal",
    gender: "women",
    lensTypes: ["gradient"],
    lensCategory: 2,
    dimensions: { lens: 51, bridge: 19, temple: 140 },
    size: "S",
    faceShapes: ["square", "oblong"],
    price: 16900,
    oldPrice: 21900,
    inStock: true,
    stockLeft: 27,
    rating: 4.4,
    reviewCount: 143,
    isNew: false,
    isBestseller: false,
    variants: [v("rose-roseGrad", "rose", "roseGrad"), v("gold-amber", "gold", "amber")],
    description:
      "Мягкий овал с тёплым градиентом. Лёгкая оправа для узкого лица — 16 грамм, почти не ощущается.",
  }),
  make({
    slug: "meridian-strato",
    brand: "Meridian",
    model: "Strato",
    collection: "Horizon SS26",
    shape: "aviator",
    material: "metal",
    gender: "men",
    lensTypes: ["mirrored", "polarized"],
    lensCategory: 3,
    dimensions: { lens: 61, bridge: 13, temple: 140 },
    size: "L",
    faceShapes: ["square", "heart"],
    price: 27900,
    inStock: true,
    stockLeft: 11,
    rating: 4.6,
    reviewCount: 78,
    isNew: true,
    isBestseller: false,
    variants: [v("gold-blueMirror", "gold", "blueMirror"), v("black-silverMirror", "black", "silverMirror")],
    description:
      "Увеличенный авиатор с зеркальным напылением. Плоская линза и тонкий кант — версия классики для широкого лица.",
  }),
  make({
    slug: "nocturne-echo",
    brand: "Nocturne",
    model: "Echo",
    collection: "Noir",
    shape: "wayfarer",
    material: "acetate",
    gender: "women",
    lensTypes: ["gradient"],
    lensCategory: 2,
    dimensions: { lens: 50, bridge: 20, temple: 140 },
    size: "S",
    faceShapes: ["oval", "oblong", "heart"],
    price: 19900,
    inStock: false,
    stockLeft: 0,
    rating: 4.5,
    reviewCount: 96,
    isNew: false,
    isBestseller: false,
    variants: [v("crystal-smoke", "crystal", "smoke"), v("burgundy-roseGrad", "burgundy", "roseGrad")],
    description:
      "Компактный вайфарер на узкое лицо. Прозрачный ацетат и дымчатый градиент — вариант, который не спорит с макияжем.",
  }),
  make({
    slug: "atelier-voss-cortile",
    brand: "Atelier Voss",
    model: "Cortile",
    collection: "Atelier",
    shape: "oversize",
    material: "acetate",
    gender: "women",
    lensTypes: ["gradient", "polarized"],
    lensCategory: 3,
    dimensions: { lens: 59, bridge: 16, temple: 145 },
    size: "L",
    faceShapes: ["heart", "oval"],
    price: 47900,
    oldPrice: 56900,
    inStock: true,
    stockLeft: 4,
    rating: 4.9,
    reviewCount: 27,
    isNew: false,
    isBestseller: true,
    variants: [v("tortoise-brown", "tortoise", "brown"), v("black-smoke", "black", "smoke")],
    description:
      "Архитектурная oversize-оправа ручной сборки. Толстый профиль ацетата держит форму и создаёт узнаваемый силуэт.",
  }),
  make({
    slug: "lume-arco",
    brand: "Lume",
    model: "Arco",
    collection: "Round",
    shape: "round",
    material: "acetate",
    gender: "unisex",
    lensTypes: ["photochromic"],
    lensCategory: 2,
    dimensions: { lens: 49, bridge: 22, temple: 145 },
    size: "M",
    faceShapes: ["square", "oblong"],
    price: 29900,
    inStock: true,
    stockLeft: 7,
    rating: 4.7,
    reviewCount: 63,
    isNew: true,
    isBestseller: false,
    variants: [v("havana-brown", "havana", "brown"), v("khaki-g15", "khaki", "g15"), v("cream-amber", "cream", "amber")],
    description:
      "Круглая оправа с фотохромной линзой: темнеет на солнце, светлеет в помещении. Одни очки на весь день.",
  }),
  make({
    slug: "castelli-molo",
    brand: "Castelli",
    model: "Molo",
    collection: "Costa",
    shape: "rectangle",
    material: "acetate",
    gender: "unisex",
    lensTypes: ["polarized"],
    lensCategory: 3,
    dimensions: { lens: 56, bridge: 16, temple: 145 },
    size: "M",
    faceShapes: ["round", "oval"],
    price: 21900,
    inStock: true,
    stockLeft: 16,
    rating: 4.3,
    reviewCount: 108,
    isNew: false,
    isBestseller: false,
    variants: [v("black-g15", "black", "g15"), v("havana-brown", "havana", "brown"), v("khaki-grey", "khaki", "grey")],
    description:
      "Прямые линии, плотная посадка, поляризация. Рабочая лошадка для города и воды одновременно.",
  }),
  make({
    slug: "vanta-punto",
    brand: "Vanta",
    model: "Punto",
    collection: "Minimal",
    shape: "oval",
    material: "titanium",
    gender: "unisex",
    lensTypes: ["mirrored"],
    lensCategory: 3,
    dimensions: { lens: 48, bridge: 20, temple: 140 },
    size: "S",
    faceShapes: ["square", "oblong", "round"],
    price: 33900,
    inStock: true,
    stockLeft: 5,
    rating: 4.6,
    reviewCount: 39,
    isNew: true,
    isBestseller: false,
    variants: [v("silver-silverMirror", "silver", "silverMirror"), v("gold-amber", "gold", "amber")],
    description:
      "Микро-овал на титановой основе. Точная геометрия и вес 15 грамм — самая лёгкая модель в каталоге.",
  }),
  make({
    slug: "orville-crest",
    brand: "Orville",
    model: "Crest",
    collection: "Motion",
    shape: "sport",
    material: "combined",
    gender: "unisex",
    lensTypes: ["photochromic", "polarized"],
    lensCategory: 3,
    dimensions: { lens: 60, bridge: 14, temple: 135 },
    size: "L",
    faceShapes: ["oval", "square"],
    price: 26900,
    oldPrice: 31900,
    inStock: true,
    stockLeft: 12,
    rating: 4.5,
    reviewCount: 84,
    isNew: false,
    isBestseller: false,
    variants: [v("khaki-g15", "khaki", "g15"), v("black-grey", "black", "grey")],
    description:
      "Спортивная посадка с фотохромом — для бега и вело, где освещение меняется каждые пять минут.",
  }),
  make({
    slug: "solara-mira",
    brand: "Solara",
    model: "Mira",
    collection: "Desert",
    shape: "cat-eye",
    material: "metal",
    gender: "women",
    lensTypes: ["gradient", "mirrored"],
    lensCategory: 2,
    dimensions: { lens: 53, bridge: 17, temple: 140 },
    size: "M",
    faceShapes: ["round", "oval", "square"],
    price: 17900,
    inStock: true,
    stockLeft: 23,
    rating: 4.4,
    reviewCount: 156,
    isNew: false,
    isBestseller: true,
    variants: [v("gold-roseGrad", "gold", "roseGrad"), v("rose-smoke", "rose", "smoke"), v("black-grey", "black", "grey")],
    description:
      "Металлический кошачий глаз с тонким контуром. Форма читается, но не доминирует — вариант на каждый день.",
  }),
  make({
    slug: "meridian-tramonto",
    brand: "Meridian",
    model: "Tramonto",
    collection: "Horizon SS26",
    shape: "oversize",
    material: "combined",
    gender: "unisex",
    lensTypes: ["gradient"],
    lensCategory: 3,
    dimensions: { lens: 58, bridge: 15, temple: 145 },
    size: "L",
    faceShapes: ["heart", "oval", "oblong"],
    price: 30900,
    inStock: true,
    stockLeft: 8,
    rating: 4.6,
    reviewCount: 41,
    isNew: true,
    isBestseller: false,
    variants: [v("havana-amber", "havana", "amber"), v("black-smoke", "black", "smoke")],
    description:
      "Ацетат на металлическом каркасе: объём oversize при весе обычной оправы. Тёплый янтарный градиент.",
  }),
  make({
    slug: "nocturne-quadra",
    brand: "Nocturne",
    model: "Quadra",
    collection: "Noir",
    shape: "rectangle",
    material: "metal",
    gender: "men",
    lensTypes: ["mirrored", "polarized"],
    lensCategory: 3,
    dimensions: { lens: 57, bridge: 15, temple: 145 },
    size: "L",
    faceShapes: ["round", "oval"],
    price: 23900,
    inStock: true,
    stockLeft: 13,
    rating: 4.5,
    reviewCount: 72,
    isNew: false,
    isBestseller: false,
    variants: [v("black-blueMirror", "black", "blueMirror"), v("silver-grey", "silver", "grey")],
    description:
      "Строгая прямоугольная геометрия в матовом металле. Синее зеркало добавляет графичности без лишней яркости.",
  }),
  make({
    slug: "lume-piano",
    brand: "Lume",
    model: "Piano",
    collection: "Round",
    shape: "wayfarer",
    material: "acetate",
    gender: "unisex",
    lensTypes: ["polarized", "gradient"],
    lensCategory: 3,
    dimensions: { lens: 53, bridge: 18, temple: 145 },
    size: "M",
    faceShapes: ["oval", "round", "heart"],
    price: 15900,
    oldPrice: 19900,
    inStock: true,
    stockLeft: 31,
    rating: 4.3,
    reviewCount: 234,
    isNew: false,
    isBestseller: true,
    variants: [v("black-grey", "black", "grey"), v("crystal-smoke", "crystal", "smoke"), v("burgundy-brown", "burgundy", "brown")],
    description:
      "Входная модель линейки: та же геометрия и поляризация, что у старших, в более доступном ацетате.",
  }),
  make({
    slug: "atelier-voss-sera",
    brand: "Atelier Voss",
    model: "Sera",
    collection: "Atelier",
    shape: "aviator",
    material: "titanium",
    gender: "women",
    lensTypes: ["gradient", "polarized"],
    lensCategory: 2,
    dimensions: { lens: 55, bridge: 14, temple: 140 },
    size: "M",
    faceShapes: ["square", "heart", "oval"],
    price: 44900,
    inStock: true,
    stockLeft: 3,
    rating: 4.8,
    reviewCount: 22,
    isNew: true,
    isBestseller: false,
    variants: [v("rose-roseGrad", "rose", "roseGrad"), v("gold-brown", "gold", "brown")],
    description:
      "Женская интерпретация авиатора: уменьшенная линза, розовое золото, мягкий градиент. Титан ручной пайки.",
  }),
  make({
    slug: "castelli-faro",
    brand: "Castelli",
    model: "Faro",
    collection: "Costa",
    shape: "round",
    material: "combined",
    gender: "men",
    lensTypes: ["polarized"],
    lensCategory: 3,
    dimensions: { lens: 50, bridge: 21, temple: 145 },
    size: "M",
    faceShapes: ["square", "oblong"],
    price: 20900,
    inStock: true,
    stockLeft: 15,
    rating: 4.4,
    reviewCount: 67,
    isNew: false,
    isBestseller: false,
    variants: [v("tortoise-g15", "tortoise", "g15"), v("black-brown", "black", "brown")],
    description:
      "Круглая форма с усиленными петлями и ацетатными накладками на металле. Ощутимо прочнее, чем выглядит.",
  }),
  make({
    slug: "solara-vela",
    brand: "Solara",
    model: "Vela",
    collection: "Desert",
    shape: "sport",
    material: "combined",
    gender: "women",
    lensTypes: ["mirrored"],
    lensCategory: 3,
    dimensions: { lens: 58, bridge: 13, temple: 135 },
    size: "M",
    faceShapes: ["oval", "heart"],
    price: 14900,
    oldPrice: 18900,
    inStock: true,
    stockLeft: 19,
    rating: 4.2,
    reviewCount: 121,
    isNew: false,
    isBestseller: false,
    variants: [v("rose-silverMirror", "rose", "silverMirror"), v("black-blueMirror", "black", "blueMirror")],
    description:
      "Лёгкая спортивная модель с зеркальным покрытием. Держится на бегу и не оставляет следов на переносице.",
  }),
  make({
    slug: "vanta-riga",
    brand: "Vanta",
    model: "Riga",
    collection: "Minimal",
    shape: "cat-eye",
    material: "titanium",
    gender: "women",
    lensTypes: ["gradient"],
    lensCategory: 2,
    dimensions: { lens: 52, bridge: 18, temple: 140 },
    size: "M",
    faceShapes: ["round", "square"],
    price: 36900,
    inStock: true,
    stockLeft: 6,
    rating: 4.7,
    reviewCount: 35,
    isNew: false,
    isBestseller: false,
    variants: [v("gold-smoke", "gold", "smoke"), v("silver-roseGrad", "silver", "roseGrad")],
    description:
      "Кошачий глаз, сведённый к одной линии титановой проволоки. Минимум материала, максимум формы.",
  }),
  make({
    slug: "orville-track",
    brand: "Orville",
    model: "Track",
    collection: "Motion",
    shape: "rectangle",
    material: "combined",
    gender: "men",
    lensTypes: ["polarized", "mirrored"],
    lensCategory: 4,
    dimensions: { lens: 59, bridge: 14, temple: 130 },
    size: "L",
    faceShapes: ["round", "oval"],
    price: 18900,
    inStock: true,
    stockLeft: 24,
    rating: 4.3,
    reviewCount: 145,
    isNew: false,
    isBestseller: false,
    variants: [v("black-grey", "black", "grey"), v("khaki-amber", "khaki", "amber")],
    description:
      "Прямоугольная спортивная посадка категории 4. Ударопрочный поликарбонат и нескользящие заушники.",
  }),
];

/* ---------- Производные справочники ---------- */

export const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort((a, b) =>
  a.localeCompare(b, "ru"),
);

export const SHAPES = Object.keys(SHAPE_LABEL) as FrameShape[];

const TRANSLIT: Record<string, string> = { " ": "-", "&": "and" };

export function brandSlug(brand: string): string {
  return brand
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9-]/g, "");
}

export function brandFromSlug(slug: string): string | undefined {
  return BRANDS.find((b) => brandSlug(b) === slug);
}

/** Справка о бренде для его страницы. Ключ — название бренда из каталога. */
export const BRAND_INFO: Record<
  string,
  { tagline: string; about: string; founded: string; country: string }
> = {
  Meridian: {
    tagline: "Титан и классические силуэты",
    about:
      "Мастерская из Больё, работающая с титаном с 1978 года. Меридиановцы не изобретают форму заново — они доводят авиатор до состояния, в котором его больше нечего убрать. Все петли паяются вручную, вес модели редко превышает 24 грамма.",
    founded: "1978",
    country: "Франция",
  },
  Nocturne: {
    tagline: "Плотный ацетат, городская геометрия",
    about:
      "Бренд вырос из небольшой оптики в Антверпене. Работает только с итальянским ацетатом плотностью выше среднего: заготовка полируется 48 часов в барабане с ореховой крошкой, поэтому оправа держит форму и не выцветает.",
    founded: "2004",
    country: "Бельгия",
  },
  "Atelier Voss": {
    tagline: "Скульптурные оправы малой серией",
    about:
      "Ателье выпускает не более трёхсот пар одной модели. Формы разрабатываются как объект: сначала гипсовый макет, потом фрезеровка. Отсюда выраженные профили и узнаваемый силуэт, который читается со спины.",
    founded: "2016",
    country: "Германия",
  },
  Lume: {
    tagline: "Лёгкий металл и фотохром",
    about:
      "Инженерный подход к оправе: нержавеющая сталь, минимум сварных швов, вес от 15 грамм. Lume первыми в своём ценовом сегменте поставили фотохромную линзу в круглую оправу — стекло темнеет за 30 секунд.",
    founded: "2011",
    country: "Дания",
  },
  Castelli: {
    tagline: "Побережье, поляризация, объём",
    about:
      "Семейная фабрика в Кадоре — исторической столице очкового производства. Специализация — крупные оправы с поляризацией для яркого солнца: залив, палуба, горный снег.",
    founded: "1961",
    country: "Италия",
  },
  Orville: {
    tagline: "Спортивная посадка без компромиссов",
    about:
      "Начинали с очков для велогонок, поэтому у каждой модели резиновые упоры на переносице и заушниках, а линза выдерживает удар стального шарика. Категория 4 — для высокогорья и открытой воды.",
    founded: "1994",
    country: "США",
  },
  Solara: {
    tagline: "Тёплые градиенты и лёгкие оправы",
    about:
      "Бренд про повседневность: невысокая цена, тёплая палитра, вес под 16 грамм. Solara делает ставку на градиентные линзы — они осветляют нижнюю часть лица и работают в помещении не хуже, чем на улице.",
    founded: "2009",
    country: "Португалия",
  },
  Vanta: {
    tagline: "Минимум материала, максимум формы",
    about:
      "Японский титан и геометрия, сведённая к одной линии. У Vanta нет декоративных элементов вообще: всё, что видно на оправе, несёт конструктивную нагрузку. Самая лёгкая модель каталога — их работа.",
    founded: "2013",
    country: "Япония",
  },
};
export const FACE_SHAPES = Object.keys(FACE_LABEL) as FaceShape[];
export const LENS_TYPES = Object.keys(LENS_LABEL) as LensType[];
export const MATERIALS = Object.keys(MATERIAL_LABEL) as Material[];
export const SIZES: FrameSize[] = ["S", "M", "L"];

export const FRAME_COLORS = [...new Set(PRODUCTS.flatMap((p) => p.variants.map((x) => x.frame)))].sort(
  (a, b) => a.localeCompare(b, "ru"),
);
export const LENS_COLORS = [...new Set(PRODUCTS.flatMap((p) => p.variants.map((x) => x.lens)))].sort(
  (a, b) => a.localeCompare(b, "ru"),
);

export const PRICE_MIN = Math.min(...PRODUCTS.map((p) => p.price));
export const PRICE_MAX = Math.max(...PRODUCTS.map((p) => p.price));

export function colorHex(name: string): string {
  for (const p of PRODUCTS) {
    for (const x of p.variants) {
      if (x.frame === name) return x.frameHex;
      if (x.lens === name) return x.lensHex;
    }
  }
  return "#cccccc";
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function similarTo(p: Product, limit = 4): Product[] {
  return PRODUCTS.filter((x) => x.slug !== p.slug)
    .map((x) => {
      let score = 0;
      if (x.shape === p.shape) score += 3;
      if (x.brand === p.brand) score += 2;
      if (x.size === p.size) score += 1;
      if (Math.abs(x.price - p.price) < 8000) score += 1;
      return { x, score };
    })
    .sort((a, b) => b.score - a.score || a.x.price - b.x.price)
    .slice(0, limit)
    .map((r) => r.x);
}

/* ---------- Фильтрация ---------- */

export type Sort = "popular" | "price-asc" | "price-desc" | "new" | "rating";

export const SORT_LABEL: Record<Sort, string> = {
  popular: "Популярные",
  "price-asc": "Сначала дешевле",
  "price-desc": "Сначала дороже",
  new: "Новинки",
  rating: "По рейтингу",
};

export type Query = {
  brand: string[];
  shape: FrameShape[];
  face: FaceShape[];
  frameColor: string[];
  lensColor: string[];
  lens: LensType[];
  material: Material[];
  size: FrameSize[];
  gender: Gender[];
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  sale: boolean;
  q: string;
  sort: Sort;
};

const list = (v: string | string[] | undefined): string[] =>
  v === undefined ? [] : Array.isArray(v) ? v.flatMap((s) => s.split(",")) : v.split(",");

export function parseQuery(sp: Record<string, string | string[] | undefined>): Query {
  const num = (v: string | string[] | undefined) => {
    const s = Array.isArray(v) ? v[0] : v;
    const n = s ? Number(s) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  return {
    brand: list(sp.brand),
    shape: list(sp.shape) as FrameShape[],
    face: list(sp.face) as FaceShape[],
    frameColor: list(sp.frameColor),
    lensColor: list(sp.lensColor),
    lens: list(sp.lens) as LensType[],
    material: list(sp.material) as Material[],
    size: list(sp.size) as FrameSize[],
    gender: list(sp.gender) as Gender[],
    priceMin: num(sp.priceMin),
    priceMax: num(sp.priceMax),
    inStock: (Array.isArray(sp.inStock) ? sp.inStock[0] : sp.inStock) === "1",
    sale: (Array.isArray(sp.sale) ? sp.sale[0] : sp.sale) === "1",
    q: ((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "").trim(),
    sort: (sortRaw && sortRaw in SORT_LABEL ? sortRaw : "popular") as Sort,
  };
}

/** Ключи фасетов — используются и для фильтрации, и для подсчёта счётчиков. */
const PREDICATES: Record<string, (p: Product, q: Query) => boolean> = {
  brand: (p, q) => q.brand.length === 0 || q.brand.includes(p.brand),
  shape: (p, q) => q.shape.length === 0 || q.shape.includes(p.shape),
  face: (p, q) => q.face.length === 0 || q.face.some((f) => p.faceShapes.includes(f)),
  frameColor: (p, q) =>
    q.frameColor.length === 0 || p.variants.some((v) => q.frameColor.includes(v.frame)),
  lensColor: (p, q) =>
    q.lensColor.length === 0 || p.variants.some((v) => q.lensColor.includes(v.lens)),
  lens: (p, q) => q.lens.length === 0 || q.lens.some((l) => p.lensTypes.includes(l)),
  material: (p, q) => q.material.length === 0 || q.material.includes(p.material),
  size: (p, q) => q.size.length === 0 || q.size.includes(p.size),
  gender: (p, q) => q.gender.length === 0 || q.gender.includes(p.gender),
  price: (p, q) =>
    (q.priceMin === undefined || p.price >= q.priceMin) &&
    (q.priceMax === undefined || p.price <= q.priceMax),
  inStock: (p, q) => !q.inStock || p.inStock,
  sale: (p, q) => !q.sale || Boolean(p.oldPrice && p.oldPrice > p.price),
  q: (p, q) => q.q.length === 0 || searchScore(p, q.q) > 0,
};

/** Поле, по которому идёт текстовый поиск. Всё в нижнем регистре, один раз на товар. */
function haystack(p: Product): string[] {
  return [
    p.brand,
    p.model,
    p.collection,
    SHAPE_LABEL[p.shape],
    MATERIAL_LABEL[p.material],
    GENDER_LABEL[p.gender],
    ...p.lensTypes.map((l) => LENS_LABEL[l]),
    ...p.variants.map((v) => v.frame),
  ].map((v) => v.toLowerCase());
}

/**
 * Совпадение по началу слова весит больше, чем вхождение в середину:
 * запрос «ави» должен поднять авиаторы, а не модель со словом «навигация» в описании.
 */
export function searchScore(p: Product, query: string): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;
  const fields = haystack(p);
  let total = 0;
  for (const term of terms) {
    let best = 0;
    fields.forEach((field, i) => {
      // бренд и модель — первые два поля, они важнее остальных
      const weight = i < 2 ? 3 : 1;
      if (field.startsWith(term)) best = Math.max(best, 4 * weight);
      else if (new RegExp(`\\b${escapeRe(term)}`).test(field)) best = Math.max(best, 3 * weight);
      else if (field.includes(term)) best = Math.max(best, 1 * weight);
    });
    if (best === 0) return 0; // все слова запроса должны находиться
    total += best;
  }
  return total;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type Suggestion =
  | { kind: "brand"; label: string; href: string; note: string }
  | { kind: "shape"; label: string; href: string; note: string; shape: FrameShape }
  | { kind: "product"; label: string; href: string; note: string; product: Product };

/** Автокомплит: бренды, формы оправы и конкретные модели — в этом порядке. */
export function suggest(query: string, limit = 8): Suggestion[] {
  const term = query.trim().toLowerCase();
  if (term.length === 0) return [];

  const brands: Suggestion[] = BRANDS.filter((b) => b.toLowerCase().includes(term)).map((b) => {
    const n = PRODUCTS.filter((p) => p.brand === b).length;
    return {
      kind: "brand",
      label: b,
      href: `/brands/${brandSlug(b)}`,
      note: `${n} ${n === 1 ? "модель" : n < 5 ? "модели" : "моделей"}`,
    };
  });

  const shapes: Suggestion[] = SHAPES.filter((s) =>
    SHAPE_LABEL[s].toLowerCase().includes(term),
  ).map((s) => {
    const n = PRODUCTS.filter((p) => p.shape === s).length;
    return {
      kind: "shape",
      label: SHAPE_LABEL[s],
      href: `/catalog?shape=${s}`,
      note: `${n} ${n === 1 ? "модель" : n < 5 ? "модели" : "моделей"}`,
      shape: s,
    };
  });

  const products: Suggestion[] = PRODUCTS.map((p) => ({ p, score: searchScore(p, term) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .map(({ p }) => ({
      kind: "product" as const,
      label: `${p.brand} ${p.model}`,
      href: `/product/${p.slug}`,
      note: SHAPE_LABEL[p.shape],
      product: p,
    }));

  return [...brands, ...shapes, ...products].slice(0, limit);
}

export const POPULAR_QUERIES = [
  "авиаторы",
  "поляризация",
  "кошачий глаз",
  "титан",
  "градиент",
  "oversize",
];

function matches(p: Product, q: Query, ignore?: string): boolean {
  for (const [key, fn] of Object.entries(PREDICATES)) {
    if (key === ignore) continue;
    if (!fn(p, q)) return false;
  }
  return true;
}

export function filterProducts(q: Query, base: Product[] = PRODUCTS): Product[] {
  const out = base.filter((p) => matches(p, q));
  // При текстовом запросе релевантность важнее популярности
  if (q.q.length > 0 && q.sort === "popular") {
    return out.sort((a, b) => searchScore(b, q.q) - searchScore(a, q.q) || b.rating - a.rating);
  }
  switch (q.sort) {
    case "price-asc":
      return out.sort((a, b) => a.price - b.price);
    case "price-desc":
      return out.sort((a, b) => b.price - a.price);
    case "new":
      return out.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.rating - a.rating);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating);
    default:
      return out.sort(
        (a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.reviewCount - a.reviewCount,
      );
  }
}

/**
 * Счётчик товаров для одного значения фасета — считается на выдаче,
 * из которой исключён сам этот фасет. Иначе выбор одного бренда обнулил бы все остальные.
 */
export function facetCount(
  q: Query,
  facet: string,
  test: (p: Product) => boolean,
  base: Product[] = PRODUCTS,
): number {
  return base.filter((p) => matches(p, q, facet) && test(p)).length;
}
