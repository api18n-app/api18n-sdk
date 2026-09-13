import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { createApi18n } from '../src/client/createApi18n.js';
import { useTranslations } from '../src/client/useTranslations.js';
import { setLocale } from '../src/client/useLocale.js';
import { _resetForTests } from '../src/client/registry.js';
import { _clearParseCache } from '../src/parser/index.js';

beforeEach(() => {
  _resetForTests();
  _clearParseCache();
});

afterEach(() => {
  cleanup();
});

function Greeting() {
  const t = useTranslations();
  return <h1>{t('hello', { name: 'Eduardo' })}</h1>;
}

function Cart({ count }: { count: number }) {
  const t = useTranslations();
  return <p>{t('cart.items', { count })}</p>;
}

describe('useTranslations', () => {
  it('renders a translated string with interpolation', () => {
    createApi18n({
      resources: {
        en: { hello: 'Hello {name}' },
      },
      defaultLocale: 'en',
    });
    render(<Greeting />);
    expect(screen.getByRole('heading').textContent).toBe('Hello Eduardo');
  });

  it('switches locale via setLocale and re-renders subscribed components', () => {
    createApi18n({
      resources: {
        en: { hello: 'Hello {name}' },
        pt: { hello: 'Olá {name}' },
      },
      defaultLocale: 'en',
    });
    render(<Greeting />);
    expect(screen.getByRole('heading').textContent).toBe('Hello Eduardo');
    act(() => setLocale('pt'));
    expect(screen.getByRole('heading').textContent).toBe('Olá Eduardo');
  });

  it('falls back to the fallback locale for missing keys', () => {
    createApi18n({
      resources: {
        en: { hello: 'Hello {name}' },
        pt: {},
      },
      defaultLocale: 'pt',
      fallbackLocale: 'en',
    });
    render(<Greeting />);
    expect(screen.getByRole('heading').textContent).toBe('Hello Eduardo');
  });

  it('returns the key unchanged when missing from both primary and fallback', () => {
    createApi18n({
      resources: { en: {} },
      defaultLocale: 'en',
    });
    function Missing() {
      const t = useTranslations();
      return <span>{t('nope.key')}</span>;
    }
    render(<Missing />);
    expect(screen.getByText('nope.key')).toBeTruthy();
  });

  it('renders ICU plurals through the hook', () => {
    createApi18n({
      resources: {
        en: { cart: { items: '{count, plural, one {# item} other {# items}}' } },
      },
      defaultLocale: 'en',
    });
    const { rerender } = render(<Cart count={1} />);
    expect(screen.getByText('1 item')).toBeTruthy();
    rerender(<Cart count={5} />);
    expect(screen.getByText('5 items')).toBeTruthy();
  });

  it('supports namespacing', () => {
    createApi18n({
      resources: {
        en: { checkout: { confirm: 'Confirm order' } },
      },
      defaultLocale: 'en',
    });
    function Btn() {
      const t = useTranslations('checkout');
      return <button>{t('confirm')}</button>;
    }
    render(<Btn />);
    expect(screen.getByRole('button').textContent).toBe('Confirm order');
  });

  it('returns structured values unchanged through t.raw', () => {
    const steps = [
      'Create an account',
      { title: 'Invite teammates', optional: false },
    ];
    createApi18n({
      resources: {
        en: { checkout: { enabled: true, maximumItems: 8, steps } },
      },
      defaultLocale: 'en',
    });
    function RawValues() {
      const t = useTranslations();
      return (
        <output>
          {JSON.stringify({
            enabled: t.raw('checkout.enabled'),
            maximumItems: t.raw('checkout.maximumItems'),
            steps: t.raw('checkout.steps'),
          })}
        </output>
      );
    }

    render(<RawValues />);

    expect(screen.getByText(JSON.stringify({ enabled: true, maximumItems: 8, steps }))).toBeTruthy();
  });

  it('applies namespace and locale fallback to t.raw', () => {
    createApi18n({
      resources: {
        en: { checkout: { steps: ['Fallback'] } },
        pt: { checkout: {} },
      },
      defaultLocale: 'pt',
      fallbackLocale: 'en',
    });
    function RawValue() {
      const t = useTranslations('checkout');
      return <output>{JSON.stringify(t.raw('steps'))}</output>;
    }

    render(<RawValue />);

    expect(screen.getByText('["Fallback"]')).toBeTruthy();
  });

  it('does not stringify structured values through the text API at runtime', () => {
    createApi18n({
      resources: { en: { checkout: { steps: ['First', 'Second'] } } },
      defaultLocale: 'en',
    });
    function TextValue() {
      const t = useTranslations();
      return <output>{t('checkout.steps')}</output>;
    }

    render(<TextValue />);

    expect(screen.getByText('checkout.steps')).toBeTruthy();
  });
});
