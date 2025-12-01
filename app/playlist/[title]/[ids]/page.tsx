import { logger } from '@/lib/logger.client';
import { ClientRedirect } from './client-redirect';

type Props = {
  params: Promise<{
    title: string;
    ids: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * Playlist page component.
 *
 * Handles redirection from path-based playlist URLs to
 * query-parameter-based URLs.
 *
 */
export default async function PlaylistPage({ params, searchParams }: Props) {
  const { title, ids } = await params;
  const incomingSearchParams = await searchParams;

  const destinationParams = new URLSearchParams();

  // Preserve existing query parameters
  Object.entries(incomingSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => destinationParams.append(key, v));
    } else if (value !== undefined) {
      destinationParams.set(key, value);
    }
  });

  logger.debug({ incomingSearchParams }, 'PlaylistPage: received search parameters');

  // params are already decoded by Next.js, so we use them as is.
  // URLSearchParams will handle encoding for the query string.
  // Overwrite title and id with values from path params
  destinationParams.set('title', decodeURIComponent(title));
  destinationParams.set('id', decodeURIComponent(ids));

  const destination = `/?${destinationParams.toString()}`;

  logger.debug(
    { title, ids, destination },
    'PlaylistPage: redirecting to query-parameter-based URL',
  );

  // return <>{destination}</>;
  return <ClientRedirect destination={destination} />;
}
