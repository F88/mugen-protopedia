import type { FC } from 'react';
import { Moon, Sun } from 'lucide-react';

type ThemeIconProps = {
  theme: 'light' | 'dark';
  mounted: boolean;
};

export const ThemeIcon: FC<ThemeIconProps> = ({ theme, mounted }) => {
  return (
    <div className="relative w-4 h-4" suppressHydrationWarning>
      {/* 常にMoonを表示（サーバー側との整合性保持） */}
      <Moon
        className={`absolute w-4 h-4 text-gray-700 dark:text-gray-200 transition-all duration-200 ${
          mounted && theme === 'dark'
            ? 'opacity-0 scale-75'
            : 'opacity-100 scale-100'
        }`}
      />
      {/* Sunは mounted かつ dark の時のみ表示 */}
      {mounted && (
        <Sun
          className={`absolute w-4 h-4 text-yellow-500 transition-all duration-200 ${
            theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        />
      )}
    </div>
  );
};
