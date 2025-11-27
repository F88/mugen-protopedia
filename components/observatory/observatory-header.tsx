import Link from 'next/link';
import { Audiowide } from 'next/font/google';

import { MugenProtoPediaHomeButton } from '@/components/mugen-pp-top-button';
import { ThemeToggle } from '@/components/theme-toggle';

const audiowideFont = Audiowide({
  weight: '400',
  subsets: ['latin'],
});

export type ObservatoryHeaderColorScheme =
  | 'blue'
  | 'pink'
  | 'gold'
  | 'green'
  | 'gray'
  | 'amber'
  | 'cyber';

interface ObservatoryHeaderProps {
  colorScheme?: ObservatoryHeaderColorScheme;
}

const colorSchemes = {
  blue: 'bg-blue-500/80 dark:bg-gray-900/50',
  pink: 'bg-pink-500/80 dark:bg-pink-900/50',
  gold: 'bg-yellow-500/80 dark:bg-yellow-900/50',
  green: 'bg-green-600/80 dark:bg-green-900/60',
  gray: 'bg-gray-500/80 dark:bg-gray-900/50',
  amber: 'bg-amber-500/80 dark:bg-amber-900/50',
  cyber: 'bg-black/80 dark:bg-black/80',
};

export function ObservatoryHeader({
  colorScheme = 'blue',
}: ObservatoryHeaderProps) {
  const headerClassName = colorSchemes[colorScheme];

  return (
    <div
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 ${headerClassName} ${audiowideFont.className} backdrop-blur-[2px] transition-colors duration-200 p-4 flex items-center justify-between`}
    >
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        <Link href="/observatory">
          <span className="sm:hidden">Observatory</span>
          <span className="hidden sm:inline">ProtoPedia Observatory</span>
        </Link>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">🕒 JST</span>
        <MugenProtoPediaHomeButton />
        <ThemeToggle />
      </div>
    </div>
  );
}
