import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '@/app/observatory/shared/og-image-generator';
import { truncateString } from '@/lib/utils';

export const runtime = 'edge';
export { size, contentType };
export const alt = 'Playlist Mode | 無限ProtoPedia';

export default async function Image({
  params,
}: {
  params: Promise<{ title: string; ids: string }>;
}) {
  const { title: rawTitleInit, ids: idsInit } = await params;
  let rawTitle = rawTitleInit;
  let ids = idsInit;
  try {
    rawTitle = decodeURIComponent(rawTitleInit);
    ids = decodeURIComponent(idsInit);
  } catch (e) {
    // It's better to log decoding errors for debugging purposes.
    console.error('Failed to decode playlist params', { error: e });
  }

  const count = ids.split(',').filter(Boolean).length;
  const title = truncateString(rawTitle, 40);
  const displayTitle = count > 0 ? `${title} (${count})` : title;

  console.debug('Raw title:', rawTitle);
  console.debug('Display title:', displayTitle);

  return await generateObservatoryOgImage({
    title: displayTitle,
    subtitle: 'Playlist',
    // font: 'Audiowide',
    // font: 'Electrolize',
    font: 'M_PLUS_1_Code',
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
