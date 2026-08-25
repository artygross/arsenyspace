/** Артикул позиции — связь с номенклатурой Бизнес.ру (docs/08-integrations.md §2) */
export function sku(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) % 100000;
  return `${slug.slice(0, 2).toUpperCase()}-${String(h).padStart(5, "0")}`;
}
