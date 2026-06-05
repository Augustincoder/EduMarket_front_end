// src/lib/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Base translations
import uz from '../locales/uz.json';
import ru from '../locales/ru.json';

const resources = {
  uz: { translation: uz },
  ru: { translation: ru }
};

// Check local storage for saved language or default to uz
const savedLanguage = localStorage.getItem('edu_lang') || 'uz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'uz',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
