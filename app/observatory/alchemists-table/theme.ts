/**
 * @fileoverview The Alchemist's Table Theme Configuration
 *
 * For more details on the theme architecture, please refer to:
 * docs/observatory/observatory-architecture.md
 *
 * Concept notes:
 * docs/observatory/content/the-alchemists-table/the-alchemists-table.md
 */
import type { ObservatoryThemeConfig } from '../shared/theme.types';

/**
 * The Alchemist's Table Theme Configuration
 *
 * Theme: "Materials", "Combination", "Transmutation"
 * Design: a witch's-cauldron / mad-lab palette — red flames, a green brew, and
 * violet smoke. Distinct from Hello World (Impressionist) and Sci-Fi Lab
 * (cyberpunk).
 */
export const alchemistsTableTheme = {
  colors: {
    // Light mode - a bright apothecary
    light: {
      primary: 'rgb(124, 58, 237)', // Violet-600
      secondary: 'rgb(5, 150, 105)', // Emerald-600
      accent: 'rgb(220, 38, 38)', // Red-600
      background: {
        start: 'rgb(237, 233, 254)', // Violet-100
        middle: 'rgb(209, 250, 229)', // Emerald-100
        end: 'rgb(254, 226, 226)', // Red-100
      },
      text: {
        title: 'rgb(46, 16, 101)', // Violet-950
        subtitle: 'rgb(5, 150, 105)', // Emerald-600
        body: 'rgb(76, 29, 149)', // Violet-900
      },
    },
    // Dark mode - the cauldron chamber
    dark: {
      primary: 'rgb(167, 139, 250)', // Violet-400
      secondary: 'rgb(52, 211, 153)', // Emerald-400
      accent: 'rgb(248, 113, 113)', // Red-400
      background: {
        start: 'rgba(46, 16, 101, 0.85)', // Violet-950/85
        middle: 'rgba(59, 7, 100, 0.8)', // Purple-950/80
        end: 'rgba(6, 78, 59, 0.7)', // Emerald-950/70
      },
      text: {
        title: 'rgb(237, 233, 254)', // Violet-100
        subtitle: 'rgb(110, 231, 183)', // Emerald-300
        body: 'rgb(221, 214, 254)', // Violet-200
      },
    },
  },

  typography: {
    fontFamily: 'Cinzel', // Arcane, engraved
  },

  ogImage: {
    font: 'Cinzel',
    theme: {
      background: '#000',
      cardBackground: 'rgba(20, 10, 30, 0.7)',
      cardBorder: '1px solid rgba(167, 139, 250, 0.3)',
      cardShadow: '0 0 40px rgba(16, 185, 129, 0.15)',
      titleGradient: 'linear-gradient(to bottom right, #ffffff, #c4b5fd)',
      subtitleColor: '#34d399', // Emerald-400
      glowTop:
        'radial-gradient(circle, rgba(220, 38, 38, 0.18), transparent 70%)',
      glowBottom:
        'radial-gradient(circle, rgba(16, 185, 129, 0.15), transparent 70%)',
    },
  },
} as const satisfies ObservatoryThemeConfig;

export type AlchemistsTableTheme = typeof alchemistsTableTheme;
