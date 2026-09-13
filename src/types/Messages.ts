/**
 * Augmentable map of translation keys → their raw message string + argument types.
 *
 * Users opt in by importing the auto-generated `messages.d.ts` from `api18n pull`,
 * which declares:
 *
 *   declare module '@api18n/react' {
 *     interface Messages {
 *       'hello': { __raw: 'Hello {name}'; name: string };
 *     }
 *   }
 *
 * Without augmentation, the interface is empty and `t()` falls back to a permissive
 * `(key: string, args?: Record<string, unknown>) => string | ReactNode[]` signature.
 */
export interface Messages {
  // Augmented by users via `messages.d.ts`.
}

export type TranslationKey = keyof Messages extends never ? string : keyof Messages & string;

type KnownTextTranslationKey = {
  [K in keyof Messages & string]: Messages[K] extends { __raw: string }
    ? K
    : never;
}[keyof Messages & string];

/** Keys whose generated base-locale value is a string message. */
export type TextTranslationKey = keyof Messages extends never
  ? string
  : KnownTextTranslationKey;

/**
 * Strip `__raw` (the message string used for codegen) and return only the runtime args.
 */
export type ArgsFor<K> = K extends keyof Messages
  ? Omit<Messages[K], '__raw'>
  : Record<string, unknown>;

/** The non-interpolated value returned by `t.raw(key)`. */
export type RawValueFor<K> = K extends keyof Messages
  ? Messages[K] extends { __raw: infer Raw }
    ? Raw extends string
      ? string
      : Raw
    : never
  : import('./TranslationValue.js').TranslationValue;
