import { PlayMode, SimulatedDelayLevel } from '@/types/mugen-protopedia.types';

/**
 * Some fields in the prototype API responses are delivered as pipe separated strings.
 * This helper splits the string by `|` and trims each segment to produce an array of values.
 */
export const splitPipeSeparatedString = (value: string): string[] => {
  if (!value) {
    return [];
  }
  return value.split('|').map((s) => s.trim());
};

export function getPlayModeLabel(playMode: PlayMode): string {
  switch (playMode) {
    case 'normal':
      return 'Normal';
    case 'playlist':
      return 'Playlist️';
    case 'unleashed':
      return 'Unleashed';
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
    //
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
