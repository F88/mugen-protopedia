import type { ReactNode } from 'react';

/**
 * Lays chips out as wrapping pills, showing the first `visible` up front and
 * tucking the rest behind a native <details> toggle — no client JS, so the
 * Circle section stays a Server Component. Mirrors `CollapsibleRows` in
 * `insight-sections.tsx`, but flows chips instead of list rows (a Vanguard maker
 * can pioneer dozens of materials).
 */
export function CollapsibleChips({
  chips,
  visible = 20,
}: {
  chips: ReactNode[];
  visible?: number;
}) {
  if (chips.length <= visible) {
    return <span className="mt-0.5 flex flex-wrap gap-0.5">{chips}</span>;
  }
  return (
    <>
      <span className="mt-0.5 flex flex-wrap gap-0.5">
        {chips.slice(0, visible)}
      </span>
      <details className="group">
        <summary className="mt-0.5 inline-flex w-fit cursor-pointer list-none items-center gap-1 rounded-full border border-violet-300/60 bg-violet-100/70 px-1.5 py-0.5 text-[9px] font-medium text-violet-700 transition hover:border-violet-400/80 hover:text-violet-900 dark:border-violet-400/20 dark:bg-violet-900/40 dark:text-violet-300 dark:hover:text-violet-100 [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">
            +{chips.length - visible} more ▾
          </span>
          <span className="hidden group-open:inline">show less ▴</span>
        </summary>
        <span className="mt-0.5 flex flex-wrap gap-0.5">
          {chips.slice(visible)}
        </span>
      </details>
    </>
  );
}
