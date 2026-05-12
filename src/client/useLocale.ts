import { useSyncExternalStore } from 'react';
import { getStore } from './registry.js';

export function useLocale(): string {
  const store = getStore();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().locale,
    () => store.getState().locale,
  );
}

export function setLocale(locale: string): void {
  getStore().setLocale(locale);
}

export function getLocale(): string {
  return getStore().getState().locale;
}
