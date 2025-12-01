# Observatory OGP Guidelines

This document outlines the guidelines and technical specifications for Open Graph Protocol (OGP) images within the ProtoPedia Observatory section.

## Overview

Observatory pages use a unified visual theme for OGP images to maintain brand consistency while allowing for page-specific customization. We use a shared generator to ensure all images follow the same layout and design principles.

## Shared Generator

The OGP image generation logic is centralized in `app/observatory/shared/og-image-generator.tsx`. This utility provides a consistent layout with:

- **Universe Background:** A deep space gradient with deterministic star placement.
- **Glassmorphism Card:** A central card with blur effect to hold the title and subtitle.
- **Typography:** Consistent font sizes and weights for titles and subtitles.
- **Branding:** A footer with the application URL.

### Usage

To create an OGP image for a new Observatory page, create an `opengraph-image.tsx` file in your page directory and use the `generateObservatoryOgImage` function.

```tsx
import {
  generateObservatoryOgImage,
  size,
  contentType,
} from '../shared/og-image-generator'; // Adjust path as needed

export const runtime = 'edge';
export { size, contentType };
export const alt = 'Page Title - ProtoPedia Observatory';

export default async function Image() {
  return generateObservatoryOgImage({
    title: 'Page Title',
    subtitle: 'Page Subtitle',
    theme: {
      // Background gradient (CSS)
      background: 'linear-gradient(...)',

      // Card styles
      cardBackground: 'rgba(...)',
      cardBorder: '1px solid ...',
      cardShadow: '0 0 40px ...',

      // Text styles
      titleGradient: 'linear-gradient(...)',
      subtitleColor: '#...',

      // Ambient glows (CSS gradients)
      glowTop: 'radial-gradient(...)',
      glowBottom: 'radial-gradient(...)',
    },
  });
}
```

## Theme Guidelines

When defining a theme for a new page, follow these guidelines:

1. **Background:** Use a dark, deep gradient that fits the "Universe" concept. Start with a very dark color (e.g., slate-950) and blend into a theme color.
2. **Legibility:** Ensure the title and subtitle are legible against the background. The card background should be semi-transparent with a blur effect.
3. **Consistency:** Use the standard `size` and `contentType` exported from the generator.

## Adding New Pages

When adding a new page to the Observatory (e.g., `app/observatory/page-a/page.tsx`):

1. Copy the `opengraph-image.tsx` from an existing page (e.g., `hello-world`).
2. Update the `alt` text.
3. Update the `title` and `subtitle` passed to `generateObservatoryOgImage`.
4. Customize the `theme` object to match the visual identity of the new page.
