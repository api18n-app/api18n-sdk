import { createStore, type Resources, type Api18nStore } from './store.js';
import { registerStore } from './registry.js';

export interface CreateApi18nOptions {
  resources: Resources;
  defaultLocale: string;
  fallbackLocale?: string;
}

export interface Api18nInstance {
  getLocale(): string;
  setLocale(locale: string): void;
  /** @internal */
  _store: Api18nStore;
}

export function createApi18n(options: CreateApi18nOptions): Api18nInstance {
  const { resources, defaultLocale } = options;
  if (!resources || Object.keys(resources).length === 0) {
    throw new Error('api18n: createApi18n() requires at least one locale in `resources`.');
  }
  if (!resources[defaultLocale]) {
    throw new Error(
      `api18n: defaultLocale "${defaultLocale}" is not present in resources. Available: ${Object.keys(resources).join(', ')}`,
    );
  }
  const store = createStore({
    locale: defaultLocale,
    resources,
    fallbackLocale: options.fallbackLocale ?? defaultLocale,
  });
  registerStore(store);
  return {
    getLocale: () => store.getState().locale,
    setLocale: (locale) => store.setLocale(locale),
    _store: store,
  };
}
