/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Compile-time tests for the `Messages` augmentation surface.
 * If this file typechecks, the typed `t()` API works as designed.
 * No runtime assertions — vitest skips it because of the `.test-d.` suffix.
 */
import type { ReactNode } from 'react';
import { useTranslations } from '../src/client/useTranslations.js';

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
  }
}

function passes() {
  const t = useTranslations();
  const a: string = t('hello', { name: 'Eduardo' });
  const b: string = t('cart.items', { count: 3 });
  const c: string = t('button.cancel');
  const d: ReactNode = t('agreement', { link: (chunks) => chunks });
  return [a, b, c, d];
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
}
