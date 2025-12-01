// import { logger } from '@/lib/logger.client';
import { Playlist } from './playlist';

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
  const extraParams = destinationParams.toString();

  // logger.debug(
  // { incomingSearchParams },
  // 'PlaylistPage: received search parameters',
  // );

  const effectiveIds = ids
    .split(',')
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));

  const shouldAutoplay = destinationParams.has('autoplay');

  return (
    <Playlist
      title={title}
      ids={effectiveIds}
      extraParams={extraParams}
      shouldAutoplay={shouldAutoplay}
    />
  );
}
