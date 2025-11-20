'use client';

import { useDirectLaunch } from '@/hooks/use-direct-launch';

import { PlaylistEditor } from '@/components/playlist/editor/playlist-editor';

export function PlaylistEditClient() {
  const directLaunchResult = useDirectLaunch();

  const directLaunchParams =
    directLaunchResult.type === 'success'
      ? directLaunchResult.value
      : undefined;

  return <PlaylistEditor directLaunchParams={directLaunchParams} />;
}
