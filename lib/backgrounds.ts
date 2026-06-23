import { GradientBackground, PhotoBackground, VideoFormat } from './types';

export const gradients: GradientBackground[] = [
  { id: 'midnight', name: 'Midnight Ocean', type: 'gradient', colors: ['#0f0c29', '#302b63', '#24243e'] },
  { id: 'royal', name: 'Royal Purple', type: 'gradient', colors: ['#6441A5', '#2a0845'] },
  { id: 'deep', name: 'Deep Space', type: 'gradient', colors: ['#000000', '#1a1a2e', '#16213e'] },
  { id: 'dusk', name: 'Warm Dusk', type: 'gradient', colors: ['#C33764', '#1D2671'] },
  { id: 'aurora', name: 'Northern Lights', type: 'gradient', colors: ['#0a5c36', '#185a9d'] },
  { id: 'ocean', name: 'Ocean Depth', type: 'gradient', colors: ['#0f3443', '#34e89e'] },
  { id: 'ember', name: 'Ember Glow', type: 'gradient', colors: ['#8B0000', '#FF4500', '#8B0000'] },
  { id: 'twilight', name: 'Twilight Sky', type: 'gradient', colors: ['#141E30', '#243B55'] },
  { id: 'forest', name: 'Enchanted Forest', type: 'gradient', colors: ['#0d3b2e', '#1a6b4a', '#0d3b2e'] },
  { id: 'cosmos', name: 'Cosmic Purple', type: 'gradient', colors: ['#1a0533', '#4a0e8f', '#1a0533'] },
  { id: 'gold', name: 'Golden Hour', type: 'gradient', colors: ['#f12711', '#f5af19'] },
  { id: 'ice', name: 'Arctic Ice', type: 'gradient', colors: ['#74ebd5', '#ACB6E5'] },
];

export const photos: PhotoBackground[] = [
  // Mosques
  { id: 'mosque1', name: 'Blue Mosque', type: 'photo', category: 'mosque', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=200&q=60' },
  { id: 'mosque2', name: 'Grand Mosque', type: 'photo', category: 'mosque', url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=200&q=60' },
  { id: 'mosque3', name: 'Mosque Interior', type: 'photo', category: 'mosque', url: 'https://images.unsplash.com/photo-1545167496-28be8ac70a00?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1545167496-28be8ac70a00?w=200&q=60' },
  { id: 'mosque4', name: 'Mosque Dome', type: 'photo', category: 'mosque', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=200&q=60' },
  { id: 'mosque5', name: 'Mosque Night', type: 'photo', category: 'mosque', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=200&q=60' },
  // Nature
  { id: 'desert', name: 'Desert Dunes', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=200&q=60' },
  { id: 'ocean1', name: 'Ocean Sunset', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=60' },
  { id: 'mountains', name: 'Snow Mountains', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60' },
  { id: 'forest', name: 'Misty Forest', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60' },
  { id: 'lake', name: 'Mountain Lake', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=200&q=60' },
  { id: 'waterfall', name: 'Waterfall', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b21?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1432405972618-c6b0cfba8b21?w=200&q=60' },
  { id: 'tulips', name: 'Flower Field', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=200&q=60' },
  // Sky & Space
  { id: 'stars', name: 'Starry Night', type: 'photo', category: 'sky', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=60' },
  { id: 'aurora', name: 'Aurora Borealis', type: 'photo', category: 'sky', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=200&q=60' },
  { id: 'galaxy', name: 'Galaxy', type: 'photo', category: 'sky', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=200&q=60' },
  { id: 'clouds', name: 'Above Clouds', type: 'photo', category: 'sky', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=200&q=60' },
  { id: 'sunset1', name: 'Golden Sunset', type: 'photo', category: 'sky', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=200&q=60' },
  { id: 'milkyway', name: 'Milky Way', type: 'photo', category: 'sky', url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=200&q=60' },
  // Abstract & Dark
  { id: 'dark1', name: 'Dark Texture', type: 'photo', category: 'abstract', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=200&q=60' },
  { id: 'bokeh', name: 'Golden Bokeh', type: 'photo', category: 'abstract', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&q=60' },
  { id: 'marble', name: 'Dark Marble', type: 'photo', category: 'abstract', url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=200&q=60' },
  { id: 'smoke', name: 'Blue Smoke', type: 'photo', category: 'abstract', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=60' },
  { id: 'waves', name: 'Wave Pattern', type: 'photo', category: 'abstract', url: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=200&q=60' },
  // Architecture & Patterns
  { id: 'arch1', name: 'Islamic Pattern', type: 'photo', category: 'pattern', url: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4b3?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1585129777188-94600bc7b4b3?w=200&q=60' },
  { id: 'arch2', name: 'Archway', type: 'photo', category: 'pattern', url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?w=200&q=60' },
  { id: 'arch3', name: 'Geometric Tiles', type: 'photo', category: 'pattern', url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=200&q=60' },
  { id: 'callig', name: 'Calligraphy Wall', type: 'photo', category: 'pattern', url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=200&q=60' },
  // More Nature
  { id: 'rain', name: 'Rainy Window', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&q=60' },
  { id: 'cherry', name: 'Cherry Blossoms', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=200&q=60' },
  { id: 'snow', name: 'Snowy Path', type: 'photo', category: 'nature', url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=200&q=60' },
];

export const photoCategories = ['all', 'mosque', 'nature', 'sky', 'abstract', 'pattern'] as const;
export type PhotoCategory = typeof photoCategories[number];

export const videoFormats: VideoFormat[] = [
  { id: 'landscape', label: '16:9', width: 1920, height: 1080, ratio: '16/9' },
  { id: 'portrait', label: '9:16', width: 1080, height: 1920, ratio: '9/16' },
  { id: 'square', label: '1:1', width: 1080, height: 1080, ratio: '1/1' },
  { id: 'social', label: '4:5', width: 1080, height: 1350, ratio: '4/5' },
  { id: 'cinematic', label: 'Cinema', width: 1920, height: 1080, ratio: '16/9', frame: { innerRatio: 16/9, padding: 0.04, radius: 36 } },
  { id: 'framed', label: 'Frame', width: 1080, height: 1920, ratio: '9/16', frame: { innerRatio: 3/4, padding: 0.04, radius: 36 } },
];

export function getGradientCSS(bg: GradientBackground): string {
  return 'linear-gradient(135deg, ' + bg.colors.join(', ') + ')';
}
