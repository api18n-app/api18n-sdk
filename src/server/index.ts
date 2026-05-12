import { cache } from 'react';
import { peekStore } from '../client/registry.js';
import { interpolate, type Args } from '../parser/index.js';
import type { TranslationKey, ArgsFor } from '../types/Messages.js';

interface RequestLocaleSlot {
  locale: string | null;
}

const getRequestLocaleSlot = cache((): RequestLocaleSlot => ({ locale: null }));

export function setRequestLocale(locale: string): void {
  getRequestLocaleSlot().locale = locale;
}

export function getRequestLocale(): string {
  const slot = getRequestLocaleSlot();
  if (slot.locale) return slot.locale;
  const store = peekStore();
  if (store) return store.getState().locale;
  throw new Error(
    'api18n: setRequestLocale() not called for this request and no createApi18n() instance found. Call setRequestLocale(params.locale) in your root layout.',
  );
}

type ServerTFunction = <K extends TranslationKey>(
  key: K,
  ...args: [keyof ArgsFor<K>] extends [never] ? [args?: Args] : [ArgsFor<K>]
) => ReturnType<typeof interpolate>;

export async function getTranslations(namespace?: string): Promise<ServerTFunction> {
  const store = peekStore();
  if (!store) {
    throw new Error(
      'api18n: getTranslations() requires createApi18n() to have been called. Add `import "./api18n"` to your root layout.',
    );
  }
  const locale = getRequestLocale();
  const flat = store.getFlat(locale);
  const fallback = store.getState().fallbackLocale;
  const fallbackFlat = fallback && fallback !== locale ? store.getFlat(fallback) : null;

  return ((key: string, args?: Args) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const message = flat.get(fullKey) ?? fallbackFlat?.get(fullKey) ?? fullKey;
    return interpolate(message, args ?? {}, locale);
  }) as ServerTFunction;
}
