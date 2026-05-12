import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { createApi18n } from '../src/client/createApi18n.js';
import { useFormatter } from '../src/client/useFormatter.js';
import { setLocale } from '../src/client/useLocale.js';
import { _resetForTests } from '../src/client/registry.js';

beforeEach(() => _resetForTests());
afterEach(() => cleanup());

function Showcase() {
  const f = useFormatter();
  return (
    <div>
      <span data-testid="num">{f.number(1234.5, { style: 'currency', currency: 'USD' })}</span>
      <span data-testid="date">{f.dateTime(new Date(Date.UTC(2026, 2, 15, 12, 0, 0)), { dateStyle: 'long' })}</span>
      <span data-testid="rel">{f.relativeTime(-3, 'day')}</span>
      <span data-testid="list">{f.list(['a', 'b', 'c'])}</span>
    </div>
  );
}

describe('useFormatter', () => {
  it('formats numbers, dates, relative time, and lists in the current locale', () => {
    createApi18n({ resources: { en: {} }, defaultLocale: 'en' });
    render(<Showcase />);
    expect(screen.getByTestId('num').textContent).toBe('$1,234.50');
    expect(screen.getByTestId('date').textContent).toMatch(/March|Mar/);
    expect(screen.getByTestId('date').textContent).toContain('2026');
    expect(screen.getByTestId('rel').textContent).toContain('3 days ago');
    expect(screen.getByTestId('list').textContent).toBe('a, b, and c');
  });

  it('re-renders with new locale formatting after setLocale', () => {
    createApi18n({
      resources: { en: {}, 'pt-BR': {} },
      defaultLocale: 'en',
    });
    render(<Showcase />);
    expect(screen.getByTestId('num').textContent).toBe('$1,234.50');
    act(() => setLocale('pt-BR'));
    // pt-BR formats USD with R$? No — currency stays USD, but separator changes.
    expect(screen.getByTestId('num').textContent).toMatch(/US\$\s?1\.234,50/);
  });
});
