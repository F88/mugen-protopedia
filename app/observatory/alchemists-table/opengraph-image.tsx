/**
 * @fileoverview Open Graph Image generation for The Alchemist's Table page.
 */
import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '../shared/og-image-generator';
import { alchemistsTableTheme } from './theme';

export { size, contentType };
export const alt =
  "The Alchemist's Table - ProtoPedia Observatory | The ProtoPedia Universe";

export default async function Image() {
  return await generateObservatoryOgImage({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span>⚗️</span> The Alchemist&apos;s Table
      </div>
    ),
    subtitle: 'ProtoPedia Observatory',
    font: alchemistsTableTheme.ogImage.font,
    theme: alchemistsTableTheme.ogImage.theme,
  });
}
