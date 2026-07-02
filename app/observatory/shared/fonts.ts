/**
 * Observatory Shared Fonts
 *
 * Common font definitions used across Observatory pages.
 * Each font is loaded once and can be referenced by multiple pages.
 */
import {
  Audiowide,
  Cinzel,
  Cinzel_Decorative,
  Electrolize,
  Marcellus,
  Rye,
  VT323,
  M_PLUS_1_Code,
  Science_Gothic,
} from 'next/font/google';

// Font definitions - Next.js requires individual const declarations
export const audiowideFont = Audiowide({ weight: '400', subsets: ['latin'] });
export const marcellusFont = Marcellus({ weight: '400', subsets: ['latin'] });
export const cinzelFont = Cinzel({
  weight: ['400', '700'],
  subsets: ['latin'],
});
export const cinzelDecorativeFont = Cinzel_Decorative({
  weight: ['400', '700'],
  subsets: ['latin'],
});
// Variable sci-fi grotesque; weight axis used as variable. `adjustFontFallback`
// is disabled because next has no fallback-override metrics for this newer font
// (otherwise it warns and skips fallback generation anyway).
export const scienceGothicFont = Science_Gothic({
  subsets: ['latin'],
  adjustFontFallback: false,
});
export const electrolizeFont = Electrolize({
  weight: '400',
  subsets: ['latin'],
});
export const vt323Font = VT323({ weight: '400', subsets: ['latin'] });
export const ryeFont = Rye({ weight: '400', subsets: ['latin'] });
export const mPlus1CodeFont = M_PLUS_1_Code({
  weight: '400',
  subsets: ['latin'],
});

// Font map for theme-based access
export const observatoryFonts = {
  Audiowide: audiowideFont,
  Marcellus: marcellusFont,
  Cinzel: cinzelFont,
  Electrolize: electrolizeFont,
  VT323: vt323Font,
  Rye: ryeFont,
  M_PLUS_1_Code: mPlus1CodeFont,
  Cinzel_Decorative: cinzelDecorativeFont,
  Science_Gothic: scienceGothicFont,
} as const;

export type ObservatoryFontName = keyof typeof observatoryFonts;
