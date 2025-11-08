'use server';

const EXTERNAL_PING_ENDPOINT =
  'https://studio--studio-6428391574-fbf09.us-central1.hosted.app/api/v1/ping';

type PingParams = {
  limit?: string;
  offset?: string;
  time?: string;
};

type PingSuccess = {
  success: true;
  body: unknown;
};

type PingFailure = {
  success: false;
  status?: number;
  body?: unknown;
  error?: string;
};

export type PingResult = PingSuccess | PingFailure;

export async function fetchPing(params: PingParams = {}): Promise<PingResult> {
  try {
    const url = new URL(EXTERNAL_PING_ENDPOINT);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value);
      }
    });

    console.debug('Pinging external endpoint:', url.toString());

    const response = await fetch(url, {
      method: 'GET',
      cache: 'force-cache',
      next: {
        tags: ['ping'],
        revalidate: 10,
      },
    });

    const contentType = response.headers.get('content-type');
    const body = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        body,
      };
    }

    return {
      success: true,
      body,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
