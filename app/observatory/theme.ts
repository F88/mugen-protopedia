/**
 * @fileoverview Observatory Top Page Theme Configuration
 *
 * For more details on the theme architecture, please refer to:
 * docs/observatory/observatory-architecture.md
 */
import type { ObservatoryThemeConfig } from './shared/theme.types';

/**
 * Observatory Top Page Theme Configuration
 *
 * Theme: "Universe", "Expanding Ideas", "Cosmic Journey"
 * Design: Space-themed, mysterious and inviting
 */

export const observatoryTheme = {
  // Color Palette
  colors: {
    // Light mode colors - Bright, welcoming universe
    light: {
      primary: 'rgb(59, 130, 246)', // Blue-500
      secondary: 'rgb(99, 102, 241)', // Indigo-500
      accent: 'rgb(139, 92, 246)', // Violet-500
      background: {
        start: 'rgb(219, 234, 254)', // Blue-100
        middle: 'rgb(224, 231, 255)', // Indigo-100
        end: 'rgb(237, 233, 254)', // Violet-100
      },
      text: {
        title: 'rgb(17, 24, 39)', // Gray-900
        body: 'rgb(75, 85, 99)', // Gray-600
      },
    },
    // Dark mode colors - Deep space atmosphere
    dark: {
      primary: 'rgb(96, 165, 250)', // Blue-400
      secondary: 'rgb(129, 140, 248)', // Indigo-400
      accent: 'rgb(167, 139, 250)', // Violet-400
      background: {
        start: 'rgba(30, 58, 138, 0.2)', // Blue-900/20
        middle: 'rgba(49, 46, 129, 0.2)', // Indigo-900/20
        end: 'rgba(76, 29, 149, 0.2)', // Violet-900/20
      },
      text: {
        title: 'rgb(255, 255, 255)', // White
        body: 'rgb(156, 163, 175)', // Gray-400
      },
    },
  },

  // Typography
  typography: {
    fontFamily: 'Audiowide', // Futuristic, tech-inspired font
  },

  // Open Graph Image Configuration
  ogImage: {
    font: 'Audiowide',
    theme: {
      background: 'linear-gradient(to bottom right, #020617, #172554, #1e1b4b)', // slate-950 -> blue-950 -> indigo-950
      cardBackground: 'rgba(2, 6, 23, 0.7)',
      cardBorder: '1px solid rgba(148, 163, 184, 0.2)',
      cardShadow: '0 0 40px rgba(56, 189, 248, 0.1)',
      titleGradient: 'linear-gradient(to bottom right, #ffffff, #94a3b8)',
      subtitleColor: '#cbd5e1',
      glowTop:
        'radial-gradient(circle, rgba(56, 189, 248, 0.15), transparent 70%)',
      glowBottom:
        'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
    },
  },

  // Card configurations (for ObservatoryCard component)
  cards: {
    helloWorld: {
      font: 'Marcellus',
      colorScheme: 'pink',
    },
    hallOfFame: {
      font: 'Cinzel',
      colorScheme: 'gold',
    },
    memorialPark: {
      font: 'Electrolize',
      colorScheme: 'gray',
    },
    sciFiLab: {
      font: 'VT323',
      colorScheme: 'cyber',
      titleSize: 'text-3xl',
      descriptionSize: 'text-2xl',
    },
    explorersGuild: {
      font: 'Rye',
      colorScheme: 'amber',
    },
  },

  // Card colors mapping (for ObservatoryCard component)
  cardColors: {
    gray: {
      gradient: 'from-gray-50 dark:from-gray-800/20',
      cardBg: 'bg-gray-200/70 dark:bg-gray-800/70',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconText: 'text-gray-600 dark:text-gray-300',
      hoverText: 'group-hover:text-gray-600 dark:group-hover:text-gray-400',
      linkText: 'text-gray-600 dark:text-gray-400',
      textColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    yellow: {
      gradient: 'from-yellow-50 dark:from-yellow-900/20',
      cardBg: 'bg-yellow-100/70 dark:bg-yellow-900/70',
      iconBg: 'bg-yellow-100 dark:bg-yellow-800',
      iconText: 'text-yellow-600 dark:text-yellow-300',
      hoverText: 'group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
      linkText: 'text-yellow-600 dark:text-yellow-400',
      textColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    pink: {
      gradient: 'from-pink-100 dark:from-pink-900/20',
      cardBg:
        'bg-gradient-to-br from-pink-200/80 via-rose-200/80 to-orange-200/80 dark:bg-gradient-to-br dark:from-pink-800/80 dark:via-rose-700/80 dark:to-orange-800/80',
      iconBg: 'bg-gradient-to-br from-pink-300 to-orange-400 dark:bg-pink-900',
      iconText: 'text-pink-700 dark:text-pink-300',
      hoverText: 'group-hover:text-pink-600 dark:group-hover:text-pink-400',
      linkText: 'text-pink-600 dark:text-pink-400',
      textColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-700 dark:text-pink-200',
    },
    purple: {
      gradient: 'from-purple-50 dark:from-purple-900/20',
      cardBg: 'bg-purple-200/70 dark:bg-purple-900/70',
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      iconText: 'text-purple-600 dark:text-purple-300',
      hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      linkText: 'text-purple-600 dark:text-purple-400',
      textColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    amber: {
      gradient: 'from-amber-50 dark:from-amber-900/20',
      cardBg: 'bg-amber-100/70 dark:bg-amber-900/70',
      iconBg: 'bg-amber-100 dark:bg-amber-900',
      iconText: 'text-amber-600 dark:text-amber-300',
      hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
      linkText: 'text-amber-600 dark:text-amber-400',
      textColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    gold: {
      gradient: 'from-yellow-100 dark:from-yellow-600/30',
      cardBg:
        'bg-gradient-to-br from-yellow-200/80 via-amber-200/80 to-yellow-300/80 dark:from-yellow-700/80 dark:via-amber-700/80 dark:to-yellow-600/80',
      iconBg:
        'bg-gradient-to-br from-yellow-300 to-amber-400 dark:from-yellow-500 dark:to-amber-600',
      iconText: 'text-yellow-900 dark:text-yellow-100',
      hoverText: 'group-hover:text-yellow-700 dark:group-hover:text-yellow-300',
      linkText: 'text-yellow-700 dark:text-yellow-300',
      textColor: 'text-gray-900 dark:text-white',
      descriptionColor: 'text-gray-600 dark:text-gray-400',
    },
    cyber: {
      gradient: 'from-green-500/20 dark:from-green-500/20',
      cardBg: 'bg-black/90 dark:bg-black/30',
      iconBg: 'bg-green-900/40 dark:bg-green-900/40',
      iconText: 'text-green-400 dark:text-green-400',
      hoverText: 'group-hover:text-gray-200 dark:group-hover:text-green-300',
      linkText: 'text-white dark:text-green-400',
      textColor: 'text-white dark:text-green-400',
      descriptionColor: 'text-gray-300 dark:text-green-500',
    },
  },

  // Animation settings for UniverseBackground
  animation: {
    starCount: 100,
    shootingStarInterval: 3000, // ms
    starTwinkleDuration: 2, // seconds
  },
} as const satisfies ObservatoryThemeConfig;

export type ObservatoryTheme = typeof observatoryTheme;
