'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ptBR from '@/locales/pt-BR.json';
import en from '@/locales/en.json';

// ============================================
// TYPES
// ============================================
export type Locale = 'pt-BR' | 'en';

type TranslationValue = string | Record<string, string | Record<string, string>>;
type Translations = Record<string, Record<string, TranslationValue>>;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

// ============================================
// TRANSLATIONS MAP
// ============================================
const translations: Record<Locale, Translations> = {
  'pt-BR': ptBR as unknown as Translations,
  en: en as unknown as Translations,
};

export const localeNames: Record<Locale, string> = {
  'pt-BR': 'Português (BR)',
  en: 'English',
};

// ============================================
// CONTEXT
// ============================================
const I18nContext = createContext<I18nContextType | null>(null);

// ============================================
// PROVIDER
// ============================================
interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({ children, defaultLocale = 'pt-BR' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Load saved locale on mount
  useEffect(() => {
    const saved = localStorage.getItem('mysandbox-locale') as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('mysandbox-locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // Translation function with dot notation and parameter interpolation
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const parts = key.split('.');
      let value: unknown = translations[locale];

      for (const part of parts) {
        if (value && typeof value === 'object' && part in (value as Record<string, unknown>)) {
          value = (value as Record<string, unknown>)[part];
        } else {
          // Fallback to English
          value = translations['en'];
          for (const fallbackPart of parts) {
            if (value && typeof value === 'object' && fallbackPart in (value as Record<string, unknown>)) {
              value = (value as Record<string, unknown>)[fallbackPart];
            } else {
              return key; // Return key if not found in any locale
            }
          }
          break;
        }
      }

      if (typeof value !== 'string') return key;

      // Replace parameters: {name} → value
      if (params) {
        let result = value;
        for (const [k, v] of Object.entries(params)) {
          result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
        return result;
      }

      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================
export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}

// ============================================
// LANGUAGE SWITCHER COMPONENT
// ============================================
interface LanguageSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function LanguageSwitcher({ className = '', compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  if (compact) {
    return (
      <button
        onClick={() => setLocale(locale === 'pt-BR' ? 'en' : 'pt-BR')}
        className={`text-sm text-gray-400 hover:text-white transition-colors ${className}`}
        title={localeNames[locale === 'pt-BR' ? 'en' : 'pt-BR']}
      >
        {locale === 'pt-BR' ? '🇺🇸 EN' : '🇧🇷 PT'}
      </button>
    );
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      {(Object.keys(localeNames) as Locale[]).map((loc) => (
        <button
          key={loc}
          onClick={() => setLocale(loc)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            locale === loc
              ? 'bg-green-500/20 text-green-400 font-medium'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {loc === 'pt-BR' ? '🇧🇷' : '🇺🇸'} {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
