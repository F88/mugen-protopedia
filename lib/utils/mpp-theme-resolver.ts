import type {
  PlayModeState,
  SimulatedDelayLevel,
  MppThemeType,
} from '@/types/mugen-protopedia.types';

/**
 * Resolves theme type based on a date and time.
 * Christmas theme is shown during December 19-25, 16:00-06:00 (next day) in user's local time.
 *
 * @param now - The reference date/time. Defaults to the current time. Pass an
 *   explicit `Date` to make the result deterministic (tests, previews) without
 *   mocking the global clock.
 * @returns Theme type based on date/time, or null if no special theme
 */
export function resolveThemeByDate(now: Date = new Date()): MppThemeType {
  const month = now.getMonth(); // 0-indexed: 0 = January, 11 = December
  const date = now.getDate(); // 1-31
  const hour = now.getHours(); // 0-23

  // Check for Christmas theme condition
  //
  // December 19-24: 16:00-06:00 (next day)
  // December 25: All day
  if (
    month === 11 &&
    ((date >= 19 && date < 25 && (hour >= 16 || hour < 6)) || date === 25)
  ) {
    return 'christmas';
  }

  return null;
}

/**
 * Resolves the appropriate theme type based on play mode and delay level.
 *
 * @param mode - The current play mode state
 * @param delayLevel - The current simulated delay level (optional)
 * @param now - The reference date/time for the date-based fallback. Defaults to
 *   the current time; pass an explicit `Date` for deterministic results.
 * @returns The theme type to apply, or null for no theme
 */
export function resolveMppThemeType(
  mode: PlayModeState,
  delayLevel?: SimulatedDelayLevel,
  now: Date = new Date(),
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
  return resolveThemeByDate(now);
}
