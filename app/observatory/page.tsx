/**
 * @file Observatory Top Page
 * @description
 *   The top-level page for the ProtoPedia Observatory feature. This page provides
 *   an immersive universe-themed dashboard with animated backgrounds (stars and shooting stars in dark mode),
 *   and feature cards for exploring various aspects of the ProtoPedia ecosystem.
 *
 *   - UniverseBackground: Renders a dynamic, theme-aware background (animation in dark mode only).
 *   - ObservatoryCard: Feature cards for navigation to subpages (e.g., Hello World, Hall of Fame).
 *   - Responsive layout and accessible design.
 */
import type { Metadata } from 'next';

import { APP_TITLE } from '@/lib/config/app-constants';

import { UniverseBackground } from '@/app/observatory/components/universe-background';
import { ObservatoryCard } from '@/components/analysis/observatory-card';

export const metadata: Metadata = {
  title: `ProtoPedia Observatory | ${APP_TITLE}`,
  description:
    'Journey through the expanding universe of ideas. Fuel your curiosity with the stories behind the weird, the wonderful, and the revolutionary.',
};

/**
 * ObservatoryPage component
 *
 * Renders the top-level Observatory dashboard with a universe-themed background and feature cards.
 *
 * ## Theme-specific background animation
 * - **Dark mode:** Animated stars and shooting stars (UniverseBackground) are displayed for an immersive space effect.
 * - **Light mode:** No stars or shooting stars. Only a static, bright gradient background is shown (no animation).
 *
 * - UniverseBackground: Theme-aware background (animation in dark mode only)
 * - ObservatoryCard: Feature cards for subpages
 * - Responsive and accessible layout
 */
export default function ObservatoryPage() {
  return (
    <main className="">
      <UniverseBackground />
      <div className="px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            The ProtoPedia Universe
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Journey through the expanding universe of ideas. Fuel your curiosity
            with the stories behind the weird, the wonderful, and the
            revolutionary.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {/* Hello World Feature Card */}
          <ObservatoryCard
            title="Hello World"
            description="Celebrate new creations. Witness the birth of light and vivid moments where new prototypes begin their journey."
            icon="🎉"
            color="blue"
            href="/observatory/hello-world"
          />

          {/* Hall of Fame Feature Card (Coming Soon) */}
          <ObservatoryCard
            title="Hall of Fame"
            description="Celebrating the legends. A collection of the most impactful and memorable prototypes in history."
            icon="🏛️"
            color="yellow"
            href={undefined}
          />

          {/* The Memorial Park Feature Card (Coming Soon) */}
          <ObservatoryCard
            title="The Memorial Park"
            description="A place of respect and history. Honoring the prototypes that have completed their journey and the legacy they leave behind."
            icon="🪦"
            color="gray"
            href={undefined}
          />

          {/* The Sci-Fi Lab Feature Card */}
          <ObservatoryCard
            title="The Sci-Fi Lab"
            description="Exploring the unknown. Analyzing mutations, time travelers, and out-of-place artifacts that defy the timeline."
            icon="🌌"
            color="purple"
            href={undefined}
          />

          {/* The Explorer's Guild Feature Card */}
          <ObservatoryCard
            title="The Explorer's Guild"
            description="Adventure, strategy, and community. Discovering the tech roadmap and the unsung heroes of the ecosystem."
            icon="🧭"
            color="amber"
            href={undefined}
          />
        </div>
      </div>
    </main>
  );
}
