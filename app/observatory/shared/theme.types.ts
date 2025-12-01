/**
 * @fileoverview Observatory Theme Type Definitions
 *
 * This file defines the shared type definitions for the Observatory theme system.
 * It ensures consistency across different Observatory pages while allowing for
 * page-specific customizations.
 *
 * For more details on the theme architecture, please refer to:
 * docs/observatory/observatory-architecture.md
 */
import type { ObservatoryFont, ObservatoryOgTheme } from './og-image-generator';

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
  font: ObservatoryFont;
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
