/**
 * The Alchemist's Table - a materials-themed Observatory feature page.
 *
 * Reframes prototypes through the lens of their materials. The first section is
 * the Periodic Table of Materials. Data comes from the Observatory-only
 * `getMaterialAnalysis` source, kept separate from the base analysis that the
 * 無限PP top page depends on (see docs/observatory/content/the-alchemists-table.md).
 */
import type { Metadata } from 'next';

import { APP_TITLE } from '@/lib/config/app-constants';

import { scienceGothicFont } from '@/app/observatory/shared/fonts';

import { ObservatoryHeader } from '../components/observatory-header';

import { AlchemistsTableBackground } from './background';
import { AlchemistsTableContent } from './content';

const pageTitle = `The Alchemist's Table - ProtoPedia Observatory | ${APP_TITLE}`;
const pageDescription =
  'The elements of creation. Discover the materials makers build with, the golden combinations, and the alchemists who first fused them.';

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

// Material data changes slowly; revalidate at most hourly (ISR).
export const revalidate = 3600;

export default function AlchemistsTablePage() {
  return (
    <>
      <ObservatoryHeader colorScheme="alchemy" />
      <main className={scienceGothicFont.className}>
        <AlchemistsTableBackground />
        <AlchemistsTableContent />
      </main>
    </>
  );
}
