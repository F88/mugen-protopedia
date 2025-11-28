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

  // Section themes mapping
  sections: {
    newborns: {
      theme: 'sky' as const,
      delay: 'delay-0',
    },
    gatewayDrug: {
      theme: 'lime' as const,
      delay: 'delay-100',
    },
    birthPulse: {
      theme: 'orange' as const,
      delay: 'delay-200',
    },
    afterglowRhythm: {
      theme: 'blue' as const,
      delay: 'delay-[210ms]',
    },
    eternalFlame: {
      theme: 'red' as const,
      delay: 'delay-300',
    },
    maternityHospital: {
      theme: 'blue' as const,
      delay: 'delay-[400ms]',
    },
    powerOfDeadlines: {
      theme: 'fuchsia' as const,
      delay: 'delay-[500ms]',
    },
    weekendWarrior: {
      theme: 'teal' as const, // Changed from slate to avoid duplication
      delay: 'delay-[600ms]',
    },
    laborOfLove: {
      theme: 'pink' as const,
      delay: 'delay-[700ms]',
    },
    earlyAdopters: {
      theme: 'slate' as const,
      delay: 'delay-[800ms]',
    },
    firstPenguin: {
      theme: 'cyan' as const,
      delay: 'delay-[900ms]',
    },
    starAlignment: {
      theme: 'space' as const,
      delay: 'delay-[1000ms]',
    },
    starAlignment2: {
      theme: 'space' as const,
      delay: 'delay-[1000ms]',
    },
    holyDay: {
      theme: 'amber' as const,
      delay: 'delay-[1100ms]',
    },
    anniversaryEffect: {
      theme: 'rose' as const,
      delay: 'delay-[1200ms]',
    },
    longTermEvolution: {
      theme: 'emerald' as const,
      delay: 'delay-[1300ms]',
    },
  },

  // Animation durations (in seconds)
  animation: {
    particleDuration: 8,
    fadeInDuration: 0.6,
    sectionFadeIn: 'duration-700',
  },
} as const;

export type HelloWorldTheme = typeof helloWorldTheme;
export type HelloWorldSectionKey = keyof typeof helloWorldTheme.sections;
