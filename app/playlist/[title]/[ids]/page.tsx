// import { logger } from '@/lib/logger.client';
import { Metadata } from 'next';
import { APP_TITLE } from '@/lib/config/app-constants';
import { Playlist } from './playlist';

type Props = {
  params: Promise<{
    title: string;
    ids: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { title: rawTitle } = await params;
  let title = rawTitle;
  try {
    title = decodeURIComponent(rawTitle);
  } catch {
    // ignore
  }

  return {
    title: `${title} | ${APP_TITLE}`,
    description: `Playlist: ${title}`,
    openGraph: {
      title: `${title} | ${APP_TITLE}`,
      description: `Playlist: ${title}`,
    },
    twitter: {
      title: `${title} | ${APP_TITLE}`,
      description: `Playlist: ${title}`,
    },
  };
}

/**
 * Playlist page component.
 *
 * Handles redirection from path-based playlist URLs to
 * query-parameter-based URLs.
 *
 * Example URL:
 * https://mugen-pp.vercel.app/playlist/HL2025%20%E3%82%AA%E3%83%AC%E3%83%88%E3%82%AF%E8%B3%9E%E3%82%AA%E3%83%B3%E3%83%A9%E3%82%A4%E3%83%B3%E6%B1%BA%E5%8B%9D%20%23%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%BA%E3%83%AA%E3%83%BC%E3%82%B0%20-%20connpass/7586%2C7630%2C6874%2C7177%2C7724%2C7613%2C7603%2C7628%2C7759%2C7801%2C7103%2C6868%2C7780
 *
 * Before fix: <title>無限ProtoPedia</title>
 * After fix: <title>HL2025 オレトク賞オンライン決勝 #ヒーローズリーグ - connpass | 無限ProtoPedia</title>
 */
export default async function PlaylistPage({ params, searchParams }: Props) {
  const { title: rawTitle, ids: rawIds } = await params;
  const incomingSearchParams = await searchParams;

  let title = rawTitle;
  let ids = rawIds;

  // NOTE: Explicit decoding is required here.
  // Next.js params are not always automatically decoded for all characters (e.g., %2C for commas).
  // If we don't decode, `ids.split(',')` will fail to split encoded commas.
  // Please do not remove this decoding logic.
  try {
    title = decodeURIComponent(rawTitle);
    ids = decodeURIComponent(rawIds);
  } catch (e) {
    // If decoding fails, use raw values
    console.error('Failed to decode params', e);
  }

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
