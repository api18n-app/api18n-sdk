# @api18n/react

React + Next.js i18n runtime SDK for the [api18n](https://www.api18n.com)
translation manager. One init file, typed keys, ICU plurals, rich tag
interpolation.

## Install

```bash
npm install @api18n/react
# or
bun add @api18n/react
```

Pair it with `@api18n/cli` for pulling translations from the dashboard:

```bash
npm install --save-dev @api18n/cli
```

## Quick start

```ts
// src/api18n.ts
import { createApi18n } from '@api18n/react';
import en from './messages/en.json';
import ptBR from './messages/pt-BR.json';

export const api18n = createApi18n({
  resources: { en, 'pt-BR': ptBR },
  defaultLocale: 'en',
  fallbackLocale: 'en',
});
```

```tsx
// src/main.tsx  — or  app/layout.tsx
import './api18n';
import { App } from './App';
```

```tsx
import { useTranslations } from '@api18n/react';

export function Home() {
  const t = useTranslations();
  return <h1>{t('welcome', { name: 'Eduardo' })}</h1>;
}
```

No Provider in JSX. The init call registers a singleton; `useTranslations`
subscribes via `useSyncExternalStore`.

## Message format

Strings use [ICU MessageFormat](https://formatjs.io/docs/core-concepts/icu-syntax/):

```json
{
  "welcome": "Hello {name}",
  "cart": {
    "items": "{count, plural, one {# item} other {# items}}"
  },
  "balance": "{amount, number, ::currency/USD}",
  "placed": "Placed on {when, date, long}",
  "agreement": "By signing up you agree to our <link>terms of service</link>"
}
```

```tsx
t('cart.items', { count: 3 });           // → "3 items"
t('balance', { amount: 1234.5 });        // → "$1,234.50"
t('placed', { when: order.createdAt });  // → "Placed on March 15, 2026"
t('agreement', {
  link: (chunks) => <a href="/terms">{chunks}</a>,
});
```

## Locale switching

```tsx
import { useLocale, setLocale } from '@api18n/react';

function LocalePicker() {
  const locale = useLocale();
  return (
    <select value={locale} onChange={(e) => setLocale(e.target.value)}>
      <option value="en">English</option>
      <option value="pt-BR">Português</option>
    </select>
  );
}
```

`setLocale` is a plain function — call it from anywhere (event handlers,
route guards, even outside React).

## Next.js App Router

Server Components ship zero JS for translated strings — they render to plain
HTML.

```tsx
// app/[locale]/layout.tsx
import { setRequestLocale } from '@api18n/react/server';
import '../api18n';

export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <html lang={locale}><body>{children}</body></html>;
}
```

```tsx
// any Server Component
import { getTranslations } from '@api18n/react/server';

export default async function Page() {
  const t = await getTranslations();
  return <h1>{t('welcome', { name: 'Eduardo' })}</h1>;
}
```

Client Components import from `'api18n'` as usual.

## Type-safe keys

When `@api18n/cli` pulls translations, it also writes
`messages/messages.d.ts` augmenting the `Messages` interface. Once that file
is included in your `tsconfig.json`:

```tsx
t('button.cancl');                    // ❌ TS error: key doesn't exist
t('welcome');                         // ❌ TS error: missing arg `name`
t('welcome', { name: 'Eduardo' });    // ✅
```

## License

MIT
