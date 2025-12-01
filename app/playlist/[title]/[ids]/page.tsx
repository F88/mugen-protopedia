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

  // params are already decoded by Next.js, so we use them as is.
  // However, we try to decode again safely to handle cases where characters might be double-encoded
  // or if specific encoding handling is needed, while catching potential URIErrors.
  let decodedTitle = title;
  let decodedIds = ids;
  try {
    decodedTitle = decodeURIComponent(title);
    decodedIds = decodeURIComponent(ids);
  } catch {
    // Ignore decoding errors and use original values
  }

  const effectiveIds = decodedIds
    .split(',')
    .map((id) => parseInt(id, 10))
    .filter((id) => !Number.isNaN(id));

  const shouldAutoplay = destinationParams.has('autoplay');

  return (
    <Playlist
      title={decodedTitle}
      ids={effectiveIds}
      extraParams={extraParams}
      shouldAutoplay={shouldAutoplay}
    />
  );
}
