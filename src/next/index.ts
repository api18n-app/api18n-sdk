/**
 * Next.js helpers. Kept intentionally minimal in M1.
 * Expanded in M2 with locale-aware <Link>, useRouter, and full middleware.
 */

export interface CreateLocaleMiddlewareOptions {
  locales: readonly string[];
  defaultLocale: string;
  /** Cookie name used to persist the user's last choice. Defaults to `NEXT_LOCALE`. */
  cookieName?: string;
}

export interface LocaleMiddlewareResult {
  /** The detected locale for this request. */
  locale: string;
  /** Pathname with the locale segment stripped (or `/` if it was just the locale). */
  basePath: string;
  /** True if the URL already has a locale prefix matching one of `locales`. */
  hasLocalePrefix: boolean;
}

/**
 * Detect the locale for a request from (in order): URL prefix, cookie, Accept-Language, default.
 * Framework-agnostic — returns the detected locale and a stripped basePath. Wire it into your
 * Next.js middleware to redirect or rewrite as you see fit.
 */
export function detectLocale(
  url: URL,
  headers: Headers,
  cookies: { get(name: string): { value: string } | undefined },
  opts: CreateLocaleMiddlewareOptions,
): LocaleMiddlewareResult {
  const { locales, defaultLocale, cookieName = 'NEXT_LOCALE' } = opts;
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first && locales.includes(first)) {
    return {
      locale: first,
      basePath: '/' + segments.slice(1).join('/'),
      hasLocalePrefix: true,
    };
  }
  const cookieLocale = cookies.get(cookieName)?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return { locale: cookieLocale, basePath: url.pathname, hasLocalePrefix: false };
  }
  const headerLocale = pickFromAcceptLanguage(headers.get('accept-language'), locales);
  if (headerLocale) {
    return { locale: headerLocale, basePath: url.pathname, hasLocalePrefix: false };
  }
  return { locale: defaultLocale, basePath: url.pathname, hasLocalePrefix: false };
}

function pickFromAcceptLanguage(header: string | null, locales: readonly string[]): string | null {
  if (!header) return null;
  const parts = header
    .split(',')
    .map((p) => {
      const [tag, qPart] = p.trim().split(';');
      const q = qPart?.startsWith('q=') ? parseFloat(qPart.slice(2)) : 1;
      return { tag: tag?.toLowerCase() ?? '', q: Number.isFinite(q) ? q : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    if (!tag) continue;
    const exact = locales.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    const base = tag.split('-')[0];
    if (!base) continue;
    const prefix = locales.find((l) => l.toLowerCase().split('-')[0] === base);
    if (prefix) return prefix;
  }
  return null;
}
