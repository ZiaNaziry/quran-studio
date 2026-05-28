import { Background } from './types';

export const backgrounds: Background[] = [
  { id: 'midnight', name: 'Midnight Ocean', colors: ['#0f0c29', '#302b63', '#24243e'] },
  { id: 'royal', name: 'Royal Purple', colors: ['#6441A5', '#2a0845'] },
  { id: 'deep', name: 'Deep Space', colors: ['#000000', '#1a1a2e', '#16213e'] },
  { id: 'dusk', name: 'Warm Dusk', colors: ['#C33764', '#1D2671'] },
  { id: 'aurora', name: 'Northern Lights', colors: ['#0a5c36', '#185a9d'] },
  { id: 'ocean', name: 'Ocean Depth', colors: ['#0f3443', '#34e89e'] },
  { id: 'ember', name: 'Ember Glow', colors: ['#8B0000', '#FF4500', '#8B0000'] },
  { id: 'twilight', name: 'Twilight Sky', colors: ['#141E30', '#243B55'] },
  { id: 'forest', name: 'Enchanted Forest', colors: ['#0d3b2e', '#1a6b4a', '#0d3b2e'] },
  { id: 'cosmos', name: 'Cosmic Purple', colors: ['#1a0533', '#4a0e8f', '#1a0533'] },
];

export function getGradientCSS(bg: Background): string {
  return 'linear-gradient(135deg, ' + bg.colors.join(', ') + ')';
}
