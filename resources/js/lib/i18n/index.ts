import en from './en';
import frPartial from './fr';
import dePartial from './de';
import nlPartial from './nl';
import swPartial from './sw';
import type { Translations } from './en';

export type Language = 'en' | 'fr' | 'de' | 'nl' | 'sw';

// Deep merge: other languages fall back to English for missing keys
function deepMerge(base: any, override: any): any {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      override[key] &&
      typeof override[key] === 'object' &&
      !Array.isArray(override[key]) &&
      base[key] &&
      typeof base[key] === 'object'
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

const fr: Translations = deepMerge(en, frPartial);
const de: Translations = deepMerge(en, dePartial);
const nl: Translations = deepMerge(en, nlPartial);
const sw: Translations = deepMerge(en, swPartial);

export const languages: Record<Language, Translations> = { en, fr, de, nl, sw };

export type { Translations };
export { en, fr, de, nl, sw };
