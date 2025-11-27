/**
 * Hello World Theme Configuration
 *
 * Theme: "Beginning", "Birth of Light", "Vivid Moment"
 * Design: Bright Impressionist style, celebrating new creations
 */

export const helloWorldTheme = {
  // Color Palette
  colors: {
    // Light mode colors - Bright pastels inspired by Impressionist paintings
    light: {
      primary: 'rgb(236, 72, 153)', // Pink
      secondary: 'rgb(251, 146, 60)', // Orange
      accent: 'rgb(251, 191, 36)', // Amber
      background: {
        start: 'rgb(252, 231, 243)', // Pink-50
        middle: 'rgb(254, 215, 226)', // Rose-100
        end: 'rgb(254, 215, 170)', // Orange-100
      },
      icon: {
        background: 'rgb(219, 234, 254)', // Blue-100
        backgroundDark: 'rgba(30, 58, 138, 0.3)', // Blue-900/30
      },
      text: {
        title: 'rgb(31, 41, 55)', // Gray-800
        subtitle: 'rgb(59, 130, 246)', // Blue-500
        body: 'rgb(75, 85, 99)', // Gray-600
      },
    },
    // Dark mode colors - Warm, celebratory tones
    dark: {
      primary: 'rgb(219, 39, 119)', // Pink-600
      secondary: 'rgb(234, 88, 12)', // Orange-600
      accent: 'rgb(217, 119, 6)', // Amber-600
      background: {
        start: 'rgba(157, 23, 77, 0.8)', // Pink-800/80
        middle: 'rgba(190, 24, 93, 0.8)', // Rose-700/80
        end: 'rgba(194, 65, 12, 0.8)', // Orange-800/80
      },
      icon: {
        background: 'rgba(30, 58, 138, 0.3)', // Blue-900/30
        backgroundDark: 'rgba(30, 58, 138, 0.3)', // Blue-900/30
      },
      text: {
        title: 'rgb(255, 255, 255)', // White
        subtitle: 'rgb(147, 197, 253)', // Blue-300
        body: 'rgb(209, 213, 219)', // Gray-300
      },
    },
  },

  // Typography
  typography: {
    fontFamily: 'Marcellus', // Classical, divine font
  },

  // Animation durations (in seconds)
  animation: {
    particleDuration: 8,
    fadeInDuration: 0.6,
  },
} as const;

export type HelloWorldTheme = typeof helloWorldTheme;
