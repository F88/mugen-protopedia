import Link from 'next/link';

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

const colorStyles = {
  gray: {
    gradient: 'from-gray-50 dark:from-gray-800/20',
    cardBg: 'bg-gray-200/70 dark:bg-gray-800/70',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconText: 'text-gray-600 dark:text-gray-300',
    hoverText: 'group-hover:text-gray-600 dark:group-hover:text-gray-400',
    linkText: 'text-gray-600 dark:text-gray-400',
  },
  yellow: {
    gradient: 'from-yellow-50 dark:from-yellow-900/20',
    cardBg: 'bg-yellow-100/70 dark:bg-yellow-900/70',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800',
    iconText: 'text-yellow-600 dark:text-yellow-300',
    hoverText: 'group-hover:text-yellow-600 dark:group-hover:text-yellow-400',
    linkText: 'text-yellow-600 dark:text-yellow-400',
  },
  blue: {
    gradient: 'from-blue-50 dark:from-blue-900/20',
    cardBg: 'bg-blue-200/70 dark:bg-blue-900/70',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    iconText: 'text-blue-600 dark:text-blue-300',
    hoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    linkText: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    gradient: 'from-purple-50 dark:from-purple-900/20',
    cardBg: 'bg-purple-200/70 dark:bg-purple-900/70',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    iconText: 'text-purple-600 dark:text-purple-300',
    hoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
    linkText: 'text-purple-600 dark:text-purple-400',
  },
  amber: {
    gradient: 'from-amber-50 dark:from-amber-900/20',
    cardBg: 'bg-amber-100/70 dark:bg-amber-900/70',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    iconText: 'text-amber-600 dark:text-amber-300',
    hoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
    linkText: 'text-amber-600 dark:text-amber-400',
  },
  gold: {
    gradient: 'from-yellow-100 dark:from-yellow-600/30',
    cardBg:
      'bg-gradient-to-br from-yellow-200/80 via-amber-200/80 to-yellow-300/80 dark:from-yellow-700/80 dark:via-amber-700/80 dark:to-yellow-600/80',
    iconBg:
      'bg-gradient-to-br from-yellow-300 to-amber-400 dark:from-yellow-500 dark:to-amber-600',
    iconText: 'text-yellow-900 dark:text-yellow-100',
    hoverText: 'group-hover:text-yellow-700 dark:group-hover:text-yellow-300',
    linkText: 'text-yellow-700 dark:text-yellow-300',
  },
  cyber: {
    gradient: 'from-gray-100 dark:from-green-500/20',
    cardBg: 'bg-gray-100/70 dark:bg-black/90',
    iconBg: 'bg-gray-300 dark:bg-green-900/40',
    iconText: 'text-gray-700 dark:text-green-400',
    hoverText: 'group-hover:text-gray-900 dark:group-hover:text-green-300',
    linkText: 'text-gray-700 dark:text-green-400',
  },
};

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
                : `text-gray-900 dark:text-white ${styles.hoverText} transition-colors`
            }`}
          >
            {title}
          </h2>
        </div>
        <p
          className={`${descriptionSize} ${
            isComingSoon
              ? 'text-gray-500 dark:text-gray-500'
              : 'text-gray-600 dark:text-gray-400'
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
