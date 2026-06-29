import { PlayMode, SimulatedDelayLevel } from '@/types/mugen-protopedia.types';

export function getPlayModeLabel(playMode: PlayMode): string {
  switch (playMode) {
    case 'normal':
      return 'Normal';
    case 'playlist':
      return 'Playlist️';
    case 'unleashed':
      return 'Unleashed';
    case 'dev':
      return 'Dev';
    case 'xmas':
      return 'Christmas';
    default:
      return 'Unknown';
  }
}

// const showPlayMode = process.env.NODE_ENV === 'development';
export function getPlayModeIcon(playMode: PlayMode): undefined | string {
  switch (playMode) {
    case 'normal':
      // return `🎲`;
      return ``;
    case 'playlist':
      return `📜`;
    case 'unleashed':
      return `🦸`;
    case 'dev':
      return `⚔️`;
    case 'xmas':
      return `🎄`;
    default:
      return `❓`;
  }
}

export function getSpeedIcon(
  delayLevel: SimulatedDelayLevel,
): undefined | string {
  switch (delayLevel) {
    case 'UNLEASHED':
      // return '🦸';
      return '⏱️';
    case 'FASTEST':
      return '🚀';
    case 'FASTER':
      return '🚄';
    case 'FAST':
      return '🏃🏼‍➡️';
    case 'SLOW':
      return '🐢';
    case 'SLOWER':
      return '🐌';
    case 'SLOWEST':
      return '🦥';
    default:
      // return '❓';
      return undefined;
  }
}
