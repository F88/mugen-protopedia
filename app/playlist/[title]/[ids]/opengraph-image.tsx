import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '@/app/observatory/shared/og-image-generator';
import { truncateString } from '@/lib/utils';
import { logger } from '@/lib/logger.client';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export { size, contentType };
export const alt = 'Playlist Mode | 無限ProtoPedia';

async function loadLogo() {
  const logoData = await readFile(
    join(process.cwd(), 'assets/logos/960x240-black.png'),
  );
  return `data:image/png;base64,${logoData.toString('base64')}`;
}

export default async function Image({
  params,
}: {
  params: { title: string; ids: string };
}) {
  const logo = await loadLogo();
  let rawTitle: string;
  let ids: string;
  try {
    rawTitle = decodeURIComponent(params.title);
    ids = decodeURIComponent(params.ids);
  } catch (e) {
    rawTitle = params.title;
    ids = params.ids;
    // It's better to log decoding errors for debugging purposes.
    logger.error({ error: e }, 'Failed to decode playlist params');
  }

  const count = ids.split(',').filter(Boolean).length;
  const title = truncateString(rawTitle, 40);
  const displayTitle = count > 0 ? `${title} (${count})` : title;

  logger.debug({ rawTitle, displayTitle }, 'Playlist OGP image generation');

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
    logo,
  });
}
