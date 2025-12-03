'use client';

import { logger } from '@/lib/logger.client';
import type { ReactNode } from 'react';

// const KBD_CLASS = 'px-3 py-1.5 bg-slate-900 text-slate-50 border border-slate-600 rounded text-2xl font-mono';
// const KBD_CLASS = 'px-3 py-1.5 bg-slate-800 text-slate-50 border border-slate-500 rounded text-2xl font-mono';
const KBD_CLASS =
  'px-3 py-1.5 bg-slate-800 text-slate-50 border border-slate-500 rounded text-2xl font-mono';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 rounded-lg border-4 border-white bg-amber-50/85 text-slate-900 shadow-2xl dark:bg-slate-950/80 dark:text-slate-50 min-h-24 flex items-center">
        {/* <div className="border-b border-slate-800 px-5 py-3 text-sm font-mono uppercase tracking-[0.2em] text-slate-400"> */}
        {/* {title} */}
        {/* </div> */}

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
