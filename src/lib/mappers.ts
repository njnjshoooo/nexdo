/**
 * snake_case ↔ camelCase 轉換工具
 * PostgreSQL 用 snake_case，TypeScript 用 camelCase
 */

/** snake_case → camelCase */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/** camelCase → snake_case */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/** 遞迴轉換物件的所有 key：snake → camel */
export function mapFromDb<T = any>(obj: Record<string, any>): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map(mapFromDb) as T;
  if (typeof obj !== 'object') return obj as T;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    // 不遞迴轉換 JSONB 欄位（它們已經是前端格式）
    if (isJsonbField(key)) {
      result[camelKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = mapFromDb(value);
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

/** 遞迴轉換物件的所有 key：camel → snake */
export function mapToDb(obj: Record<string, any>): Record<string, any> {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(mapToDb);
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    // 不遞迴轉換 JSONB 欄位（直接存入原始結構）
    if (isJsonbField(snakeKey)) {
      result[snakeKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = mapToDb(value);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

/** JSONB 欄位名單 — 這些欄位的內容直接存取，不做 key 轉換 */
const JSONB_FIELDS = new Set([
  'content',
  'items',
  'checklist',
  'variants',
  'fixed_config', 'fixedConfig',
  'quote_config', 'quoteConfig',
  'internal_form_config', 'internalFormConfig',
  'external_link_config', 'externalLinkConfig',
  'customer_info', 'customerInfo',
  'status_updates', 'statusUpdates',
  'fields',
  'data',
]);

function isJsonbField(key: string): boolean {
  return JSONB_FIELDS.has(key);
}
