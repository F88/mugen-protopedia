/**
 * @fileoverview Open Graph Image generation for the Hello World page.
 */
import {
  generateObservatoryOgImage,
  size,
  contentType,
  type ObservatoryOgOptions,
} from '../shared/og-image-generator';
import { helloWorldTheme } from './theme';

export const runtime = 'edge';
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
    subtitle: "The Latest Prototypes' Debut",
    font: helloWorldTheme.ogImage.font as ObservatoryOgOptions['font'],
    theme: helloWorldTheme.ogImage.theme,
  });
}
