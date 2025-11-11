'use client';

import React, { useId, useMemo } from 'react';

import { PrototypeSkeletonCardBaseProps } from '@/components/prototype/prototype-skeleton-card';
import { PrototypeIdBadge } from '@/components/ui/badges/prototype-id-badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import './skeleton-animations.css';
import { hashString } from './utils/skeleton-kind';

type DynamicAnimationVariant =
  | 'shuffle'
  | 'explode'
  | 'cascade'
  | 'orbit'
  | 'spin'
  | 'rainbow';

type PrototypeDynamicSkeletonCardProps = PrototypeSkeletonCardBaseProps & {
  variant?: DynamicAnimationVariant;
};

const DYNAMIC_ANIMATION_VARIANTS: DynamicAnimationVariant[] = [
  'shuffle',
  'explode',
  'cascade',
  'orbit',
  'spin',
  'rainbow',
];

// Deterministic selection to avoid re-picks on unrelated prop changes
// and to keep selection stable across renders.
const getDeterministicDynamicVariant = (
  basis: string | number,
): DynamicAnimationVariant => {
  const idx = Math.abs(hashString(basis)) % DYNAMIC_ANIMATION_VARIANTS.length;
  return DYNAMIC_ANIMATION_VARIANTS[idx];
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
  const getAnimationClass = () => {
    if (disableAnimation) {
      return 'bg-slate-200 dark:bg-slate-700';
    }

    switch (variant) {
      case 'shuffle':
        return 'skeleton-shuffle bg-slate-200 dark:bg-slate-700';
      case 'explode':
        return 'skeleton-explode bg-slate-200 dark:bg-slate-700';
      case 'cascade':
        return 'skeleton-cascade bg-slate-200 dark:bg-slate-700';
      case 'orbit':
        return 'skeleton-orbit bg-slate-200 dark:bg-slate-700';
      case 'spin':
        return 'skeleton-spin bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]';
      case 'rainbow':
        return 'skeleton-rainbow bg-gradient-to-r from-pink-400 via-indigo-500 to-cyan-400 dark:from-pink-600 dark:via-indigo-600 dark:to-cyan-500 bg-[length:300%_100%]';
      default:
        return 'bg-slate-200 dark:bg-slate-700';
    }
  };

  // Map index to delay class buckets to avoid inline styles
  const getDelayClass = () => {
    if (disableAnimation) {
      return '';
    }
    switch (variant) {
      case 'shuffle':
        return `shuffle-delay-${index % 10}`;
      case 'explode':
        return `explode-delay-${index <= 40 ? index : 40}`;
      case 'cascade':
        return `cascade-delay-${index <= 20 ? index : 20}`;
      case 'spin':
        return `spin-delay-${index % 10}`;
      case 'rainbow':
        return `rainbow-delay-${index % 10}`;
      case 'orbit':
        return `orbit-delay-${index <= 20 ? index : 20}`;
      default:
        return '';
    }
  };

  // Optional directional scatter for explode variant
  const getDirectionClass = () => {
    if (disableAnimation || variant !== 'explode') {
      return '';
    }
    // Cycle through available direction classes (0-9)
    return `explode-direction-${index % 10}`;
  };

  return (
    <div
      className={cn(
        'rounded transition-colors duration-200',
        getAnimationClass(),
        getDelayClass(),
        getDirectionClass(),
        className,
      )}
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
  // Use a deterministic basis: prefer the explicit ID, otherwise a stable useId seed
  const rid = useId();
  const selectedVariant = useMemo(() => {
    if (randomVariant) {
      // Per-mount random: use the unique, stable useId() seed only.
      // This makes each mounted skeleton pick a different variant,
      // while keeping it stable for the lifetime of the instance.
      return getDeterministicDynamicVariant(rid);
    }
    return variant;
  }, [randomVariant, rid, variant]);

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
