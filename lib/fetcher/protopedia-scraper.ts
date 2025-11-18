/**
 * Server-only function that fetches raw HTML (or text) of an
 * arbitrary page URL and returns the final response URL after
 * redirects.
 *
 * NOTE: This function must only be called from a Server Function
 * (Server Action) or other server-side code. Do not import it into
 * client components.
 */
export async function fetchPageHtmlOnServer(pageUrl: string): Promise<{
  html: string;
  finalUrl: string;
}> {
  if (!pageUrl || pageUrl.length === 0) {
    return { html: '', finalUrl: '' };
  }

  const response = await fetch(pageUrl, { method: 'GET' });

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
