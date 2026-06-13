// src/lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Check local storage for saved language or default to uz
const savedLanguage = localStorage.getItem('edu_lang') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources: {}, // Loaded dynamically
    lng: savedLanguage,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Dynamic loader for chunk splitting
const loadResource = async (lang) => {
  try {
    if (lang === 'uz') {
      const res = await import(/* webpackChunkName: "locales-uz" */ '../locales/uz.json');
      i18n.addResourceBundle(lang, 'translation', res.default || res, true, true);
    } else if (lang === 'ru') {
      const res = await import(/* webpackChunkName: "locales-ru" */ '../locales/ru.json');
      i18n.addResourceBundle(lang, 'translation', res.default || res, true, true);
    }
  } catch (err) {
    console.error('Failed to load locale:', err);
  }
};

// Initial load
loadResource(savedLanguage);

i18n.on('languageChanged', (lng) => {
  loadResource(lng);
  localStorage.setItem('edu_lang', lng);
});

export default i18n;
