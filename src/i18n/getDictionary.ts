

import es from './dictionaries/es.json';
import en from './dictionaries/en.json';
import pt from './dictionaries/pt.json';

const dictionaries = {
  es,
  en,
  pt,
};

export const getDictionary = async (locale: 'es' | 'en' | 'pt') => {
  return dictionaries[locale] || dictionaries.es;
};
