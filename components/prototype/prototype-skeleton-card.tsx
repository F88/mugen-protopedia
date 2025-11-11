'use client';
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PrototypeIdBadge } from '../ui/badges/prototype-id-badge';

type AnimationVariant = 'shimmer' | 'pulse' | 'twinkle';

type PrototypeSkeletonCardProps = {
  expectedPrototypeId?: number;
  errorMessage?: string;
  isFocused?: boolean;
  variant?: AnimationVariant;
  disableAnimation?: boolean;
  randomVariant?: boolean;
};

const ANIMATION_VARIANTS: AnimationVariant[] = ['shimmer', 'pulse', 'twinkle'];

const getRandomVariant = (): AnimationVariant => {
  const randomIndex = Math.floor(Math.random() * ANIMATION_VARIANTS.length);
  return ANIMATION_VARIANTS[randomIndex];
};

const SkeletonBlock = ({
  className,
  variant = 'shimmer',
  disableAnimation = false,
}: {
  className: string;
  variant?: AnimationVariant;
  disableAnimation?: boolean;
}) => {
  const getAnimationClass = () => {
    if (disableAnimation) {
      return 'bg-slate-200 dark:bg-slate-700';
    }

    switch (variant) {
      case 'shimmer':
        return 'skeleton-shimmer bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]';
      case 'pulse':
        return 'skeleton-pulse bg-slate-200 dark:bg-slate-700';
      case 'twinkle':
        return 'skeleton-twinkle bg-slate-200 dark:bg-slate-700';
      default:
        return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  const getAnimationStyle = () => {
    if (disableAnimation) {
      return {};
    }

    switch (variant) {
      case 'shimmer':
        return { animation: 'skeleton-shimmer 2s ease-in-out infinite' };
      case 'pulse':
        return { animation: 'skeleton-pulse 2s ease-in-out infinite' };
      case 'twinkle':
        return { animation: 'skeleton-twinkle 3s ease-in-out infinite' };
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

export const PrototypeSkeletonCard = ({
  expectedPrototypeId,
  errorMessage,
  isFocused = false,
  variant = 'shimmer',
  disableAnimation = false,
  randomVariant = false,
}: PrototypeSkeletonCardProps) => {
  // Use useMemo to ensure the random variant is stable across re-renders
  const selectedVariant = useMemo(() => {
    if (randomVariant) {
      return getRandomVariant();
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
              <SkeletonBlock
                className="h-6 w-2/4"
                variant={selectedVariant}
                disableAnimation={disableAnimation}
              />
            )}
            <div className="flex items-center justify-end">
              <SkeletonBlock
                className="h-4 w-2/4"
                variant={selectedVariant}
                disableAnimation={disableAnimation}
              />
            </div>
          </div>

          {/* Description  */}
          <div className="mb-1">
            <SkeletonBlock
              className="h-8 w-3/4"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
          </div>

          <div className="mt-1">
            <SkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <div className="h-1" />
            <SkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <div className="h-1" />
            <SkeletonBlock
              className="h-4 w-9/16"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image  */}
          <div className="relative">
            <SkeletonBlock
              className="w-full aspect-video"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
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
            <SkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
          </div>

          {/* Age */}
          <SkeletonBlock
            className="h-4 w-full"
            variant={selectedVariant}
            disableAnimation={disableAnimation}
          />

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <SkeletonBlock
              className="h-4 w-24 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-18 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-16 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-16 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-24 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-12 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-12 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-16 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-16 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-12 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-12 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
            <SkeletonBlock
              className="h-4 w-12 rounded-full"
              variant={selectedVariant}
              disableAnimation={disableAnimation}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
