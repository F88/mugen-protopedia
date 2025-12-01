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

async function loadLogo() {
  const logoData = await fetch(
    new URL('../../../assets/logos/960x240-black.png', import.meta.url),
  ).then((res) => res.arrayBuffer());
  return `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;
}

export default async function Image() {
  const logo = await loadLogo();

  return await generateObservatoryOgImage({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <span>🎉</span> Hello World
      </div>
    ),
    subtitle: 'ProtoPedia Observatory',
    font: helloWorldTheme.ogImage.font,
    theme: helloWorldTheme.ogImage.theme,
    logo,
  });
}
