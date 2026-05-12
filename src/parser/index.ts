import IntlMessageFormat from 'intl-messageformat';
import type { ReactNode } from 'react';

export type Args = Record<string, unknown>;
export type TagRenderer = (chunks: ReactNode) => ReactNode;

const formatterCache = new Map<string, IntlMessageFormat>();
const tagNamesCache = new Map<string, Set<string>>();

const TAG_REGEX = /<([a-zA-Z][a-zA-Z0-9_-]*)>/g;

function extractTagNames(message: string): Set<string> {
  const hit = tagNamesCache.get(message);
  if (hit) return hit;
  const names = new Set<string>();
  for (const match of message.matchAll(TAG_REGEX)) {
    names.add(match[1]!);
  }
  tagNamesCache.set(message, names);
  return names;
}

function getFormatter(message: string, locale: string): IntlMessageFormat {
  const cacheKey = `${locale}\x00${message}`;
  const hit = formatterCache.get(cacheKey);
  if (hit) return hit;
  const formatter = new IntlMessageFormat(message, locale, undefined, {
    ignoreTag: false,
  });
  formatterCache.set(cacheKey, formatter);
  return formatter;
}

export function interpolate(
  message: string,
  args: Args = {},
  locale: string,
): string | ReactNode[] {
  let formatter: IntlMessageFormat;
  try {
    formatter = getFormatter(message, locale);
  } catch {
    return message;
  }

  const tagNames = extractTagNames(message);
  let fullArgs: Args = args;
  if (tagNames.size > 0) {
    fullArgs = { ...args };
    for (const tag of tagNames) {
      if (typeof fullArgs[tag] !== 'function') {
        fullArgs[tag] = (chunks: ReactNode) => chunks;
      }
    }
  }

  let result: unknown;
  try {
    result = formatter.format(fullArgs as Record<string, unknown>);
  } catch {
    return message;
  }

  if (typeof result === 'string') return result;
  if (Array.isArray(result)) {
    if (result.every((part) => typeof part === 'string')) return result.join('');
    return result as ReactNode[];
  }
  return String(result ?? '');
}

export function _clearParseCache(): void {
  formatterCache.clear();
  tagNamesCache.clear();
}
