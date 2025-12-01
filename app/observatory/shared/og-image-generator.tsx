import { ImageResponse } from 'next/og';
import type { CSSProperties, ReactNode } from 'react';

export interface ObservatoryOgTheme {
  background: string;
  cardBackground: string;
  cardBorder: string;
  cardShadow: string;
  titleGradient: string;
  subtitleColor: string;
  glowTop: string;
  glowBottom: string;
}

export interface ObservatoryOgOptions {
  title: string | ReactNode;
  subtitle: string;
  theme: ObservatoryOgTheme;
  font?: 'Audiowide' | 'Cinzel' | 'Electrolize' | 'Marcellus' | 'Rye' | 'VT323';
}

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Font loading helper
async function loadGoogleFont(fontFamily: string) {
  // Construct Google Fonts URL
  // Note: We request the font file directly if possible, or parse CSS
  // For simplicity and reliability in Edge, we'll use a known CDN or fetch logic
  // Here we use a simple fetch to Google Fonts CSS API and extract the woff2/ttf url
  // However, parsing CSS in Edge can be tricky.
  // A more robust way for OGP is to fetch the font file directly from a stable URL if known,
  // or use the standard Next.js approach.

  // Since we want to support multiple fonts dynamically, let's try to fetch the CSS and parse the src.
  const cssUrl = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;700&display=swap`;
  const css = await fetch(cssUrl).then((res) => res.text());

  // Extract the font URL (ttf or woff2)
  // Google Fonts CSS usually returns woff2 for modern browsers, but ImageResponse might prefer ttf/otf.
  // We can try to force ttf by user agent if needed, but let's try standard first.
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff2)'\)/,
  );

  if (!resource) {
    console.warn(`Failed to parse font URL for ${fontFamily}`);
    return null;
  }

  const fontUrl = resource[1];
  const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
  return fontData;
}

// Common styles
const containerStyle: CSSProperties = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const cardBaseStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 80px',
  borderRadius: '24px',
  zIndex: 10,
  backdropFilter: 'blur(8px)',
};

const titleBaseStyle: CSSProperties = {
  fontSize: 72,
  fontWeight: 900,
  marginBottom: 16,
  letterSpacing: '-0.03em',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
  backgroundClip: 'text',
  color: 'transparent',
};

const subtitleBaseStyle: CSSProperties = {
  fontSize: 32,
  textAlign: 'center',
  fontWeight: 500,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const footerStyle: CSSProperties = {
  position: 'absolute',
  bottom: 40,
  fontSize: 20,
  color: '#94a3b8', // slate-400
  letterSpacing: '0.1em',
  zIndex: 10,
};

export async function generateObservatoryOgImage(
  options: ObservatoryOgOptions,
) {
  const { title, subtitle, theme, font = 'Audiowide' } = options;

  // Load font
  const fontData = await loadGoogleFont(font);

  // Deterministic stars
  const stars = Array.from({ length: 40 }).map((_, i) => {
    const left = `${(i * 17) % 100}%`;
    const top = `${(i * 23) % 100}%`;
    const size = (i % 3) + 2;
    const opacity = ((i % 5) + 3) / 10;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left,
          top,
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: 'white',
          opacity,
        }}
      />
    );
  });

  return new ImageResponse(
    (
      <div
        style={{
          ...containerStyle,
          backgroundColor: theme.background,
          backgroundImage: theme.background,
          fontFamily: fontData ? `"${font}"` : 'sans-serif',
        }}
      >
        {/* Background Glows */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '60%',
            height: '60%',
            background: theme.glowTop,
            filter: 'blur(40px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '60%',
            height: '60%',
            background: theme.glowBottom,
            filter: 'blur(40px)',
          }}
        />

        {stars}

        <div
          style={{
            ...cardBaseStyle,
            backgroundColor: theme.cardBackground,
            border: theme.cardBorder,
            boxShadow: theme.cardShadow,
          }}
        >
          <div
            style={{
              ...titleBaseStyle,
              backgroundImage: theme.titleGradient,
            }}
          >
            {title}
          </div>
          <div
            style={{
              ...subtitleBaseStyle,
              color: theme.subtitleColor,
            }}
          >
            {subtitle}
          </div>
        </div>
        <div style={footerStyle}>mugen-pp.vercel.app</div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [
            {
              name: font,
              data: fontData,
              style: 'normal',
              weight: 400,
            },
          ]
        : undefined,
    },
  );
}
