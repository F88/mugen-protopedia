import type { ObservatoryOgTheme } from './og-image-generator';

export interface ThemeColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    start: string;
    middle: string;
    end: string;
  };
  text: {
    title: string;
    body: string;
    subtitle?: string;
  };
  icon?: {
    background: string;
    backgroundDark: string;
  };
}

export interface ThemeTypography {
  fontFamily: string;
}

export interface ThemeOgImage {
  font: string;
  theme: ObservatoryOgTheme;
}

export interface ObservatoryThemeConfig {
  colors: {
    light: ThemeColorPalette;
    dark: ThemeColorPalette;
  };
  typography: ThemeTypography;
  ogImage: ThemeOgImage;
  [key: string]: unknown;
}
