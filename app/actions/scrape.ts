'use server';

import { fetchPageHtmlOnServer } from '@/lib/fetcher/protopedia-scraper';
import { PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS } from '@/lib/config/app-constants';

function isAllowedUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const origin = `${url.protocol}//${url.host}`;
    // Only allow https origins from the explicit allow-list.
    return (
      url.protocol === 'https:' &&
      (PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS as readonly string[]).includes(origin)
    );
  } catch {
    return false;
  }
}

export async function scrapePageHtml(pageUrl: string): Promise<{
  html: string;
  finalUrl: string;
}> {
  const trimmed = pageUrl.trim();
  if (trimmed.length === 0) {
    return { html: '', finalUrl: '' };
  }

  if (!isAllowedUrl(trimmed)) {
    throw new Error('This URL is not allowed for server-side fetching.');
  }
  try {
    const { html, finalUrl } = await fetchPageHtmlOnServer(trimmed);
    if (!html || html.length === 0) {
      return { html: '', finalUrl };
    }
    return { html, finalUrl };
  } catch (error) {
    // Re-throw with a safe, serializable message so the client UI
    // can surface the underlying fetch failure reason.
    const message =
      error instanceof Error && error.message
        ? error.message
        : 'Unknown error while fetching page.';
    throw new Error(message);
  }
}
