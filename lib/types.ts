export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Verse {
  numberInSurah: number;
  text: string;
  translation: string;
}

export interface Reciter {
  id: string;
  name: string;
  subfolder: string;
}

export type ViewType = 'browse' | 'select' | 'studio';
