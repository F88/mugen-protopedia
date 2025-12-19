import type {
  PlayModeState,
  SimulatedDelayLevel,
  MppThemeType,
} from '@/types/mugen-protopedia.types';

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

  // Christmas modes get Christmas theme
  if (mode.type === 'xmas') {
    return 'christmas';
  }

  // Normal mode with fast delay levels gets normal-with-theme
  if (mode.type === 'normal' && delayLevel != null) {
    if (
      delayLevel === 'FAST' ||
      delayLevel === 'FASTER' ||
      delayLevel === 'FASTEST'
    ) {
      return 'random';
    }
  }

  // Dev
  if (mode.type === 'dev') {
    return 'christmas';
  }

  // Default: no theme

  return null;
}
