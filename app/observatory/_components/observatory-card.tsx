import type { Route } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { observatoryTheme } from '../theme';

export type ObservatoryCardColorScheme =
  | 'gray'
  | 'yellow'
  | 'pink'
  | 'purple'
  | 'amber'
  | 'gold'
  | 'cyber'
  | 'newspaper';

export interface ObservatoryCardProps {
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  color: ObservatoryCardColorScheme;
  /**
   * Destination link. Accepts an internal typed `Route` or an absolute
   * external URL (e.g. `https://example.com`). External URLs are opened in a
   * new tab. When omitted, the card is rendered in a "Coming soon" state.
   */
  href?: Route | (string & {});
  className?: string;
  /** Extra class names applied to the title (`<h2>`) only, e.g. a font. */
  titleClassName?: string;
  titleSize?: string;
  descriptionSize?: string;
  /**
   * Optional background image URL. Rendered as a subtle, low-opacity layer
   * behind the card content so text stays readable.
   */
  backgroundImage?: string;
}

/** Detects an absolute external URL (http/https). */
function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

const colorStyles = observatoryTheme.cardColors;

export function ObservatoryCard({
  title,
  description,
  icon,
  color,
  href,
  className,
  titleClassName,
  titleSize = 'text-xl',
  descriptionSize = 'text-lg',
  backgroundImage,
}: ObservatoryCardProps) {
  const styles = colorStyles[color];
  const isComingSoon = href == null;
  const isExternal = href != null && isExternalHref(href);

  const content = (
    <>
      {backgroundImage != null ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : null}
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
            className={`${titleSize} font-semibold inline-flex items-center gap-1.5 ${
              isComingSoon
                ? 'text-gray-500 dark:text-gray-400'
                : `${styles.textColor} ${styles.hoverText} transition-colors`
            } ${titleClassName ?? ''}`}
          >
            {title}
            {isExternal ? (
              <ExternalLink
                aria-label="External site (opens in a new tab)"
                role="img"
                className="h-[0.7em] w-[0.7em] shrink-0 opacity-70"
              />
            ) : null}
          </h2>
        </div>
        <div
          className={`${descriptionSize} ${
            isComingSoon
              ? 'text-gray-500 dark:text-gray-500'
              : styles.descriptionColor
          } flex-1`}
        >
          {typeof description === 'string' ? <p>{description}</p> : description}
        </div>
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

  const cardClassName = `group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 ${styles.cardBg} dark:border-gray-800 hover:shadow-lg transition-all duration-300 backdrop-blur-[2px]`;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={cardClassName}>
      {content}
    </Link>
  );
}
