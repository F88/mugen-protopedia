import React from 'react';
import Link from 'next/link';
import { MugenProtoPediaHomeButton } from '@/components/mugen-pp-top-button';
import { ThemeToggle } from '@/components/theme-toggle';

interface ObservatoryLayoutBaseProps {
  children: React.ReactNode;
  headerClassName: string;
}

export function ObservatoryLayoutBase({
  children,
  headerClassName,
}: ObservatoryLayoutBaseProps) {
  return (
    <div className="min-h-screen transition-colors duration-200 flex flex-col relative">
      <div className="relative z-10 flex flex-col flex-1">
        <header
          className={`fixed top-0 left-0 right-0 z-50 ${headerClassName} transition-colors duration-200 p-4 flex items-center justify-between`}
        >
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            <Link href="/observatory">
              <span className="sm:hidden">Observatory</span>
              <span className="hidden sm:inline">ProtoPedia Observatory</span>
            </Link>
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              🕒 JST
            </span>
            <MugenProtoPediaHomeButton />
            <ThemeToggle />
          </div>
        </header>
        <div className="pt-[calc(env(safe-area-inset-top)+64px)] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
