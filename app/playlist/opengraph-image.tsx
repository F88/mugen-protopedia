import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '../observatory/shared/og-image-generator';

export { size, contentType };
export const alt = 'Playlist Mode - 無限ProtoPedia';

export default async function Image() {
  return await generateObservatoryOgImage({
    title: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <span>▶️</span> Playlist Mode
      </div>
    ),
    subtitle: 'Playlist',
    font: 'Audiowide',
    theme: {
      background: '#000',
      cardBackground: 'rgba(10, 10, 10, 0.8)',
      cardBorder: '1px solid rgba(74, 222, 128, 0.3)', // Green-400
      cardShadow: '0 0 40px rgba(74, 222, 128, 0.15)',
      titleGradient: 'linear-gradient(to bottom right, #ffffff, #86efac)', // White to Green-300
      subtitleColor: '#4ade80', // Green-400
      glowTop:
        'radial-gradient(circle, rgba(74, 222, 128, 0.2), transparent 70%)',
      glowBottom:
        'radial-gradient(circle, rgba(34, 197, 94, 0.15), transparent 70%)',
    },
  });
}
