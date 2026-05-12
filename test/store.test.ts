import { describe, it, expect } from 'vitest';
import { createStore } from '../src/client/store.js';

describe('createStore', () => {
  it('flattens nested messages into dot-keys', () => {
    const store = createStore({
      locale: 'en',
      resources: {
        en: { button: { cancel: 'Cancel', save: 'Save' }, hello: 'Hi' },
      },
      fallbackLocale: 'en',
    });
    const flat = store.getFlat('en');
    expect(flat.get('button.cancel')).toBe('Cancel');
    expect(flat.get('button.save')).toBe('Save');
    expect(flat.get('hello')).toBe('Hi');
  });

  it('caches the flattened map per locale', () => {
    const store = createStore({
      locale: 'en',
      resources: { en: { a: 'A' } },
      fallbackLocale: 'en',
    });
    const a = store.getFlat('en');
    const b = store.getFlat('en');
    expect(a).toBe(b);
  });

  it('notifies subscribers on setLocale', () => {
    const store = createStore({
      locale: 'en',
      resources: { en: { a: 'A' }, pt: { a: 'P' } },
      fallbackLocale: 'en',
    });
    let calls = 0;
    const unsub = store.subscribe(() => {
      calls++;
    });
    store.setLocale('pt');
    expect(calls).toBe(1);
    expect(store.getState().locale).toBe('pt');
    store.setLocale('pt');
    expect(calls).toBe(1);
    unsub();
    store.setLocale('en');
    expect(calls).toBe(1);
  });

  it('returns an empty map for unknown locales without crashing', () => {
    const store = createStore({
      locale: 'en',
      resources: { en: { a: 'A' } },
      fallbackLocale: 'en',
    });
    expect(store.getFlat('xx').size).toBe(0);
  });
});
