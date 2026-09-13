import { cache, type ReactNode } from 'react';
import { peekStore } from '../client/registry.js';
import { interpolate, type Args } from '../parser/index.js';
import type {
  ArgsFor,
  Messages,
  RawValueFor,
  TextTranslationKey,
  TranslationKey,
} from '../types/Messages.js';
import type { TranslationValue } from '../types/TranslationValue.js';

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

type StrictServerTFunction = {
  <K extends TextTranslationKey>(
    key: K,
    ...args: [keyof ArgsFor<K>] extends [never] ? [args?: Args] : [ArgsFor<K>]
  ): ServerRenderResult<K>;
  raw<K extends TranslationKey>(key: K): RawValueFor<K>;
};

type ServerRenderResult<K> = ArgsFor<K> extends Record<string, infer Value>
  ? Extract<Value, (chunks: ReactNode) => ReactNode> extends never
    ? string
    : ReactNode
  : string;

type PermissiveServerTFunction = {
  (key: string, args?: Args): ReturnType<typeof interpolate>;
  raw(key: string): TranslationValue;
};

export type ServerTFunction = [keyof Messages] extends [never]
  ? PermissiveServerTFunction
  : StrictServerTFunction;

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

  const resolve = (key: string): TranslationValue => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    if (flat.has(fullKey)) return flat.get(fullKey)!;
    if (fallbackFlat?.has(fullKey)) return fallbackFlat.get(fullKey)!;
    return fullKey;
  };
  const t = ((key: string, args?: Args) => {
    const message = resolve(key);
    if (typeof message !== 'string') {
      return namespace ? `${namespace}.${key}` : key;
    }
    return interpolate(message, args ?? {}, locale);
  }) as ServerTFunction;
  t.raw = ((key: string) => resolve(key)) as ServerTFunction['raw'];
  return t;
}
