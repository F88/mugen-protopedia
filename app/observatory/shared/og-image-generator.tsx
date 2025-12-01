/**
 * @fileoverview Open Graph Image generator for Observatory.
 *
 * Note on Inline Styles:
 * This file uses inline styles (style objects) extensively because next/og (Satori)
 * does not support external CSS files or standard CSS modules.
 * Styles must be provided as inline style objects to be correctly rendered into an image.
 * Linter warnings regarding "CSS inline styles" should be ignored in this context.
 */
import { ImageResponse } from 'next/og';
import React, { type ReactNode, type CSSProperties } from 'react';

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

export type ObservatoryFont =
  | 'Audiowide'
  | 'Cinzel'
  | 'Electrolize'
  | 'Marcellus'
  | 'Rye'
  | 'VT323'
  | 'M_PLUS_1_Code';

export interface ObservatoryOgOptions {
  title: string | ReactNode;
  subtitle: string;
  theme: ObservatoryOgTheme;
  font?: ObservatoryFont;
  logo?: string;
}

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// --- Helpers ---

async function loadGoogleFont(fontFamily: string) {
  const family = fontFamily.replace(/ /g, '+').replace(/_/g, '+');
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@400;700&display=swap`;
  const css = await fetch(cssUrl).then((res) => res.text());
  const resource = css.match(
    /src: url\((.+?)\) format\('(opentype|truetype|woff2)'\)/,
  );

  if (!resource) {
    console.warn(`Failed to parse font URL for ${fontFamily}`);
    return null;
  }

  const fontUrl = resource[1];
  return await fetch(fontUrl).then((res) => res.arrayBuffer());
}

async function loadLogo() {
  const logoData = await fetch(
    new URL('../../../assets/logos/960x240-black.png', import.meta.url),
  ).then((res) => res.arrayBuffer());
  return `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`;
}

// --- Components ---

// Simple Linear Congruential Generator for deterministic randomness
class Random {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next() {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

const Stars = () => {
  const rng = new Random(12419); // Fixed seed for consistent output

  return (
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1200,
        height: 630,
      }}
    >
      {Array.from({ length: 80 }).map((_, i) => {
        const leftVal = rng.next() * 100;
        const topVal = rng.next() * 100;

        const left = `${leftVal}%`;
        const top = `${topVal}%`;
        const size = rng.next() * 3 + 2; // 2px to 5px
        const opacity = rng.next() * 0.7 + 0.3; // 0.3 to 1.0

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
      })}
    </div>
  );
};

const BackgroundGlows = ({ theme }: { theme: ObservatoryOgTheme }) => (
  <>
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
  </>
);

const ContentCard = ({
  title,
  subtitle,
  theme,
}: {
  title: string | ReactNode;
  subtitle: string;
  theme: ObservatoryOgTheme;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '90%',
      padding: '40px 40px',
      borderRadius: '24px',
      // zIndex: 10,
      backdropFilter: 'blur(8px)',
      backgroundColor: theme.cardBackground,
      border: theme.cardBorder,
      boxShadow: theme.cardShadow,
    }}
  >
    <div
      style={{
        fontSize: 72,
        fontWeight: 900,
        marginBottom: 16,
        letterSpacing: '-0.03em',
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
        backgroundClip: 'text',
        color: 'transparent',
        backgroundImage: theme.titleGradient,
      }}
    >
      {title}
    </div>
    <div
      style={{
        fontSize: 32,
        textAlign: 'center',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: theme.subtitleColor,
      }}
    >
      {subtitle}
    </div>
  </div>
);

const Footer = ({ logo }: { logo: string }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 20,
      // width: '50%',
      // left: '25%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
      // zIndex: 10,
      // backgroundColor: '#888' /* temporary bg color to make logo visible */,
      padding: '12px 24px',
      borderRadius: '16px',
    }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={logo} height="120" alt="" />
  </div>
);

// --- Main Generator ---

export async function generateObservatoryOgImage(
  options: ObservatoryOgOptions,
) {
  const {
    title,
    subtitle,
    theme,
    font = 'Audiowide',
    logo: customLogo,
  } = options;

  const [fontData, logo] = await Promise.all([
    loadGoogleFont(font),
    customLogo ? Promise.resolve(customLogo) : loadLogo(),
  ]);

  const containerStyle: CSSProperties = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    background: theme.background,
    fontFamily: fontData ? `"${font}"` : 'sans-serif',
    paddingBottom: '120px',
    paddingLeft: '20px',
    paddingRight: '20px',
  };

  // Note: We use inline styles here because next/og requires them for image generation.
  // External CSS is not supported.
  return new ImageResponse(
    (
      <div style={containerStyle}>
        <BackgroundGlows theme={theme} />
        <Stars />
        <Footer logo={logo} />
        <ContentCard title={title} subtitle={subtitle} theme={theme} />
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
