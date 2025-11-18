'use client';

import { PlaylistUrlGenerator } from '@/components/playlist-url-generator';
import { useDirectLaunch } from '@/hooks/use-direct-launch';

export function PlaylistEditClient() {
  const directLaunchResult = useDirectLaunch();

  const directLaunchParams =
    directLaunchResult.type === 'success'
      ? directLaunchResult.value
      : undefined;

  return <PlaylistUrlGenerator directLaunchParams={directLaunchParams} />;
}
