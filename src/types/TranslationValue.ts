export type TranslationScalar = string | number | boolean;

export type TranslationArrayItem =
  | TranslationScalar
  | null
  | TranslationArray
  | TranslationArrayObject;

export type TranslationArray = TranslationArrayItem[];

export type TranslationArrayObject = {
  [key: string]: TranslationArrayItem;
};

/**
 * One atomic value at a translation key. Plain objects in locale resources
 * are namespaces; objects are values only when nested inside an array.
 */
export type TranslationValue = TranslationScalar | TranslationArray;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTranslationArrayItem(value: unknown): value is TranslationArrayItem {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return true;
  }
  if (Array.isArray(value)) return value.every(isTranslationArrayItem);
  if (!isPlainObject(value)) return false;
  return Object.values(value).every(isTranslationArrayItem);
}

export function isTranslationValue(value: unknown): value is TranslationValue {
  return (
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    (Array.isArray(value) && value.every(isTranslationArrayItem))
  );
}
