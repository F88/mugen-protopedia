/**
 * @fileoverview Open Graph Image generation for the Observatory page.
 */
import {
  generateObservatoryOgImage,
  size,
  contentType,
  type ObservatoryOgOptions,
} from './shared/og-image-generator';
import { observatoryTheme } from './theme';

export const runtime = 'edge';
export { size, contentType };
export const alt = 'ProtoPedia Observatory';

async function loadLogo() {
  const logoData = await fetch(
    new URL('../../assets/logos/960x240-black.png', import.meta.url),
  ).then((res) => res.arrayBuffer());
  return `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;
}

export default async function Image() {
  const logo = await loadLogo();

  return await generateObservatoryOgImage({
    title: 'The ProtoPedia Universe',
    subtitle: 'ProtoPedia Observatory',
    font: observatoryTheme.ogImage.font as ObservatoryOgOptions['font'],
    theme: observatoryTheme.ogImage.theme,
    logo,
  });
}
