export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Verse {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
  surahNumber: number;
}

export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  source: 'islamic_network' | 'everyayah';
  identifier: string;
}

export interface Background {
  id: string;
  name: string;
  colors: string[];
}

export type Theme = 'dark' | 'light' | 'emerald';
export type View = 'home' | 'browse' | 'verses' | 'studio' | 'feedback';
