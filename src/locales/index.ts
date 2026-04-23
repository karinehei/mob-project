import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fi from './fi.json';
import en from './en.json';

const resources = {
  fi: { translation: fi },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'fi', // DEFAULT LANGUAGE.
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
