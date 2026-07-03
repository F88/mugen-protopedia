/**
 * @fileoverview The Periodic Table of Materials.
 *
 * Renders the most-used materials as "element" tiles arranged in a grid, with a
 * pseudo-symbol, an atomic number (= frequency rank) and an atomic weight
 * (= usage count). The hero and navigation surface of The Alchemist's Table.
 */
import { cn } from '@/lib/utils';
import { buildMaterialLink } from '@/lib/utils/prototype-utils';

import { SectionHeading, type SectionCopy } from './section-heading';

export interface MaterialElement {
  material: string;
  count: number;
}

/**
 * Derive a short "element symbol" from a material name. Prefers leading ASCII
 * alphanumerics (e.g. "M5Stack" -> "M5", "Arduino" -> "Ar"); falls back to the
 * first characters of non-ASCII names (e.g. Japanese material names).
 */
function toSymbol(name: string): string {
  const trimmed = name.trim();
  const ascii = trimmed.replace(/[^A-Za-z0-9]/g, '');
  const base = ascii.length > 0 ? ascii : trimmed;
  const head = base.slice(0, 2);
  return head.charAt(0).toUpperCase() + head.slice(1);
}

export interface PeriodicTableSectionProps {
  elements: MaterialElement[];
  copy: SectionCopy;
  /**
   * How many tiles to show on small screens (the rest are hidden below `sm`).
   * This is a CSS-only responsive cap — SSR cannot know the viewport, so all
   * tiles are rendered and the overflow is hidden on mobile via `max-sm:hidden`.
   */
  mobileLimit?: number;
}

export function PeriodicTableSection({
  elements,
  copy,
  mobileLimit = 28,
}: PeriodicTableSectionProps) {
  return (
    <section aria-labelledby="periodic-table-heading" className="mt-4">
      <SectionHeading
        id="periodic-table-heading"
        copy={copy}
        className="mb-6"
      />

      <ol className="grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-2">
        {elements.map((el, index) => {
          const atomicNumber = index + 1;
          return (
            <li
              key={el.material}
              className={index >= mobileLimit ? 'max-sm:hidden ' : undefined}
            >
              <a
                href={buildMaterialLink(el.material)}
                target="_blank"
                rel="noopener noreferrer"
                title={`${el.material} — used in ${el.count} works`}
                className={cn(
                  //
                  `group relative flex aspect-square flex-col justify-between overflow-hidden`,
                  `rounded-md border-2 p-1.5`,
                  // `border-stone-600 dark:border-violet-400/20` /* no effect: overridden by the unlayered `* { border-color }` in globals.css (unlayered beats @layer utilities) */,
                  `bg-linear-to-br from-stone-100 to-stone-50 dark:from-violet-950/70 dark:to-emerald-950/50`,
                  // `hover:border-amber-400` /* no effect (same reason); gold hover comes from the shadow glow below */,
                  `transition`,
                  `hover:shadow-[0_0_10px_0_rgba(251,191,36,0.85),0_0_28px_2px_rgba(245,158,11,0.55)]`,
                )}
              >
                <div className="flex items-baseline justify-between font-mono text-[10px] leading-none">
                  <span className="text-violet-700/70 dark:text-violet-300/60">
                    {atomicNumber}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    {el.count.toLocaleString()}
                  </span>
                </div>
                <span className="text-center text-2xl font-bold text-violet-950 transition-colors group-hover:text-amber-500 group-hover:[text-shadow:0_0_12px_rgba(251,191,36,0.85)] dark:text-violet-50 dark:group-hover:text-amber-300">
                  {toSymbol(el.material)}
                </span>
                <span className="truncate text-center text-[9px] leading-tight text-violet-800/80 dark:text-emerald-200/70">
                  {el.material}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
