'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { PlaylistPreviewCard } from '@/components/playlist/editor/playlist-preview-card';
// import { logger } from '@/lib/logger.client';

export function PlayList({
  title,
  ids,
  extraParams,
  // destination,
  shouldAutoplay,
}: {
  title: string;
  ids: number[];
  extraParams: string;
  // destination: string;
  shouldAutoplay: boolean;
}) {
  const router = useRouter();

  // extraParams -> URLSearchParams
  const params = new URLSearchParams(extraParams);

  params.set('title', title);
  params.set('id', ids.join(','));
  const destination = `/?${params.toString()}`;
  // logger.debug(
  // { title, ids, destination },
  // 'PlaylistPage: redirecting to query-parameter-based URL',
  // );

  useEffect(() => {
    if (shouldAutoplay) {
      router.push(destination);
    }
  }, [destination, router, shouldAutoplay]);

  if (shouldAutoplay) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-black p-4 text-white md:p-8">
      <div className="flex flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl max-w-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground text-xl">
            {ids.length} prototypes
          </p>
        </div>

        <Button
          size="lg"
          className="h-16 w-16 rounded-full shadow-2xl transition-all hover:scale-105 hover:shadow-primary/25 md:h-24 md:w-24"
          onClick={() => router.push(destination)}
        >
          <Play className="ml-1 h-8 w-8 fill-current md:h-14 md:w-14" />
          <span className="sr-only">Start Playlist</span>
        </Button>
      </div>

      <div className="w-full max-w-xl">
        <PlaylistPreviewCard effectiveIds={ids} />
      </div>
    </div>
  );
}
