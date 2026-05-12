import { useMemo, useSyncExternalStore } from 'react';
import { getStore } from './registry.js';

export interface Formatter {
  number(value: number, options?: Intl.NumberFormatOptions): string;
  dateTime(value: Date | number, options?: Intl.DateTimeFormatOptions): string;
  relativeTime(
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ): string;
  list(items: Iterable<string>, options?: Intl.ListFormatOptions): string;
}

export function useFormatter(): Formatter {
  const store = getStore();
  const locale = useSyncExternalStore(
    store.subscribe,
    () => store.getState().locale,
    () => store.getState().locale,
  );
  return useMemo(() => createFormatter(locale), [locale]);
}

function createFormatter(locale: string): Formatter {
  return {
    number(value, options) {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    dateTime(value, options) {
      return new Intl.DateTimeFormat(locale, options).format(value);
    },
    relativeTime(value, unit, options) {
      return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
    },
    list(items, options) {
      return new Intl.ListFormat(locale, options).format(items);
    },
  };
}
