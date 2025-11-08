import { NextResponse } from 'next/server';

type Logger = {
  warn: (obj: unknown, msg?: string) => void;
  error: (obj: unknown, msg?: string) => void;
};

export function handleApiError(
  logger: Logger,
  error: unknown,
  context: string,
) {
  const status = (error as { status?: number }).status;
  const body = (error as { body?: string }).body;

  if (typeof status === 'number') {
    const isAuth = status === 401;
    logger.warn({ status, body: (body ?? '').slice(0, 500) }, 'Upstream error');
    return NextResponse.json(
      {
        error: isAuth ? `Unauthorized when ${context}` : `Failed to ${context}`,
        status,
        body: process.env.NODE_ENV === 'development' ? body : undefined,
      },
      { status: isAuth ? 500 : 502 },
    );
  }

  const message = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error({ error: message }, `Unexpected error when ${context}`);
  return NextResponse.json(
    {
      error: `Unexpected error while ${context}`,
      details: message,
      stack: process.env.NODE_ENV === 'development' ? stack : undefined,
    },
    { status: 500 },
  );
}
