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

To create an OGP image for a new Observatory page, create an `opengraph-image.tsx` file in your page directory. Import the shared generator and your page's theme configuration.

```tsx
import {
    generateObservatoryOgImage,
    size,
    contentType,
    type ObservatoryOgOptions,
} from '../shared/og-image-generator'; // Adjust path as needed
import { pageTheme } from './theme';

export const runtime = 'edge';
export { size, contentType };
export const alt = 'Page Title - ProtoPedia Observatory';

export default async function Image() {
    return generateObservatoryOgImage({
        title: 'Page Title',
        subtitle: 'Page Subtitle',
        // Use configuration from theme.ts
        font: pageTheme.ogImage.font as ObservatoryOgOptions['font'],
        theme: pageTheme.ogImage.theme,
    });
}
```

## Theme Guidelines

Theme configurations are defined in `theme.ts` using the `ObservatoryThemeConfig` type. This ensures that OGP settings are consistent with the page design.

1. **Define in `theme.ts`**: Add an `ogImage` property to your theme object.
2. **Background**: Use a dark, deep gradient that fits the "Universe" concept.
3. **Legibility**: Ensure the title and subtitle are legible against the background.

## Adding New Pages

When adding a new page to the Observatory (e.g., `app/observatory/page-a/page.tsx`):

1. Define the `ogImage` configuration in `app/observatory/page-a/theme.ts`.
2. Copy the `opengraph-image.tsx` from an existing page (e.g., `hello-world`).
3. Update the imports to point to your new `theme.ts`.
4. Update the `alt`, `title`, and `subtitle`.
