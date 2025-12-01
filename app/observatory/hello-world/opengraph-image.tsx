/**
 * @fileoverview Open Graph Image generation for the Hello World page.
 */
import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '../shared/og-image-generator';
import { helloWorldTheme } from './theme';

export { size, contentType };
export const alt =
  'Hello World - ProtoPedia Observatory | The ProtoPedia Universe';

export default async function Image() {
  return await generateObservatoryOgImage({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span>🎉</span> Hello World
      </div>
    ),
    subtitle: 'ProtoPedia Observatory',
    font: helloWorldTheme.ogImage.font,
    theme: helloWorldTheme.ogImage.theme,
  });
}
