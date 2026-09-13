import { beforeEach, describe, expect, it } from 'vitest';
import { createApi18n } from '../src/client/createApi18n.js';
import { _resetForTests } from '../src/client/registry.js';
import { getTranslations } from '../src/server/index.js';

beforeEach(() => {
  _resetForTests();
});

describe('getTranslations', () => {
  it('exposes structured values through t.raw on the server', async () => {
    const steps = ['First', { title: 'Second', optional: true }];
    createApi18n({
      resources: {
        en: { greeting: 'Hello', enabled: true, steps },
      },
      defaultLocale: 'en',
    });

    const t = await getTranslations();

    expect(t('greeting')).toBe('Hello');
    expect(t.raw('enabled')).toBe(true);
    expect(t.raw('steps')).toBe(steps);
  });

  it('uses namespace and fallback resolution for raw values', async () => {
    createApi18n({
      resources: {
        en: { checkout: { steps: ['Fallback'] } },
        pt: { checkout: {} },
      },
      defaultLocale: 'pt',
      fallbackLocale: 'en',
    });

    const t = await getTranslations('checkout');

    expect(t.raw('steps')).toEqual(['Fallback']);
    expect(t.raw('missing')).toBe('checkout.missing');
  });
});
