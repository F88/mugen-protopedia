import type {
  PlayModeState,
  SimulatedDelayLevel,
  MppThemeType,
} from '@/types/mugen-protopedia.types';

/**
 * Resolves theme type based on current date and time.
 * Christmas theme is shown during December 20-25, 16:00-06:00 (next day) in user's local time.
 *
 * @returns Theme type based on date/time, or null if no special theme
 */
export function resolveThemeByDate(): MppThemeType {
  // Get current date and time on user's local timezone
  const now = new Date();

  const month = now.getMonth(); // 0-indexed: 0 = January, 11 = December
  const date = now.getDate(); // 1-31
  const hour = now.getHours(); // 0-23

  // Check for Christmas theme condition
  //
  // December 19-25, 16:00-06:00 (next day)
  if (month === 11 && date >= 19 && date <= 25 && (hour >= 16 || hour < 6)) {
    return 'christmas';
  }

  return null;
}

/**
 * Resolves the appropriate theme type based on play mode and delay level.
 *
 * @param mode - The current play mode state
 * @param delayLevel - The current simulated delay level (optional)
 * @returns The theme type to apply, or null for no theme
 */
export function resolveMppThemeType(
  mode: PlayModeState,
  delayLevel?: SimulatedDelayLevel,
): MppThemeType {
  // Unleashed mode always gets unleashed theme
  if (mode.type === 'unleashed') {
    return 'unleashed';
  }

  // Playlist mode never gets a theme
  // if (mode.type === 'playlist') { return null; }

  // Christmas modes get Christmas theme
  // if (mode.type === 'xmas') { return 'christmas'; }

  // Normal mode with fast delay levels gets normal-with-theme
  if (mode.type === 'normal') {
    if (delayLevel != null) {
      if (
        delayLevel === 'FAST' ||
        delayLevel === 'FASTER' ||
        delayLevel === 'FASTEST'
      ) {
        return 'random';
      }
    }
  }

  // Dev
  if (mode.type === 'dev') {
    return 'christmas';
  }

  // Date-based automatic theme resolution
  return resolveThemeByDate();
}
