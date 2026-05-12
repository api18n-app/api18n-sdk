import type { Api18nStore } from './store.js';

let activeStore: Api18nStore | null = null;

export function registerStore(store: Api18nStore): void {
  activeStore = store;
}

export function getStore(): Api18nStore {
  if (!activeStore) {
    throw new Error(
      'api18n: no instance registered. Call createApi18n() in your app entry, then `import` that file before rendering.',
    );
  }
  return activeStore;
}

export function peekStore(): Api18nStore | null {
  return activeStore;
}

export function _resetForTests(): void {
  activeStore = null;
}
