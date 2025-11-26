import Link from 'next/link';

import { MugenProtoPediaHomeButton } from '@/components/mugen-pp-top-button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ObservatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200 flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-gray-900/50 transition-colors duration-200 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          <Link href="/observatory">ProtoPedia Observatory</Link>
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            🕒 JST
          </span>
          <MugenProtoPediaHomeButton />
          <ThemeToggle />
          {/* <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            Home
          </Link> */}
        </div>
      </header>
      <div className="pt-[calc(env(safe-area-inset-top)+64px)] flex-1">
        {children}
      </div>
    </div>
  );
}
