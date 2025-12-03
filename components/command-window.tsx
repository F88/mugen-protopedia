'use client';

import type { SpecialSequenceMatch } from '@/lib/hooks/use-special-key-sequences';
import { logger } from '@/lib/logger.client';
import type { ReactNode } from 'react';

const KBD_CLASS =
  'px-3 py-1.5 bg-white text-slate-900 border-2 border-slate-900! rounded-md text-2xl font-mono shadow-sm dark:bg-slate-800 dark:text-slate-50 dark:border-slate-200!';

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={KBD_CLASS}>{children}</kbd>;
}

type CommandWindowProps = {
  title?: string;
  description?: ReactNode;
  buffer?: string[];
  matchedCommand?: SpecialSequenceMatch | null;
};

export function CommandWindow({
  title = 'Mugen ProtoPedia Command Line',
  description = <p>Type your secret commands here. Press Esc to close.</p>,
  buffer,
  matchedCommand,
}: CommandWindowProps) {
  logger.debug('[CommandWindow] ', {
    title,
    description,
    buffer,
    matchedCommand,
  });

  const renderKey = (key: string): string => {
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowRight') return '→';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    if (key.length === 1) return key.toUpperCase();
    return key;
  };

  // Base classes for the window
  const baseClasses =
    'w-full max-w-2xl mx-4 rounded-xl border-4 bg-amber-50/50 text-slate-900 shadow-2xl dark:bg-slate-950/20 dark:text-slate-50 min-h-24 flex items-center transition-all duration-300';

  // Dynamic classes based on matched state
  const borderClasses = matchedCommand
    ? 'border-cyan-200! dark:border-cyan-100! shadow-[0_0_40px_rgba(165,243,252,0.8)] dark:shadow-[0_0_60px_rgba(207,250,254,0.6)] scale-105'
    : 'border-slate-700! dark:border-white!';

  return (
    // Outer overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-xs">
      {/* Box */}
      <div className={`${baseClasses} ${borderClasses}`}>
        {/* <div className="px-5 py-4 text-lg leading-relaxed text-slate-100"> */}
        {/* {description} */}
        {/* </div> */}
        {matchedCommand ? (
          <div className="w-full px-4 py-4 flex flex-col items-center justify-center gap-4">
            {/* Matched Keys */}
            <div className="flex justify-center flex-wrap gap-3 opacity-80 scale-90">
              {matchedCommand.keys.map((key, index) => (
                <Kbd key={`${key}-${index}`}>{renderKey(key)}</Kbd>
              ))}
            </div>
            {/* Message */}
            <div className="text-3xl font-bold text-center text-cyan-700 dark:text-cyan-100 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse">
              {matchedCommand.message}
            </div>
          </div>
        ) : (
          buffer &&
          buffer.length > 0 && (
            <div className="w-full px-4 py-4 text-2xl text-slate-900 dark:text-slate-50 flex justify-center flex-wrap gap-3">
              {buffer.map((key, index) => (
                <Kbd key={`${key}-${index}`}>{renderKey(key)}</Kbd>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
