import { createContext, useContext, useState, ReactNode } from 'react';
import { fr } from '../i18n/fr';
import { en } from '../i18n/en';
import type { Translations } from '../i18n/fr';

type Language = 'fr' | 'en';

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLang: (l: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr', t: fr, setLang: () => {}, toggleLang: () => {}
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('lang') as Language) || 'fr';
  });

  const t = lang === 'fr' ? fr : en;

  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const toggleLang = () => setLang(lang === 'fr' ? 'en' : 'fr');

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
