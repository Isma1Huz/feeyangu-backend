import React, { createContext, useContext, useState, useCallback } from 'react';
import { languages, type Language, type Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('feeyangu-lang');
    return (saved && saved in languages) ? saved as Language : 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('feeyangu-lang', lang);
  }, []);

  const t = languages[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const fallback: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: languages['en'],
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  return ctx ?? fallback;
};

export const useT = () => {
  const { t } = useLanguage();
  return t;
};
