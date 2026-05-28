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
];

export const photos: PhotoBackground[] = [
  { id: 'mosque1', name: 'Blue Mosque', type: 'photo', url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=150&q=60' },
  { id: 'stars', name: 'Starry Night', type: 'photo', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&q=60' },
  { id: 'desert', name: 'Desert Dunes', type: 'photo', url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=150&q=60' },
  { id: 'ocean', name: 'Ocean Sunset', type: 'photo', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&q=60' },
  { id: 'mountains', name: 'Mountains', type: 'photo', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=150&q=60' },
  { id: 'aurora', name: 'Aurora Borealis', type: 'photo', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=150&q=60' },
  { id: 'clouds', name: 'Above Clouds', type: 'photo', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=150&q=60' },
  { id: 'forest', name: 'Misty Forest', type: 'photo', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=150&q=60' },
  { id: 'galaxy', name: 'Galaxy', type: 'photo', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=150&q=60' },
  { id: 'lanterns', name: 'Lanterns', type: 'photo', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=150&q=60' },
  { id: 'lake', name: 'Mountain Lake', type: 'photo', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=150&q=60' },
  { id: 'sunset', name: 'Golden Sunset', type: 'photo', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1200&q=80', thumb: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=150&q=60' },
];

export const videoFormats: VideoFormat[] = [
  { id: 'landscape', label: '16:9', width: 1920, height: 1080, ratio: '16/9' },
  { id: 'portrait', label: '9:16', width: 1080, height: 1920, ratio: '9/16' },
  { id: 'square', label: '1:1', width: 1080, height: 1080, ratio: '1/1' },
  { id: 'social', label: '4:5', width: 1080, height: 1350, ratio: '4/5' },
];

export function getGradientCSS(bg: GradientBackground): string {
  return 'linear-gradient(135deg, ' + bg.colors.join(', ') + ')';
}
