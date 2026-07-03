/**
 * @fileoverview Bilingual section heading for The Alchemist's Table.
 *
 * Every section on the page shows its title and description in English and
 * Japanese together (no locale switch / i18n framework). The strings live in
 * `content.tsx` as `SECTION_DEFINITIONS`; this component only renders them.
 */
import { cinzelFont } from '@/app/observatory/shared/fonts';

/** A piece of section copy carried in both languages (rendered together). */
export interface LocalizedText {
  en: string;
  ja: string;
}

/** Bilingual heading copy (title + description) for one section. */
export interface SectionCopy {
  title: LocalizedText;
  description: LocalizedText;
}

/**
 * A section heading rendering its title (h2) and description in English with
 * the Japanese rendition stacked directly beneath each. `className` overrides
 * the wrapper spacing (some sections want more room below the heading).
 */
export function SectionHeading({
  id,
  copy,
  className = 'mb-4',
}: {
  id: string;
  copy: SectionCopy;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2
        id={id}
        className={`${cinzelFont.className} text-2xl font-semibold text-violet-950 dark:text-violet-100 sm:text-3xl`}
      >
        {copy.title.en}
        {/* temporary disabled */}
        {/* <span className="mt-0.5 block text-lg font-normal text-violet-800/90 dark:text-violet-200/90">
          {copy.title.ja}
        </span> */}
      </h2>
      <p className="mt-2 text-violet-900/80 dark:text-violet-200/80">
        {copy.description.en}
      </p>
      <p className="mt-1 text-sm text-violet-800/70 dark:text-violet-300/70">
        {copy.description.ja}
      </p>
    </div>
  );
}
