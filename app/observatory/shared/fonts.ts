/**
 * Observatory Shared Fonts
 *
 * Common font definitions used across Observatory pages.
 * Each font is loaded once and can be referenced by multiple pages.
 */
import {
  Audiowide,
  Cinzel,
  Electrolize,
  Marcellus,
  Rye,
  VT323,
} from 'next/font/google';

// Font definitions - Next.js requires individual const declarations
export const audiowideFont = Audiowide({ weight: '400', subsets: ['latin'] });
export const marcellusFont = Marcellus({ weight: '400', subsets: ['latin'] });
export const cinzelFont = Cinzel({
  weight: ['400', '700'],
  subsets: ['latin'],
});
export const electrolizeFont = Electrolize({
  weight: '400',
  subsets: ['latin'],
});
export const vt323Font = VT323({ weight: '400', subsets: ['latin'] });
export const ryeFont = Rye({ weight: '400', subsets: ['latin'] });

// Font map for theme-based access
export const observatoryFonts = {
  Audiowide: audiowideFont,
  Marcellus: marcellusFont,
  Cinzel: cinzelFont,
  Electrolize: electrolizeFont,
  VT323: vt323Font,
  Rye: ryeFont,
} as const;

export type ObservatoryFontName = keyof typeof observatoryFonts;
