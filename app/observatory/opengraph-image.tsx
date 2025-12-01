/**
 * @fileoverview Open Graph Image generation for the Observatory page.
 */
import {
  generateObservatoryOgImage,
  size,
  contentType,
} from './shared/og-image-generator';

export const runtime = 'edge';
export { size, contentType };
export const alt = 'ProtoPedia Observatory';

export default async function Image() {
  return await generateObservatoryOgImage({
    title: 'ProtoPedia Observatory',
    subtitle: 'The ProtoPedia Universe',
    font: 'Audiowide',
    theme: {
      background: 'linear-gradient(to bottom right, #020617, #172554, #1e1b4b)', // slate-950 -> blue-950 -> indigo-950
      cardBackground: 'rgba(2, 6, 23, 0.7)',
      cardBorder: '1px solid rgba(148, 163, 184, 0.2)',
      cardShadow: '0 0 40px rgba(56, 189, 248, 0.1)',
      titleGradient: 'linear-gradient(to bottom right, #ffffff, #94a3b8)',
      subtitleColor: '#cbd5e1',
      glowTop:
        'radial-gradient(circle, rgba(56, 189, 248, 0.15), transparent 70%)',
      glowBottom:
        'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
    },
  });
}
