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

Each Observatory page has its own `theme.ts` file with centralized configuration:

```typescript
// app/observatory/[page]/theme.ts
export const pageTheme = {
  colors: {
    light: { /* light mode palette */ },
    dark: { /* dark mode palette */ },
  },
  typography: {
    fontFamily: 'FontName',
  },
  sections: {
    sectionName: {
      theme: 'colorScheme',  // Maps to ObservatorySection theme
      delay: 'delay-100',     // Animation delay
    },
  },
  animation: { /* animation settings */ },
} as const;
```

**Benefits:**

- Single source of truth for page styling
- Easy theme updates without touching components
- Consistent color schemes across sections

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

## Key Differences from Main App

| Aspect | Main App (`/`) | Observatory (`/observatory`) |
|--------|----------------|------------------------------|
| **Design** | Clean, minimal, content-focused | Immersive, thematic, visually rich |
| **Layout** | Standard page layout | Full-page backgrounds, custom sections |
| **Typography** | System fonts, consistent across app | Custom fonts per page (Marcellus, Audiowide, etc.) |
| **Components** | Reusable UI components (Button, Card, etc.) | Page-specific analytical sections |
| **Data** | Prototype listings, playlists | Statistical analysis, insights, narratives |
| **Navigation** | Standard routing | Thematic page transitions |
| **Background** | Solid colors or simple gradients | Animated space backgrounds, page-specific themes |
| **State Management** | Client-side interactivity | Server-side data analysis, minimal client state |

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
