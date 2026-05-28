export interface Reciter {
  id: string;
  name: string;
  arabicName: string;
  style: string;
  folder: string;
}

// ALL reciters use everyayah.com (has CORS headers for video recording)
export const reciters: Reciter[] = [
  { id: 'alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي', style: 'Murattal', folder: 'Alafasy_128kbps' },
  { id: 'basit', name: 'Abdul Basit Abdul Samad', arabicName: 'عبد الباسط عبد الصمد', style: 'Murattal', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'sudais', name: 'Abdur-Rahman As-Sudais', arabicName: 'عبدالرحمن السديس', style: 'Murattal', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'maher', name: 'Maher Al-Muaiqly', arabicName: 'ماهر المعيقلي', style: 'Murattal', folder: 'MaherAlMuaiqly128kbps' },
  { id: 'hani', name: 'Hani Ar-Rifai', arabicName: 'هاني الرفاعي', style: 'Murattal', folder: 'Hani_Rifai_192kbps' },
  { id: 'shatri', name: 'Abu Bakr Al-Shatri', arabicName: 'أبو بكر الشاطري', style: 'Murattal', folder: 'Abu_Bakr_Ash-Shaatree_128kbps' },
  { id: 'ghamdi', name: 'Saad Al-Ghamdi', arabicName: 'سعد الغامدي', style: 'Murattal', folder: 'Ghamadi_40kbps' },
  { id: 'akhdar', name: 'Ibrahim Al-Akhdar', arabicName: 'إبراهيم الأخضر', style: 'Murattal', folder: 'Ibrahim_Akhdar_32kbps' },
  { id: 'yasser', name: 'Yasser Al-Dosari', arabicName: 'ياسر الدوسري', style: 'Murattal', folder: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'ayyoub', name: 'Muhammad Ayyoub', arabicName: 'محمد أيوب', style: 'Murattal', folder: 'Muhammad_Ayyoub_128kbps' },
];

// ALL use everyayah.com — has CORS headers so fetch() works for video recording
export function getAudioUrl(reciter: Reciter, surahNumber: number, ayahNumber: number, _globalNumber: number): string {
  const s = String(surahNumber).padStart(3, '0');
  const a = String(ayahNumber).padStart(3, '0');
  return 'https://everyayah.com/data/' + reciter.folder + '/' + s + a + '.mp3';
}
