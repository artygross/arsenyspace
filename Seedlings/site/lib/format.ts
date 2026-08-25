export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
}

export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

export function discountPercent(price: number, oldPrice?: number): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round((1 - price / oldPrice) * 100);
}

export function formatDate(iso: string): string {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
  ];
  const d = new Date(iso);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Сумма прописью для накладной */
export function amountInWords(value: number): string {
  const rub = Math.floor(value);
  const kop = Math.round((value - rub) * 100);
  const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const onesF = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const teens = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

  function triad(n: number, female: boolean): string {
    const out: string[] = [];
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;
    if (h) out.push(hundreds[h]);
    if (t === 1) {
      out.push(teens[o]);
    } else {
      if (t) out.push(tens[t]);
      if (o) out.push(female ? onesF[o] : ones[o]);
    }
    return out.join(" ");
  }

  const parts: string[] = [];
  const thousands = Math.floor(rub / 1000);
  const rest = rub % 1000;
  if (thousands) {
    parts.push(triad(thousands, true));
    parts.push(plural(thousands, "тысяча", "тысячи", "тысяч"));
  }
  if (rest || !thousands) parts.push(triad(rest, false));
  parts.push(plural(rub, "рубль", "рубля", "рублей"));
  const text = parts.filter(Boolean).join(" ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} ${String(kop).padStart(2, "0")} коп.`;
}
