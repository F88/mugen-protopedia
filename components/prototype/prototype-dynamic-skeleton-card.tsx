'use client';

import { useMemo } from 'react';

import { PrototypeSkeletonCardBaseProps } from '@/components/prototype/prototype-skeleton-card';
import { PrototypeIdBadge } from '@/components/ui/badges/prototype-id-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import './skeleton-animations.css';

type DynamicAnimationVariant = 'shuffle' | 'explode' | 'ripple' | 'cascade';

type PrototypeDynamicSkeletonCardProps = PrototypeSkeletonCardBaseProps & {
  variant?: DynamicAnimationVariant;
};

const DYNAMIC_ANIMATION_VARIANTS: DynamicAnimationVariant[] = [
  'shuffle',
  'explode',
  'ripple',
  'cascade',
];

const getRandomDynamicVariant = (): DynamicAnimationVariant => {
  const randomIndex = Math.floor(
    Math.random() * DYNAMIC_ANIMATION_VARIANTS.length,
  );
  return DYNAMIC_ANIMATION_VARIANTS[randomIndex];
};

const DynamicSkeletonBlock = ({
  className,
  variant = 'shuffle',
  disableAnimation = false,
  index = 0,
}: {
  className: string;
  variant?: DynamicAnimationVariant;
  disableAnimation?: boolean;
  index?: number;
}) => {
  // Generate stable random delay based on index
  const stableRandomDelay = useMemo(() => {
    // Use index to create pseudo-random but stable delay
    return ((index * 7) % 10) / 20; // Creates values between 0 and 0.45
  }, [index]);

  const getAnimationClass = () => {
    if (disableAnimation) {
      return 'bg-slate-200 dark:bg-slate-700';
    }

    switch (variant) {
      case 'shuffle':
        return 'skeleton-shuffle bg-slate-200 dark:bg-slate-700';
      case 'explode':
        return 'skeleton-explode bg-slate-200 dark:bg-slate-700';
      case 'ripple':
        return 'skeleton-ripple bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700';
      case 'cascade':
        return 'skeleton-cascade bg-slate-200 dark:bg-slate-700';
      default:
        return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  const getAnimationStyle = () => {
    if (disableAnimation) {
      return {};
    }

    // Add staggered delays for cascade effect
    const cascadeDelay = variant === 'cascade' ? index * 0.1 : 0;
    // Stable pseudo-random delays for shuffle effect
    const shuffleDelay = variant === 'shuffle' ? stableRandomDelay : 0;

    switch (variant) {
      case 'shuffle':
        return {
          animation: `skeleton-shuffle 2s ease-in-out infinite`,
          animationDelay: `${shuffleDelay}s`,
        };
      case 'explode':
        return {
          animation: `skeleton-explode 3s ease-in-out infinite`,
          animationDelay: `${index * 0.05}s`,
        };
      case 'ripple':
        return {
          animation: `skeleton-ripple 2s ease-in-out infinite`,
          animationDelay: `${index * 0.1}s`,
        };
      case 'cascade':
        return {
          animation: `skeleton-cascade 2s ease-in-out infinite`,
          animationDelay: `${cascadeDelay}s`,
        };
      default:
        return {};
    }
  };

  return (
    <div
      className={cn(
        'rounded transition-colors duration-200',
        getAnimationClass(),
        className,
      )}
      style={getAnimationStyle()}
    />
  );
};

export const PrototypeDynamicSkeletonCard = ({
  expectedPrototypeId,
  errorMessage,
  isFocused = false,
  variant = 'shuffle',
  disableAnimation = false,
  randomVariant = false,
}: PrototypeDynamicSkeletonCardProps) => {
  // Use useMemo to ensure the random variant is stable across re-renders
  const selectedVariant = useMemo(() => {
    if (randomVariant) {
      return getRandomDynamicVariant();
    }
    return variant;
  }, [randomVariant, variant]);

  const showErrorOnImage = typeof errorMessage === 'string';
  const showPrototypeIdOnImage =
    !showErrorOnImage && typeof expectedPrototypeId === 'number';

  const getBorderClass = () => {
    if (isFocused) {
      return 'focus-border';
    } else {
      return 'gray-border';
    }
  };

  return (
    <div className="border-4 rounded-lg p-1 transparent-border">
      <Card
        className={cn(
          'group relative h-full border-2 transition-all duration-200 hover:shadow-md',
          getBorderClass(),
        )}
        aria-selected={isFocused}
        data-selected={isFocused ? 'true' : 'false'}
      >
        <CardHeader>
          {/* ID */}
          <div className="grid grid-cols-2 gap-3">
            {typeof expectedPrototypeId === 'number' ? (
              <PrototypeIdBadge id={expectedPrototypeId} />
            ) : (
              <DynamicSkeletonBlock
                className="h-6 w-2/4"
                variant={selectedVariant}
                disableAnimation={disableAnimation}
                index={0}
              />
            )}
            <div className="flex items-center justify-end">
              <DynamicSkeletonBlock
                className="h-4 w-2/4"
                variant={selectedVariant}
                disableAnimation={disableAnimation}
                index={1}
              />
            </div>
          </div>

          {/* Description  */}
          <div className="mb-1">
            <DynamicSkeletonBlock
              className="h-8 w-3/4"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={2}
            />
          </div>

          <div className="mt-1">
            <DynamicSkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={3}
            />
            <div className="h-1" />
            <DynamicSkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={4}
            />
            <div className="h-1" />
            <DynamicSkeletonBlock
              className="h-4 w-9/16"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={5}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image  */}
          <div className="relative">
            <DynamicSkeletonBlock
              className="w-full aspect-video"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={6}
            />
            {showErrorOnImage && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl font-bold text-slate-400 dark:text-slate-500 text-center px-2">
                {errorMessage}
              </span>
            )}
            {showPrototypeIdOnImage && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl font-bold text-slate-400 dark:text-slate-500">
                {expectedPrototypeId}
              </span>
            )}
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <DynamicSkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={7}
            />
            <DynamicSkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={8}
            />
            <DynamicSkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
              index={9}
            />
          </div>

          {/* Age */}
          <DynamicSkeletonBlock
            className="h-4 w-full"
            variant={selectedVariant}
            disableAnimation={disableAnimation}
            index={10}
          />

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {[...Array(12)].map((_, i) => (
              <DynamicSkeletonBlock
                key={i}
                className={cn(
                  'h-4 rounded-full',
                  i % 3 === 0 ? 'w-24' : i % 3 === 1 ? 'w-16' : 'w-12',
                )}
                variant={selectedVariant}
                disableAnimation={disableAnimation}
                index={11 + i}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
