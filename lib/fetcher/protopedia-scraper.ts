import { constructDisplayMessage } from '@/lib/network-utils';
import { isAllowedProtopediaScrapeUrl } from '@/lib/utils/url-allowlist';
import type { NetworkFailure } from '@/types/prototype-api.types';

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

  if (!isAllowedProtopediaScrapeUrl(pageUrl)) {
    throw new Error('This URL is not allowed for server-side fetching.');
  }

  let url: URL;
  try {
    url = new URL(pageUrl);
  } catch {
    throw new Error('Invalid URL');
  }

  // List of allowed hosts and strict conditions.
  const allowedHosts = new Set(['protopedia.net', 'mashupawards.connpass.com']);
  const allowedProtocols = new Set(['https:']);
  // Disallow any URL with username, password, port, fragments, or IP addresses.
  if (
    !allowedProtocols.has(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    url.hostname.startsWith('.') ||
    url.hostname.endsWith('.') ||
    !allowedHosts.has(url.hostname)
  ) {
    throw new Error(
      'Only strictly allowed hosts/protocols are permitted, with no credentials/port.',
    );
  }
  // Disallow IP address hostnames
  // (optional: requires Node "net" module, skip if not shown anywhere else)
  // e.g,. import { isIP } from 'net'; if available:
  //   if (isIP(url.hostname)) {
  //     throw new Error('IP address hostnames are not permitted.');
  //   }
  // Disallow path traversal attempts
  if (
    /(\.\.\/|\/\.\.)/.test(url.pathname) ||
    /%2e%2e/i.test(url.pathname) // percent-encoded ".."
  ) {
    throw new Error('Path traversal detected in pathname.');
  }
  // fetch from allowed origin
  const response = await fetch(url.toString(), { method: 'GET' });

  if (!response.ok) {
    const failure: NetworkFailure = {
      status: response.status,
      error: 'Failed to fetch page',
      details: {
        statusText: response.statusText,
      },
    };
    throw new Error(constructDisplayMessage(failure));
  }

  const html = await response.text();
  if (!html || html.length === 0) {
    return { html: '', finalUrl: response.url };
  }

  return { html, finalUrl: response.url };
}
