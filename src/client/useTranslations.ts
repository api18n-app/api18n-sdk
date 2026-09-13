import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { interpolate, type Args } from '../parser/index.js';
import type {
  ArgsFor,
  Messages,
  RawValueFor,
  TextTranslationKey,
  TranslationKey,
} from '../types/Messages.js';
import type { TranslationValue } from '../types/TranslationValue.js';
import { getStore } from './registry.js';

type HasArgs<A> = [keyof A] extends [never] ? false : true;

type StrictTFunction = {
  <K extends TextTranslationKey>(
    key: K,
    ...args: HasArgs<ArgsFor<K>> extends true ? [ArgsFor<K>] : []
  ): RenderResult<K>;
  raw<K extends TranslationKey>(key: K): RawValueFor<K>;
};

type PermissiveTFunction = {
  (key: string, args?: Args): string | ReactNode[];
  raw(key: string): TranslationValue;
};

export type TFunction = [keyof Messages] extends [never] ? PermissiveTFunction : StrictTFunction;

type RenderResult<K> = ArgsFor<K> extends Record<string, infer V>
  ? Extract<V, (chunks: ReactNode) => ReactNode> extends never
    ? string
    : ReactNode
  : string;

export function useTranslations(namespace?: string): TFunction {
  const store = getStore();
  const locale = useSyncExternalStore(
    store.subscribe,
    () => store.getState().locale,
    () => store.getState().locale,
  );

  return useMemo(() => {
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
    }) as TFunction;
    t.raw = ((key: string) => resolve(key)) as TFunction['raw'];
    return t;
  }, [locale, namespace, store]);
}

// Suppress "imported but unused" for the type-only Messages re-export consumers see.
export type { Messages };
