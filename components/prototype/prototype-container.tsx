'use client';

import { useId } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';

import { pickSkeletonKind } from './utils/skeleton-kind';

import { PrototypeCard } from './prototype-card';
import { PrototypeDynamicSkeletonCard } from './prototype-dynamic-skeleton-card';
import { PrototypeSkeletonCard } from './prototype-skeleton-card';

type PrototypeContainerProps = {
  prototype?: Prototype;
  isLoading?: boolean;
  // Explicitly specified prototype ID for SkeletonCard
  expectedPrototypeId?: number;
  // Error message to display when failed to load prototype
  errorMessage?: string;
  // Focus state for styling the card
  isFocused?: boolean;
  onClick?: (e: React.MouseEvent) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const PrototypeContainer = ({
  prototype,
  isLoading = false,
  expectedPrototypeId,
  errorMessage,
  isFocused = false,
  onClick,
  ...htmlProps
}: PrototypeContainerProps) => {
  const rid = useId();
  const selectedKind = pickSkeletonKind({
    id: expectedPrototypeId,
    seed: rid,
  });

  const renderRandomSkeleton = () =>
    selectedKind === 'dynamic' ? (
      <PrototypeDynamicSkeletonCard
        expectedPrototypeId={expectedPrototypeId}
        errorMessage={errorMessage}
        isFocused={isFocused}
        randomVariant={true}
        disableAnimation={!!errorMessage}
      />
    ) : (
      <PrototypeSkeletonCard
        expectedPrototypeId={expectedPrototypeId}
        errorMessage={errorMessage}
        isFocused={isFocused}
        randomVariant={true}
        disableAnimation={!!errorMessage}
      />
    );

  if (isLoading) {
    return <div {...htmlProps}>{renderRandomSkeleton()}</div>;
  }

  if (prototype == null) {
    return <div {...htmlProps}>{renderRandomSkeleton()}</div>;
  }

  return (
    <div className="space-y-2" {...htmlProps}>
      <PrototypeCard
        prototype={prototype}
        isFocused={isFocused}
        onClick={onClick}
      />
    </div>
  );
};
