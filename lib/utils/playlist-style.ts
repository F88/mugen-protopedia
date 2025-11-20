import type { PlaylistTitleCardVariant } from '@/components/playlist/playlist-title';

export type PlaylistFontFamily = 'sans' | 'serif' | 'mono';

export interface RandomPlaylistStyle {
  variant: PlaylistTitleCardVariant;
  fontFamily: PlaylistFontFamily;
}

const PLAYLIST_VARIANTS: PlaylistTitleCardVariant[] = [
  'default',
  'frame',
  'cyberpunk',
  'anime',
  'retro',
  'elegant',
  'space',
  'neon',
  'pastel',
  'monochrome',
  'gradient',
  'minimal',
  'glass',
  'sunset',
  'ocean',
  'forest',
];

const PLAYLIST_FONTS: PlaylistFontFamily[] = ['sans', 'serif', 'mono'];

/**
 * Generate a random playlist style by selecting a random variant and font family.
 *
 * @returns An object containing a randomly selected variant and fontFamily
 */
export function getRandomPlaylistStyle(): RandomPlaylistStyle {
  const randomVariantIndex = Math.floor(
    Math.random() * PLAYLIST_VARIANTS.length,
  );
  const randomFontIndex = Math.floor(Math.random() * PLAYLIST_FONTS.length);

  return {
    variant: PLAYLIST_VARIANTS[randomVariantIndex],
    fontFamily: PLAYLIST_FONTS[randomFontIndex],
  };
}
