import { PrototypeContainer } from '@/components/prototype/prototype-container';
import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';

type PrototypeSlot = {
  id: number;
  prototype?: Prototype;
  expectedPrototypeId?: number;
  errorMessage?: string | null;
  isLoading: boolean;
};

interface PrototypeGridProps {
  prototypeSlots: PrototypeSlot[];
  currentFocusIndex: number;
  onCardClick: (index: number) => void;
}

export function PrototypeGrid({
  prototypeSlots,
  currentFocusIndex,
  onCardClick,
}: PrototypeGridProps) {
  if (prototypeSlots.length === 0) {
    return null;
  }

  return (
    <div className="min-h-full">
      {/*
       sm (40rem 640px): 2,
       md (48rem 768px): 2,
       lg (64rem 1,024px): 2,
       xl (80rem 1,280px): 2,
       2xl (96rem 1,536px):3
       3xl (120rem 1,920px):3
       4xl (160rem 2,560px):6
        */}
      <div className="grid gap-6 p-1 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-3 4xl:grid-cols-6">
        {prototypeSlots.map(
          ({ id, prototype, isLoading, expectedPrototypeId, errorMessage }, index) => (
            <PrototypeContainer
              key={id}
              data-prototype-id={id}
              prototype={prototype}
              isLoading={isLoading}
              expectedPrototypeId={expectedPrototypeId}
              errorMessage={errorMessage ?? undefined}
              isFocused={index === currentFocusIndex}
              className="cursor-pointer"
              onClick={() => onCardClick(index)}
            />
          ),
        )}
      </div>
    </div>
  );
}
