/**
 * Hello World Page - The Latest Prototypes' Debut
 *
 * This page displays an analysis of the latest prototypes, focusing on new arrivals ("Newborns")
 * and general statistics about the ProtoPedia universe.
 */

import type { Metadata } from 'next';

import { APP_TITLE } from '@/lib/config/app-constants';

import { ObservatoryHeader } from '../components/observatory-header';

import { HelloWorldBackground } from './background';
import { HelloWorldContent } from './content';

const pageTitle = `Hello World - ProtoPedia Observatory | ${APP_TITLE}`;
const pageDescription =
  'Greetings, Universe! Here we celebrate the ignition of new ideas. Witness the latest prototypes that have just materialized into our world.';

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

// Time-based Revalidation
export const revalidate = 300; // revalidate at most every 5 minutes

export default function HelloWorldPage() {
  return (
    <>
      <ObservatoryHeader colorScheme="pink" />
      <main>
        <HelloWorldBackground />
        <HelloWorldContent />
      </main>
    </>
  );
}
