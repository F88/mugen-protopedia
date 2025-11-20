import { isAllowedProtopediaScrapeUrl } from '@/lib/utils/url-allowlist';

/**
 * Server-only function that fetches raw HTML (or text) of an
 * allowed page URL and returns the final response URL after
 * redirects.
 *
 * NOTE: This function must only be called with URLs that have been
 * validated by isAllowedProtopediaScrapeUrl. It must be used from a
 * Server Function (Server Action) or other server-side code. Do not
 * import it into client components.
 */
export async function fetchPageHtmlOnServer(pageUrl: string): Promise<{
  html: string;
  finalUrl: string;
}> {
  if (!pageUrl || pageUrl.length === 0) {
    return { html: '', finalUrl: '' };
  }

  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!isAllowedProtopediaScrapeUrl(url.toString())) {
    throw new Error('This URL is not allowed for server-side fetching.');
  }

  // fetch allowed URL
  const response = await fetch(url.toString(), { method: 'GET' });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch page: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();
  if (!html || html.length === 0) {
    return { html: '', finalUrl: response.url };
  }

  return { html, finalUrl: response.url };
}
