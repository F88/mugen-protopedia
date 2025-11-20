import { PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS } from '@/lib/config/app-constants';

/**
 * Returns true when the given URL is allowed to be fetched and
 * scanned for ProtoPedia prototype URLs.
 *
 * This is the single source of truth for both client- and
 * server-side checks. It currently allows only HTTPS URLs whose
 * origin is included in PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS, but the
 * target page itself does not have to be on protopedia.net.
 */
export function isAllowedProtopediaScrapeUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const origin =
      `${url.protocol}//${url.host}` as (typeof PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS)[number];

    return (
      url.protocol === 'https:' &&
      PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS.includes(origin)
    );
  } catch {
    return false;
  }
}
