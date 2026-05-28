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

export interface GradientBackground {
  id: string;
  name: string;
  type: 'gradient';
  colors: string[];
}

export interface PhotoBackground {
  id: string;
  name: string;
  type: 'photo';
  url: string;
  thumb: string;
}

export type Background = GradientBackground | PhotoBackground;

export interface VideoFormat {
  id: string;
  label: string;
  width: number;
  height: number;
  ratio: string;
}

export type Theme = 'dark' | 'light' | 'emerald';
export type View = 'home' | 'browse' | 'verses' | 'studio' | 'feedback';
export type BgTab = 'gradients' | 'photos' | 'import';
