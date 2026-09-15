import overrides from '../data/brandImageOverrides.json';

const replacements = Object.entries(overrides).sort(([a], [b]) => b.length - a.length);

/** Resolve reviewed image replacements in CMS fields, Markdown, and embedded HTML.
 * The original records/assets remain available; only known image URLs are changed.
 */
export function applyBrandImages<T>(value: T): T {
  if (typeof value === 'string') {
    let result: string = value;
    for (const [source, target] of replacements) result = result.split(source).join(target);
    return result as T;
  }
  if (Array.isArray(value)) return value.map(item => applyBrandImages(item)) as T;
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, applyBrandImages(item)])) as T;
  }
  return value;
}
