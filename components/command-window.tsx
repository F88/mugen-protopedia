'use client';

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
};

export function CommandWindow({
  title = 'Mugen ProtoPedia Command Line',
  description = <p>Type your secret commands here. Press Esc to close.</p>,
  buffer,
}: CommandWindowProps) {
  logger.debug('[CommandWindow] ', { title, description, buffer });

  const renderKey = (key: string): string => {
    if (key === 'ArrowLeft') return '←';
    if (key === 'ArrowRight') return '→';
    if (key === 'ArrowUp') return '↑';
    if (key === 'ArrowDown') return '↓';
    if (key.length === 1) return key.toUpperCase();
    return key;
  };

  return (
    // Outer overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-xs">
      {/* Box */}
      <div className="w-full max-w-2xl mx-4 rounded-xl border-4 border-slate-700! dark:border-white! bg-amber-50/50 text-slate-900 shadow-2xl dark:bg-slate-950/20 dark:text-slate-50 min-h-24 flex items-center">
        {/* <div className="px-5 py-4 text-lg leading-relaxed text-slate-100"> */}
        {/* {description} */}
        {/* </div> */}
        {buffer && buffer.length > 0 && (
          <div className="w-full px-4 py-4 text-2xl text-slate-900 dark:text-slate-50 flex justify-center flex-wrap gap-3">
            {buffer.map((key, index) => (
              <Kbd key={`${key}-${index}`}>{renderKey(key)}</Kbd>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
