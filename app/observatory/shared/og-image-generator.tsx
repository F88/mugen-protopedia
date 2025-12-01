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
}

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

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

export function generateObservatoryOgImage(options: ObservatoryOgOptions) {
  const { title, subtitle, theme } = options;

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
          background: theme.background,
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
    },
  );
}
