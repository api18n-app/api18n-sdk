import { describe, it, expect, beforeEach } from 'vitest';
import { interpolate, _clearParseCache } from '../src/parser/index.js';

beforeEach(() => _clearParseCache());

describe('interpolate', () => {
  it('returns plain strings unchanged', () => {
    expect(interpolate('Hello world', {}, 'en')).toBe('Hello world');
  });

  it('substitutes a {name} variable', () => {
    expect(interpolate('Hello {name}', { name: 'Eduardo' }, 'en')).toBe('Hello Eduardo');
  });

  it('substitutes multiple variables in one message', () => {
    expect(
      interpolate('{greeting}, {name}!', { greeting: 'Hi', name: 'Eduardo' }, 'en'),
    ).toBe('Hi, Eduardo!');
  });

  it('renders ICU plurals (cardinal)', () => {
    const msg = '{count, plural, one {# item} other {# items}}';
    expect(interpolate(msg, { count: 1 }, 'en')).toBe('1 item');
    expect(interpolate(msg, { count: 3 }, 'en')).toBe('3 items');
  });

  it('renders exact-match plurals before category', () => {
    const msg = '{count, plural, =0 {nothing} one {one thing} other {# things}}';
    expect(interpolate(msg, { count: 0 }, 'en')).toBe('nothing');
    expect(interpolate(msg, { count: 1 }, 'en')).toBe('one thing');
    expect(interpolate(msg, { count: 7 }, 'en')).toBe('7 things');
  });

  it('renders ICU select', () => {
    const msg = '{gender, select, female {she} male {he} other {they}} replied';
    expect(interpolate(msg, { gender: 'female' }, 'en')).toBe('she replied');
    expect(interpolate(msg, { gender: 'male' }, 'en')).toBe('he replied');
    expect(interpolate(msg, { gender: 'nb' }, 'en')).toBe('they replied');
  });

  it('formats numbers using Intl.NumberFormat', () => {
    const msg = 'Score: {n, number, percent}';
    expect(interpolate(msg, { n: 0.42 }, 'en')).toBe('Score: 42%');
  });

  it('formats dates using Intl.DateTimeFormat', () => {
    const date = new Date(Date.UTC(2026, 2, 15, 12, 0, 0));
    const msg = 'Placed on {when, date, long}';
    const result = interpolate(msg, { when: date }, 'en') as string;
    expect(result).toContain('2026');
    expect(result).toMatch(/March|Mar/);
  });

  it('returns a ReactNode[] when a rich tag renderer is provided', () => {
    const msg = 'Read our <link>terms</link> please.';
    const out = interpolate(msg, { link: (chunks: unknown) => ({ type: 'a', chunks }) }, 'en');
    expect(Array.isArray(out)).toBe(true);
    const arr = out as Array<unknown>;
    expect(arr[0]).toBe('Read our ');
    expect(arr[1]).toMatchObject({ type: 'a' });
    expect(arr[arr.length - 1]).toBe(' please.');
  });

  it('falls back to literal text when a tag has no renderer', () => {
    const msg = 'Read our <link>terms</link> please.';
    expect(interpolate(msg, {}, 'en')).toBe('Read our terms please.');
  });

  it('returns the key unchanged for empty args', () => {
    expect(interpolate('static text', {}, 'en')).toBe('static text');
  });

  it('handles nested plurals with embedded variables', () => {
    const msg = '{count, plural, one {# {color} apple} other {# {color} apples}}';
    expect(interpolate(msg, { count: 1, color: 'red' }, 'en')).toBe('1 red apple');
    expect(interpolate(msg, { count: 5, color: 'red' }, 'en')).toBe('5 red apples');
  });
});
