import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en.json';
import esTranslation from './es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { 
        translation: enTranslation 
      },
      es: { 
        translation: esTranslation 
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Remove ns and defaultNS since your translations are already structured
    returnObjects: true // Add this to properly handle nested objects and arrays
  });

export default i18n;
