/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Compile-time tests for the `Messages` augmentation surface.
 * If this file typechecks, the typed `t()` API works as designed.
 * No runtime assertions — vitest skips it because of the `.test-d.` suffix.
 */
import type { ReactNode } from 'react';
import { useTranslations } from '../src/client/useTranslations.js';
import { getTranslations } from '../src/server/index.js';
import type {
  RawValueFor,
  TextTranslationKey,
  TranslationKey,
} from '../src/types/Messages.js';

declare module '../src/types/Messages.js' {
  interface Messages {
    hello: { __raw: 'Hello {name}'; name: string | number };
    'cart.items': {
      __raw: '{count, plural, one {# item} other {# items}}';
      count: number;
    };
    'button.cancel': { __raw: 'Cancel' };
    agreement: {
      __raw: 'By signing up <link>terms</link>';
      link: (chunks: ReactNode) => ReactNode;
    };
    enabled: { __raw: boolean };
    maximumItems: { __raw: number };
    steps: {
      __raw: [string, { title: string; optional: boolean; tags: [string, null] }];
    };
  }
}

function passes() {
  const t = useTranslations();
  const a: string = t('hello', { name: 'Eduardo' });
  const b: string = t('cart.items', { count: 3 });
  const c: string = t('button.cancel');
  const d: ReactNode = t('agreement', { link: (chunks) => chunks });
  const enabled: boolean = t.raw('enabled');
  const maximumItems: number = t.raw('maximumItems');
  const steps: [string, { title: string; optional: boolean; tags: [string, null] }] =
    t.raw('steps');
  const rawText: string = t.raw('hello');
  const anyKey: TranslationKey = 'steps';
  const textKey: TextTranslationKey = 'hello';
  const rawType: RawValueFor<'maximumItems'> = 3;
  return [
    a,
    b,
    c,
    d,
    enabled,
    maximumItems,
    steps,
    rawText,
    anyKey,
    textKey,
    rawType,
  ];
}

function fails() {
  const t = useTranslations();
  // @ts-expect-error — unknown key
  t('helo', { name: 'x' });
  // @ts-expect-error — missing required `name`
  t('hello');
  // @ts-expect-error — typo in arg name
  t('hello', { nme: 'x' });
  // @ts-expect-error — wrong type (string passed where number required)
  t('cart.items', { count: '3' });
  // @ts-expect-error — keyless call accepts no args, none expected
  t('button.cancel', { foo: 1 });
  // @ts-expect-error — structured values must use t.raw()
  t('enabled');
  // @ts-expect-error — structured values must use t.raw()
  t('steps');
  // @ts-expect-error — unknown raw key
  t.raw('stepz');
}

async function serverPasses() {
  const t = await getTranslations();
  const greeting: string = t('hello', { name: 'Eduardo' });
  const enabled: boolean = t.raw('enabled');
  const steps: [string, { title: string; optional: boolean; tags: [string, null] }] =
    t.raw('steps');
  return [greeting, enabled, steps];
}

async function serverFails() {
  const t = await getTranslations();
  // @ts-expect-error — structured values must use t.raw() on the server too
  t('maximumItems');
  // @ts-expect-error — unknown raw key
  t.raw('maximumItemz');
}
