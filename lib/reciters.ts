import { Reciter } from './types';

export const reciters: Reciter[] = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabicName: '\u0645\u0634\u0627\u0631\u064a \u0631\u0627\u0634\u062f \u0627\u0644\u0639\u0641\u0627\u0633\u064a', style: 'Murattal', source: 'islamic_network', identifier: 'ar.alafasy' },
  { id: 'abdulbasit', name: 'Abdul Basit Abdul Samad', arabicName: '\u0639\u0628\u062f \u0627\u0644\u0628\u0627\u0633\u0637 \u0639\u0628\u062f \u0627\u0644\u0635\u0645\u062f', style: 'Murattal', source: 'islamic_network', identifier: 'ar.abdulbasitmurattal' },
  { id: 'sudais', name: 'Abdur-Rahman As-Sudais', arabicName: '\u0639\u0628\u062f\u0627\u0644\u0631\u062d\u0645\u0646 \u0627\u0644\u0633\u062f\u064a\u0633', style: 'Murattal', source: 'islamic_network', identifier: 'ar.abdurrahmaansudais' },
  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', arabicName: '\u0645\u062d\u0645\u0648\u062f \u062e\u0644\u064a\u0644 \u0627\u0644\u062d\u0635\u0631\u064a', style: 'Murattal', source: 'islamic_network', identifier: 'ar.husary' },
  { id: 'minshawi', name: 'Muhammad Siddiq Al-Minshawi', arabicName: '\u0645\u062d\u0645\u062f \u0635\u062f\u064a\u0642 \u0627\u0644\u0645\u0646\u0634\u0627\u0648\u064a', style: 'Murattal', source: 'islamic_network', identifier: 'ar.minshawi' },
  { id: 'ayyoub', name: 'Muhammad Ayyoub', arabicName: '\u0645\u062d\u0645\u062f \u0623\u064a\u0648\u0628', style: 'Murattal', source: 'islamic_network', identifier: 'ar.muhammadayyoub' },
  { id: 'akhdar', name: 'Ibrahim Al-Akhdar', arabicName: '\u0625\u0628\u0631\u0627\u0647\u064a\u0645 \u0627\u0644\u0623\u062e\u0636\u0631', style: 'Murattal', source: 'islamic_network', identifier: 'ar.ibrahimakhdar' },
  { id: 'jibreel', name: 'Muhammad Jibreel', arabicName: '\u0645\u062d\u0645\u062f \u062c\u0628\u0631\u064a\u0644', style: 'Murattal', source: 'islamic_network', identifier: 'ar.muhammadjibreel' },
  { id: 'dosari', name: 'Yasser Al-Dosari', arabicName: '\u064a\u0627\u0633\u0631 \u0627\u0644\u062f\u0648\u0633\u0631\u064a', style: 'Murattal', source: 'everyayah', identifier: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', arabicName: '\u0633\u0639\u062f \u0627\u0644\u063a\u0627\u0645\u062f\u064a', style: 'Murattal', source: 'everyayah', identifier: 'Saad_Al_Ghamdi_128kbps' },
];

export function getAudioUrl(reciter: Reciter, surahNumber: number, ayahInSurah: number, globalAyahNumber: number): string {
  if (reciter.source === 'islamic_network') {
    return 'https://cdn.islamic.network/quran/audio/128/' + reciter.identifier + '/' + globalAyahNumber + '.mp3';
  }
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahInSurah).padStart(3, '0');
  return 'https://everyayah.com/data/' + reciter.identifier + '/' + s + a + '.mp3';
}
