/**
 * @fileoverview Open Graph Image generation for the Hello World page.
 */
import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '../shared/og-image-generator';

export const runtime = 'edge';
export { size, contentType };
export const alt = 'Hello World - ProtoPedia Observatory | The ProtoPedia Universe';

export default async function Image() {
  return generateObservatoryOgImage({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span>🎉</span> Hello World
      </div>
    ),
    subtitle: "The Latest Prototypes' Debut",
    theme: {
      background: 'linear-gradient(to bottom right, #020617, #0c4a6e, #0f172a)', // slate-950 -> sky-900 -> slate-900
      cardBackground: 'rgba(2, 6, 23, 0.7)',
      cardBorder: '1px solid rgba(56, 189, 248, 0.3)',
      cardShadow: '0 0 40px rgba(56, 189, 248, 0.15)',
      titleGradient: 'linear-gradient(to bottom right, #ffffff, #94a3b8)',
      subtitleColor: '#38bdf8', // sky-400
      glowTop:
        'radial-gradient(circle, rgba(56, 189, 248, 0.2), transparent 70%)',
      glowBottom:
        'radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent 70%)',
    },
  });
}
