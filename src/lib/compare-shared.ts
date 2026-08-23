/** Лимит из docs/03-ux-structure.md: больше четырёх колонок не читается ни на одном экране. */
export const COMPARE_LIMIT = 4;

export function compareHref(slugs: string[]): string {
  return slugs.length > 0 ? `/compare?items=${slugs.slice(0, COMPARE_LIMIT).join(",")}` : "/compare";
}
