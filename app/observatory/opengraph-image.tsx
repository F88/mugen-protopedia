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

export default async function Image() {
  return await generateObservatoryOgImage({
    title: 'ProtoPedia Observatory',
    subtitle: 'The ProtoPedia Universe',
    font: observatoryTheme.ogImage.font as ObservatoryOgOptions['font'],
    theme: observatoryTheme.ogImage.theme,
  });
}
