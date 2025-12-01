'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export function ClientRedirect({
  destination,
  shouldAutoplay,
}: {
  destination: string;
  shouldAutoplay: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (shouldAutoplay) {
      router.push(destination);
    }
  }, [destination, router, shouldAutoplay]);

  if (shouldAutoplay) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Playlist Ready</h1>
        <p className="text-muted-foreground">
          Click the button below to start watching.
        </p>
      </div>
      <Button
        size="lg"
        className="h-24 w-24 rounded-full text-xl"
        onClick={() => router.push(destination)}
      >
        <Play className="h-12 w-12 fill-current" />
        <span className="sr-only">Play</span>
      </Button>
    </div>
  );
}
