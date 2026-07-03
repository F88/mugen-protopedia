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

/** Bilingual copy for one section: heading plus its footnote list. */
export interface SectionCopy {
  title: LocalizedText;
  description: LocalizedText;
  /**
   * Footnote items shown beneath the section (selection criteria, sort order,
   * constraints). Strings may contain the tokens `{latestYear}`,
   * `{latestYear-1}`, `{latestYear-2}`, filled in by {@link SectionNotes}.
   */
  notes?: LocalizedText[];
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

/**
 * Replace the year tokens (`{latestYear}`, `{latestYear-1}`, `{latestYear-2}`)
 * in a note with the actual latest year. Notes without tokens (or sections that
 * pass no `latestYear`) are returned unchanged.
 */
function fillYears(text: string, latestYear?: number): string {
  if (latestYear == null) return text;
  return text
    .replaceAll('{latestYear-2}', String(latestYear - 2))
    .replaceAll('{latestYear-1}', String(latestYear - 1))
    .replaceAll('{latestYear}', String(latestYear));
}

/**
 * The footnote list beneath a section (selection criteria, sort order,
 * constraints), rendered bilingually. `latestYear` fills the year tokens used by
 * the time-based sections; omit it where the notes carry no tokens.
 */
export function SectionNotes({
  notes,
  latestYear,
}: {
  notes?: SectionCopy['notes'];
  latestYear?: number;
}) {
  if (notes == null || notes.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-violet-700/70 dark:text-violet-300/60">
      {notes.map((note, index) => (
        <li key={index}>
          <span className="block">* {fillYears(note.en, latestYear)}</span>
          {/* JA notes intentionally not rendered; kept in the data only. */}
          {/* <span className="block pl-2 text-violet-600/60 dark:text-violet-300/45">
            {fillYears(note.ja, latestYear)}
          </span> */}
        </li>
      ))}
    </ul>
  );
}
