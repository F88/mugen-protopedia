import { describe, expect, it, vi } from 'vitest';

import { scrapePageHtml } from '@/app/actions/scrape';
import { PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS } from '@/lib/config/app-constants';
import * as scraper from '@/lib/fetcher/protopedia-scraper';

vi.mock('@/lib/fetcher/protopedia-scraper', () => ({
  fetchPageHtmlOnServer: vi.fn(),
}));

const fetchPageHtmlOnServerMock =
  scraper.fetchPageHtmlOnServer as unknown as ReturnType<typeof vi.fn>;

describe('scrape actions', () => {
  const allowedOrigin = PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS[0];

  it('returns empty result for empty or whitespace-only URL', async () => {
    await expect(scrapePageHtml('')).resolves.toEqual({
      html: '',
      finalUrl: '',
    });

    await expect(scrapePageHtml('   ')).resolves.toEqual({
      html: '',
      finalUrl: '',
    });
  });

  it('throws for disallowed origin', async () => {
    await expect(
      scrapePageHtml('https://example.com/some-page'),
    ).rejects.toThrow('This URL is not allowed for server-side fetching.');
  });

  it('calls fetchPageHtmlOnServer for allowed origin and returns its result', async () => {
    fetchPageHtmlOnServerMock.mockResolvedValueOnce({
      html: '<html>ok</html>',
      finalUrl: `${allowedOrigin}/prototype/1`,
    });

    const url = `${allowedOrigin}/prototype/1`;
    await expect(scrapePageHtml(url)).resolves.toEqual({
      html: '<html>ok</html>',
      finalUrl: `${allowedOrigin}/prototype/1`,
    });
  });

  it('returns empty html when fetchPageHtmlOnServer returns empty html string', async () => {
    fetchPageHtmlOnServerMock.mockResolvedValueOnce({
      html: '',
      finalUrl: `${allowedOrigin}/prototype/1`,
    });

    const url = `${allowedOrigin}/prototype/1`;
    await expect(scrapePageHtml(url)).resolves.toEqual({
      html: '',
      finalUrl: `${allowedOrigin}/prototype/1`,
    });
  });

  it('rethrows errors with a safe message', async () => {
    fetchPageHtmlOnServerMock.mockRejectedValueOnce(
      new Error('network failed'),
    );

    const url = `${allowedOrigin}/prototype/1`;
    await expect(scrapePageHtml(url)).rejects.toThrow('network failed');
  });
});
