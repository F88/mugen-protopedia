'use client';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { PrototypeCard } from './prototype-card';
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
} & React.HTMLAttributes<HTMLDivElement>;

export const PrototypeContainer = ({
  prototype,
  isLoading = false,
  expectedPrototypeId,
  errorMessage,
  isFocused = false,
  ...htmlProps
}: PrototypeContainerProps) => {
  if (isLoading) {
    return (
      <div {...htmlProps}>
        <PrototypeSkeletonCard
          expectedPrototypeId={expectedPrototypeId}
          errorMessage={errorMessage}
          isFocused={isFocused}
        />
      </div>
    );
  }

  if (prototype == null) {
    return (
      <div {...htmlProps}>
        <PrototypeSkeletonCard
          expectedPrototypeId={expectedPrototypeId}
          errorMessage={errorMessage}
          isFocused={isFocused}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2" {...htmlProps}>
      <PrototypeCard prototype={prototype} isFocused={isFocused} />
    </div>
  );
};
