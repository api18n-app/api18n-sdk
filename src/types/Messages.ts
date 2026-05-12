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

/**
 * Strip `__raw` (the message string used for codegen) and return only the runtime args.
 */
export type ArgsFor<K> = K extends keyof Messages
  ? Omit<Messages[K], '__raw'>
  : Record<string, unknown>;
