export type NestedMessages = { [key: string]: string | NestedMessages };
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
  getFlat(locale: string): Map<string, string>;
}

export function createStore(initial: StoreState): Api18nStore {
  let state = initial;
  const listeners = new Set<Listener>();
  const flatCache = new Map<string, Map<string, string>>();

  function emit() {
    for (const l of listeners) l();
  }

  function ensureFlat(locale: string): Map<string, string> {
    const cached = flatCache.get(locale);
    if (cached) return cached;
    const msgs = state.resources[locale];
    const flat = new Map<string, string>();
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

function flatten(obj: NestedMessages, prefix: string, out: Map<string, string>): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out.set(path, value);
    } else if (value && typeof value === 'object') {
      flatten(value, path, out);
    }
  }
}
