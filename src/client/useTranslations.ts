import { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { interpolate, type Args } from '../parser/index.js';
import type { Messages, TranslationKey, ArgsFor } from '../types/Messages.js';
import { getStore } from './registry.js';

type HasArgs<A> = [keyof A] extends [never] ? false : true;

type StrictTFunction = <K extends TranslationKey>(
  key: K,
  ...args: HasArgs<ArgsFor<K>> extends true ? [ArgsFor<K>] : []
) => RenderResult<K>;

type PermissiveTFunction = (key: string, args?: Args) => string | ReactNode[];

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
    const t = ((key: string, args?: Args) => {
      const fullKey = namespace ? `${namespace}.${key}` : key;
      const message = flat.get(fullKey) ?? fallbackFlat?.get(fullKey) ?? fullKey;
      return interpolate(message, args ?? {}, locale);
    }) as TFunction;
    return t;
  }, [locale, namespace, store]);
}

// Suppress "imported but unused" for the type-only Messages re-export consumers see.
export type { Messages };
