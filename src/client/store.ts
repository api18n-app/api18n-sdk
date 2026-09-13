import {
  isTranslationValue,
  type TranslationValue,
} from '../types/TranslationValue.js';

export type NestedMessages = {
  [key: string]: TranslationValue | NestedMessages;
};
export type Resources = Record<string, NestedMessages>;

export interface StoreState {
  locale: string;
  resources: Resources;
  fallbackLocale: string | null;
}

type Listener = () => void;

export interface Api18nStore {
  getState(): StoreState;
  setLocale(locale: string): void;
  subscribe(listener: Listener): () => void;
  getFlat(locale: string): Map<string, TranslationValue>;
}

export function createStore(initial: StoreState): Api18nStore {
  let state = initial;
  const listeners = new Set<Listener>();
  const flatCache = new Map<string, Map<string, TranslationValue>>();

  function emit() {
    for (const l of listeners) l();
  }

  function ensureFlat(locale: string): Map<string, TranslationValue> {
    const cached = flatCache.get(locale);
    if (cached) return cached;
    const msgs = state.resources[locale];
    const flat = new Map<string, TranslationValue>();
    if (msgs) flatten(msgs, '', flat);
    flatCache.set(locale, flat);
    return flat;
  }

  return {
    getState: () => state,
    setLocale(locale) {
      if (locale === state.locale) return;
      state = { ...state, locale };
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getFlat: ensureFlat,
  };
}

function flatten(
  obj: NestedMessages,
  prefix: string,
  out: Map<string, TranslationValue>,
): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (isTranslationValue(value)) {
      out.set(path, value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    }
  }
}
