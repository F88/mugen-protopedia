/**
 * @fileoverview Open Graph Image generation for the Hello World page.
 *
 * Note:
 * This file uses inline styles (imported from .styles.ts) because Next.js `ImageResponse`
 * requires style objects and does not support standard CSS modules or global CSS.
 * Lint errors regarding "inline styles" are expected and valid in this context.
 */
import { ImageResponse } from 'next/og';
import {
  cardStyle,
  containerStyle,
  footerStyle,
  subtitleStyle,
  titleStyle,
} from './opengraph-image.styles';

export const runtime = 'edge';

export const alt =
  'Hello World - ProtoPedia Observatory | The ProtoPedia Universe';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={titleStyle}>
            <span>🎉</span> Hello World
          </div>
          <div style={subtitleStyle}>The Latest Prototypes&apos; Debut</div>
        </div>
        <div style={footerStyle}>mugen-pp.vercel.app</div>
      </div>
    ),
    {
      ...size,
    },
  );
}
