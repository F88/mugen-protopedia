import Link from 'next/link';

import { observatoryTheme } from '@/app/observatory/theme';

export type ObservatoryCardColorScheme =
  | 'gray'
  | 'yellow'
  | 'blue'
  | 'purple'
  | 'amber'
  | 'gold'
  | 'cyber';

export interface ObservatoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: ObservatoryCardColorScheme;
  href?: string;
  className?: string;
  titleSize?: string;
  descriptionSize?: string;
}

const colorStyles = observatoryTheme.cardColors;

export function ObservatoryCard({
  title,
  description,
  icon,
  color,
  href,
  className,
  titleSize = 'text-xl',
  descriptionSize = 'text-lg',
}: ObservatoryCardProps) {
  const styles = colorStyles[color];
  const isComingSoon = !href;

  const content = (
    <>
      <div
        className={`absolute inset-0 bg-linear-to-br ${styles.gradient} to-transparent dark:to-transparent opacity-50 ${
          !isComingSoon ? 'group-hover:opacity-100 transition-opacity' : ''
        }`}
      />
      <div
        className={`p-6 relative z-10 flex flex-col h-full ${className || ''}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.iconBg} ${styles.iconText}`}
          >
            {icon}
          </div>
          <h2
            className={`${titleSize} font-semibold ${
              isComingSoon
                ? 'text-gray-500 dark:text-gray-400'
                : `${styles.textColor} ${styles.hoverText} transition-colors`
            }`}
          >
            {title}
          </h2>
        </div>
        <p
          className={`${descriptionSize} ${
            isComingSoon
              ? 'text-gray-500 dark:text-gray-500'
              : styles.descriptionColor
          } flex-1`}
        >
          {description}
        </p>
        <div
          className={`mt-4 flex items-center text-sm font-medium ${
            isComingSoon
              ? 'text-gray-400 dark:text-gray-500'
              : `${styles.linkText} group-hover:translate-x-1 transition-transform`
          }`}
        >
          {isComingSoon ? 'Coming soon...' : <>Explore &rarr;</>}
        </div>
      </div>
    </>
  );

  if (isComingSoon) {
    return (
      <div
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-dashed border-gray-300 ${styles.cardBg} opacity-60 cursor-not-allowed backdrop-blur-[2px]`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href!}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 ${styles.cardBg} dark:border-gray-800 hover:shadow-lg transition-all duration-300 backdrop-blur-[2px]`}
    >
      {content}
    </Link>
  );
}
