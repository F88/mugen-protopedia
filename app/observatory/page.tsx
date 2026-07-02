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

import {
  audiowideFont,
  observatoryFonts,
} from '@/app/observatory/shared/fonts';
import { ObservatoryBackground } from './_components/background';
import { observatoryTheme } from '@/app/observatory/theme';

import { ObservatoryCard } from './_components/observatory-card';
import { ObservatoryHeader } from './components/observatory-header';

const pageTitle = `ProtoPedia Observatory | ${APP_TITLE}`;
const pageDescription =
  'Journey through the expanding universe of ideas. Fuel your curiosity with the stories behind the weird, the wonderful, and the revolutionary.';

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
  },
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
    <>
      <ObservatoryHeader colorScheme="blue" />
      <main className={audiowideFont.className}>
        <ObservatoryBackground />
        <div className="px-4 py-8 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              The ProtoPedia Universe
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Journey through the expanding universe of ideas. Fuel your
              curiosity with the stories behind the weird, the wonderful, and
              the revolutionary.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
            {/* ObservatoryCard for 'Hello World' */}
            <ObservatoryCard
              title="Hello World"
              description="Celebrate new creations. Witness the birth of light and vivid moments where new prototypes begin their journey."
              icon="🎉"
              color={observatoryTheme.cards.helloWorld.colorScheme}
              href="/observatory/hello-world"
              // backgroundImage="/icons/icon-1024x1024.png"
              className={
                observatoryFonts[observatoryTheme.cards.helloWorld.font]
                  .className
              }
            />

            {/* ObservatoryCard for 'ProtoPedia Summary' (external site) */}
            <ObservatoryCard
              title="ProtoPedia Summary"
              description={
                <>
                  <p>
                    A website that helps you discover trending projects on
                    ProtoPedia.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li className="flex gap-1">
                      <span aria-hidden="true">&bull;</span>
                      <span>
                        ProtoPedia Daily Summary - Highlights the day&apos;s
                        notable projects based on views and likes, complete with
                        AI-generated summaries and insights.
                      </span>
                    </li>
                  </ul>
                </>
              }
              icon="📰️"
              color={observatoryTheme.cards.protopediaSummary.colorScheme}
              href="https://protopedia-summary.higedaruma.net/"
              className={
                observatoryFonts[observatoryTheme.cards.protopediaSummary.font]
                  .className
              }
              titleClassName={
                observatoryFonts[
                  observatoryTheme.cards.protopediaSummary.titleFont
                ].className
              }
            />

            {/* Hall of Fame Feature Card (Coming Soon) */}
            <ObservatoryCard
              title="Hall of Fame"
              description="Celebrating the legends. A collection of the most impactful and memorable prototypes in history."
              icon="🏛️"
              color={observatoryTheme.cards.hallOfFame.colorScheme}
              href={undefined}
              // href={'/observatory/hall-of-fame/'}
              className={
                observatoryFonts[observatoryTheme.cards.hallOfFame.font]
                  .className
              }
            />

            {/* The Memorial Park Feature Card (Coming Soon) */}
            <ObservatoryCard
              title="The Memorial Park"
              description="A place of respect and history. Honoring the prototypes that have completed their journey and the legacy they leave behind."
              icon="🪦"
              color={observatoryTheme.cards.memorialPark.colorScheme}
              href={undefined}
              // href={'/observatory/memorial-park/'}
              className={
                observatoryFonts[observatoryTheme.cards.memorialPark.font]
                  .className
              }
            />

            {/* ObservatoryCard for The Alchemist */}
            <ObservatoryCard
              title="The Alchemist's Table"
              description="The elements of creation. Discover the materials makers build with, the golden combinations, and the alchemists who first fused them."
              icon="⚗️"
              color={observatoryTheme.cards.alchemistsTable.colorScheme}
              href="/observatory/alchemists-table"
              className={
                observatoryFonts[observatoryTheme.cards.alchemistsTable.font]
                  .className
              }
              titleClassName={
                observatoryFonts[
                  observatoryTheme.cards.alchemistsTable.titleFont
                ].className
              }
            />

            {/* The Sci-Fi Lab Feature Card */}
            <ObservatoryCard
              title="The Sci-Fi Lab"
              description="Exploring the unknown. Analyzing mutations, time travelers, and out-of-place artifacts that defy the timeline."
              icon="🧪"
              color={observatoryTheme.cards.sciFiLab.colorScheme}
              href={undefined}
              // href={'/observatory/sci-fi-lab/'}
              className={
                observatoryFonts[observatoryTheme.cards.sciFiLab.font].className
              }
            />

            {/* The Explorer's Guild Feature Card */}
            <ObservatoryCard
              title="The Explorer's Guild"
              description="Adventure, strategy, and community. Discovering the tech roadmap and the unsung heroes of the ecosystem."
              icon="🧭"
              color={observatoryTheme.cards.explorersGuild.colorScheme}
              href={undefined}
              // href={'/observatory/explorers-guild/'}
              className={
                observatoryFonts[observatoryTheme.cards.explorersGuild.font]
                  .className
              }
            />
          </div>
        </div>
      </main>
    </>
  );
}
