'use client';

import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { cn } from '@/lib/utils';
import {
  buildMedalString,
  calculateMedalCounts,
} from '@/lib/utils/medal-utils';
import { checkNotableHighlights } from '@/lib/utils/prototype-highlights';

type MedalsProps = {
  prototype: Prototype;
  className?: string;
};

type MedalsComponent = (props: MedalsProps) => ReactElement | null;

type AnimatedMedalStringProps = {
  value: string;
  className?: string;
};

const DISPLAY_INTERVAL_MS = 500;

export const Medals: MedalsComponent = ({ prototype, className }) => {
  const highlights = checkNotableHighlights(prototype);
  const hasAnyHighlight = useMemo(
    () => Object.values(highlights).some(Boolean),
    [highlights],
  );

  const medalCounts = useMemo(
    () => calculateMedalCounts(prototype),
    [prototype],
  );
  const medalString = useMemo(
    () => buildMedalString(medalCounts),
    [medalCounts],
  );

  if (!hasAnyHighlight || medalString.length === 0) {
    return null;
  }

  return <AnimatedMedalString value={medalString} className={className} />;
};

const AnimatedMedalString = ({
  value,
  className,
}: AnimatedMedalStringProps) => {
  const [visibleCount, setVisibleCount] = useState(0);

  const segments = useMemo(() => {
    if ('Segmenter' in Intl) {
      const segmenter = new Intl.Segmenter(undefined, {
        granularity: 'grapheme',
      });
      return Array.from(segmenter.segment(value), (entry) => entry.segment);
    }

    return Array.from(value);
  }, [value]);

  useEffect(() => {
    const resetTimeoutId = window.setTimeout(() => {
      setVisibleCount(0);
    }, 0);

    if (segments.length === 0) {
      return () => {
        window.clearTimeout(resetTimeoutId);
      };
    }

    const intervalId = window.setInterval(() => {
      setVisibleCount((previous) => {
        if (previous >= segments.length) {
          window.clearInterval(intervalId);
          return previous;
        }

        const next = previous + 1;

        if (next >= segments.length) {
          window.clearInterval(intervalId);
        }

        return next;
      });
    }, DISPLAY_INTERVAL_MS);

    return () => {
      window.clearTimeout(resetTimeoutId);
      window.clearInterval(intervalId);
    };
  }, [segments]);

  const displayed = segments
    .slice(0, Math.min(visibleCount, segments.length))
    .join('');

  return (
    <span
      className={cn('text-lg leading-none', className)}
      aria-label={value}
      aria-live="polite"
    >
      {displayed}
    </span>
  );
};
