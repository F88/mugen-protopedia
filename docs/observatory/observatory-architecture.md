---
lang: en
title: Observatory Architecture Guide
related:
    - docs/*
instructions-for-ais:
    - This document should be written in English for AI readability.
    - Content within code fences may be written in languages other than English.
    - Prohibit updating this front-matter.
    - Prohibit updating title line (1st line) in this document.
---

# Observatory Architecture Guide

## Overview

Observatory is a distinct subsystem within mugen-protopedia that provides analytical insights into the ProtoPedia universe. Unlike the main application (`/`) and playlist feature (`/playlist`), Observatory has its own design philosophy, implementation patterns, and structural conventions.

## Design Philosophy

### Visual Identity

- **Theme**: Space/Universe metaphor - Stars, cosmic journey, expanding ideas
- **Color Palette**: Each page has its own theme while sharing common dark mode (deep space with stars)
- **Typography**: Custom fonts per page (e.g., Marcellus for Hello World, Audiowide for Observatory top)
- **Animations**: Sophisticated background animations (stars, shooting stars, page-specific effects)

### User Experience

- **Immersive**: Full-page backgrounds, thematic sections, narrative storytelling
- **Educational**: Each section includes explanations, narratives, and data visualizations
- **Celebratory**: Focus on highlighting achievements, patterns, and community contributions

## Directory Structure

```
app/observatory/
├── page.tsx                    # Observatory landing page
├── layout.tsx                  # Observatory-wide layout wrapper
├── background.tsx              # Background component (light/dark mode switcher)
├── theme.ts                    # Observatory top page theme configuration
├── opengraph-image.tsx         # OG image generator
├── opengraph-image.styles.ts   # OG image styling
├── shared/                     # Shared resources across Observatory pages
│   ├── fonts.ts                # Font definitions (Audiowide, Marcellus, Cinzel, etc.)
│   ├── icons.tsx               # Custom icon components
│   ├── universe-background-main-dark.tsx  # Reusable dark mode background
│   └── ...
└── hello-world/                # Example sub-page
    ├── page.tsx                # Hello World main page
    ├── background.tsx          # Page-specific background (with custom light mode)
    ├── theme.ts                # Hello World theme configuration
    ├── opengraph-image.tsx
    ├── opengraph-image.styles.ts
    └── components/             # Page-specific components
        ├── observatory-section.tsx  # Shared section wrapper
        ├── newborns-section.tsx
        ├── makers-rhythm-section.tsx
        └── ...
```

## Implementation Patterns

### 1. Theme System

Each Observatory page has its own `theme.ts` file with centralized configuration. We use a shared type definition `ObservatoryThemeConfig` to ensure consistency across all themes while allowing for page-specific extensions.

**Type Definition (`app/observatory/shared/theme.types.ts`):**

Defines the required structure for all themes, including color palettes, typography, and OGP settings.

**Theme Implementation (`app/observatory/[page]/theme.ts`):**

We use the `satisfies` operator to enforce the `ObservatoryThemeConfig` contract while preserving the specific literal types of the theme object (e.g., specific section keys or animation settings).

```typescript
import type { ObservatoryThemeConfig } from '../shared/theme.types';

export const pageTheme = {
    colors: {
        light: {/* ... */},
        dark: {/* ... */},
    },
    typography: {
        fontFamily: 'FontName',
    },
    // OGP Configuration (Required)
    ogImage: {
        font: 'FontName',
        theme: {/* ... */},
    },
    // Page-specific sections (Preserved by 'satisfies')
    sections: {
        sectionName: {
            theme: 'colorScheme',
            delay: 'delay-100',
        },
    },
    // Page-specific animation settings
    animation: {/* ... */},
} as const satisfies ObservatoryThemeConfig;

// Export specific types inferred from the implementation
export type PageTheme = typeof pageTheme;
export type PageSectionKey = keyof typeof pageTheme.sections;
```

**Benefits:**

- **Type Safety**: Ensures all themes have the required properties (colors, OGP, etc.).
- **Precise Inference**: `satisfies` allows TypeScript to infer the exact shape of `sections` and `animation`, enabling strict typing for section keys.
- **Single Source of Truth**: OGP and page styles share the same configuration.

### 2. Background Components

Observatory uses a two-layer background system:

**Pattern A: Shared Dark Mode + Custom Light Mode**

```typescript
// app/observatory/[page]/background.tsx
export function PageBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Dark Mode: Shared universe background */}
      <div className="dark:opacity-100 opacity-0 transition-opacity duration-700">
        <UniverseBackgroundMainDark />
      </div>

      {/* Light Mode: Page-specific gradient */}
      <div className="absolute inset-0 ... dark:opacity-0 opacity-100 ...">
        {/* Custom light mode design */}
      </div>
    </div>
  );
}
```

**Shared Dark Mode:** `app/observatory/shared/universe-background-main-dark.tsx`

- Deep space background (#020205)
- 70 animated stars with pulse effect
- Shooting stars (generated every 1s with 20% probability)
- Reusable across all Observatory pages

### 3. Section Components

Observatory pages use a consistent section pattern:

```typescript
// ObservatorySection wrapper provides:
// - 12 predefined color themes (sky, orange, red, lime, slate, cyan, purple, rose, pink, blue, amber, teal)
// - Consistent layout (icon, title, description, visual, content, narrative)
// - Background decoration and border styling
// - Animation delays for staggered entrance

<ObservatorySection
  theme={pageTheme.sections.sectionName.theme}
  icon={<IconComponent />}
  title="Section Title"
  description="Section description"
  sourceNote={<>Data source notes</>}
  visualContent={<VisualComponent />}
  narrative={{
    title: <>Narrative title</>,
    content: <>Narrative content</>,
  }}
  delay={pageTheme.sections.sectionName.delay}
>
  {/* Section content */}
</ObservatorySection>
```

### 4. Shared Resources

**Fonts** (`app/observatory/shared/fonts.ts`)

- Centralized font loading using next/font/google
- Exported as both individual fonts and mapped object
- Used across all Observatory pages

**Icons** (`app/observatory/shared/icons.tsx`)

- Custom SVG icon components
- Consistent sizing and styling
- Semantic naming (IconSparkles, IconFlame, IconHeart, etc.)

### 5. Header Pattern

Observatory uses a flexible header component:

```typescript
<ObservatoryHeader colorScheme="blue" />
```

- Supports multiple color schemes (blue, pink, gold, green, gray, amber, cyber)
- Fixed positioning with backdrop blur
- Uses `<div role="banner">` instead of `<header>` for SEO flexibility
- Consistent across Observatory pages but customizable per page

### 6. Observatory Top Page Cards (`ObservatoryCard`)

The Observatory landing page (`app/observatory/page.tsx`) is a grid of
`ObservatoryCard` components (`app/observatory/_components/observatory-card.tsx`).
Each card is configured via the `cards` and `cardColors` sections of
`app/observatory/theme.ts`.

**Link behavior (driven by `href`):**

- **Internal route**: a typed `next/link` `Route` (e.g. `/observatory/hello-world`).
- **External URL**: an absolute `http(s)://` URL. The card renders as an
  `<a target="_blank" rel="noopener noreferrer">` and shows a Lucide
  `ExternalLink` icon next to the title (with an accessible label). Use this for
  linking out to related sites; external cards do not have their own page or OG
  image.
- **Coming soon**: omit `href` to render a disabled, dashed "Coming soon..."
  card.

**Key props:**

- `color`: a key of `cardColors` (`gray`, `yellow`, `pink`, `purple`, `amber`,
  `gold`, `cyber`, `newspaper`).
- `className`: applied to the whole card body — typically the card font from
  `observatoryFonts[cards.<key>.font].className`.
- `titleClassName`: applied to the title (`<h2>`) only — use for a title-only
  font (e.g. `cards.<key>.titleFont`) that differs from the body font.
- `description`: a `string` (auto-wrapped in `<p>`) or any `ReactNode` for rich
  content such as lists.
- `backgroundImage`: optional URL rendered as a subtle low-opacity layer behind
  the card content.
- `titleSize` / `descriptionSize`: Tailwind text-size overrides.

**Color schemes:** add new schemes to `cardColors` in `theme.ts`. Each scheme
defines `gradient`, `cardBg`, `iconBg`, `iconText`, `hoverText`, `linkText`,
`textColor`, and `descriptionColor` (with light/dark variants). The `hoverText`
color must differ from `textColor`, or the hover state has no visible effect.

### 7. Analysis Data Ownership & the Analysis Repository

Observatory pages are data-heavy: each renders analysis computed from the full
prototype dataset (up to ~10k). To keep the main app home page (`/`) fast, that
analysis work is deliberately partitioned by **who renders it**, and accessed
through the **Analysis Repository** (`lib/repositories/analysis-repository.ts`,
a sibling of `promidas-repository.ts`).

**Ownership rule (do not break this):**

- The **base/home analysis** (`buildAnalysisOverview` via the repository's
  `getAnalysisOverview`, cached in `lib/stores/analysis-cache.ts`; `getAnalysisOverview`
  is a thin action wrapper) is owned by and scoped to the home page `/`. It must
  contain only the metrics the home dashboard renders
  (Newborns/Birthdays candidates, basic counts, Prototype Status, Maker's Rhythm,
  and — pending review — Community Trends). **Do not add Observatory-specific
  fields to it**; doing so makes every main-page-only visitor pay to compute data
  they never see.
- Each **Observatory page builds its own analysis on demand** through an
  `app/actions/observatory/<page>-analysis.ts` action that delegates to a builder
  in `lib/observatory/` (or, going forward, to an `AnalysisRepository` method).
  It shares only the raw dataset via `getAllPrototypes()` (the expensive fetch is
  already cached) and must **not** read `getAnalysisOverview` or extend
  `AnalysisOverview`.
- **Reuse is fine when rational.** Data genuinely shared across surfaces should
  live as a single repository accessor (owned by the repo, not a page), so the
  first caller computes it and the rest reuse it — no page bears another page's
  cost, and there is no page-to-page dependency.

**Pattern to follow:** each Observatory action (`app/actions/observatory/*-analysis.ts`)
is a thin wrapper over an `AnalysisRepository` method. The Alchemist's Table
(`material-analysis.ts` / `elemental-chronicles-analysis.ts` /
`circle-of-masters-analysis.ts` → `analysisRepository.get*()` →
`build-material-insights.ts` / `build-chronicles-insights.ts` /
`build-circle-insights.ts` / `build-user-insights.ts`) and Hello World
(`hello-world-analysis.ts` → `analysisRepository.getHelloWorldAnalysis()` →
`build-hello-world-insights.ts`) both follow this. Independent builders duplicate
CPU but not the fetch — an acceptable trade that is strongly preferred over
coupling the home render path. Optional background pre-generation after `/`
renders is allowed, but must never run on the home render path. See also the
`create-observatory-page` skill.

> Note: the Analysis Repository owns every analysis surface — the home page
> (`getAnalysisOverview`), Hello World, and The Alchemist's Table. The `app/actions/*`
> functions are thin wrappers that delegate to it, so all analysis-data access is
> uniform.

## Key Differences from Main App

| Aspect               | Main App (`/`)                              | Observatory (`/observatory`)                       |
| -------------------- | ------------------------------------------- | -------------------------------------------------- |
| **Design**           | Clean, minimal, content-focused             | Immersive, thematic, visually rich                 |
| **Layout**           | Standard page layout                        | Full-page backgrounds, custom sections             |
| **Typography**       | System fonts, consistent across app         | Custom fonts per page (Marcellus, Audiowide, etc.) |
| **Components**       | Reusable UI components (Button, Card, etc.) | Page-specific analytical sections                  |
| **Data**             | Prototype listings, playlists               | Statistical analysis, insights, narratives         |
| **Navigation**       | Standard routing                            | Thematic page transitions                          |
| **Background**       | Solid colors or simple gradients            | Animated space backgrounds, page-specific themes   |
| **State Management** | Client-side interactivity                   | Server-side data analysis, minimal client state    |

## Best Practices

### When Creating a New Observatory Page

1. **Create directory structure:**

    ```
    app/observatory/[page-name]/
    ├── page.tsx
    ├── background.tsx
    ├── theme.ts
    └── components/
    ```

2. **Define theme in `theme.ts`:**
    - Color palettes (light/dark)
    - Typography
    - Section mappings (theme + delay)
    - Animation settings

3. **Create custom background:**
    - Reuse `UniverseBackgroundMainDark` for dark mode
    - Design unique light mode background matching page theme

4. **Build sections using `ObservatorySection`:**
    - Map sections in theme.ts
    - Use consistent icon, title, description pattern
    - Include narratives for storytelling

5. **Add to Observatory top page:**
    - Create `ObservatoryCard` in `app/observatory/page.tsx`
    - Configure in `app/observatory/theme.ts` cards section
    - Use appropriate font and color scheme
    - Cards can also link to external sites (absolute URL) — see
      [Observatory Top Page Cards](#6-observatory-top-page-cards-observatorycard)

### Naming Conventions

- **Components**: PascalCase with descriptive names (`NewbornsSection`, `MakersRhythmSection`)
- **Theme files**: `theme.ts` (page-specific)
- **Background files**: `background.tsx` (page-specific)
- **Shared resources**: Descriptive names in `shared/` directory

### Animation Guidelines

- **Staggered delays**: Use incremental delays (0ms, 100ms, 200ms...) for section entrance
- **Duration**: Use `duration-700` for consistent fade-in timing
- **Background**: Dark mode always has stars/shooting stars; light mode is static or has subtle effects

## Future Expansion

Observatory is designed to grow with new analytical pages:

- **Hall of Fame**: Celebrating legendary prototypes
- **Memorial Park**: Honoring completed prototypes
- **Sci-Fi Lab**: Exploring anomalies and mutations
- **Explorer's Guild**: Community and roadmap insights

Each new page follows the established patterns while bringing its own unique theme and narrative.

## Technical Notes

- **Server Components**: Most Observatory pages use Server Components for data fetching
- **Theme System**: Type-safe with TypeScript const assertions
- **Accessibility**: Semantic HTML with proper ARIA roles
- **Performance**: Background animations use CSS animations (GPU-accelerated)
- **SEO**: Custom OG images per page, descriptive metadata
