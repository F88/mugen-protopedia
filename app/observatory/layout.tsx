import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MugenProtoPediaHomeButton } from '@/components/mugen-pp-top-button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ObservatoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // パスごとにヘッダ色を分岐
  let headerClassName =
    'bg-blue-500/80 dark:bg-gray-900/50 backdrop-blur-[2px]';
  if (pathname === '/observatory/hello-world') {
    headerClassName =
      'bg-green-600/80 dark:bg-green-900/60 backdrop-blur-[2px]';
  }
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
    </div>
  );
}
