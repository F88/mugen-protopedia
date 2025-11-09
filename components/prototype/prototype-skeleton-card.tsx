'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PrototypeIdBadge } from '../ui/badges/prototype-id-badge';

type PrototypeSkeletonCardProps = {
  expectedPrototypeId?: number;
  errorMessage?: string;
  isFocused?: boolean;
};

const SkeletonBlock = ({ className }: { className: string }) => {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 transition-colors duration-200 ${className}`}
    />
  );
};

export const PrototypeSkeletonCard = ({
  expectedPrototypeId,
  errorMessage,
  isFocused = false,
}: PrototypeSkeletonCardProps) => {
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
      >
        <CardHeader>
          {/* ID */}
          <div className="grid grid-cols-2 gap-3">
            {typeof expectedPrototypeId === 'number' ? (
              <PrototypeIdBadge id={expectedPrototypeId} />
            ) : (
              <SkeletonBlock className="h-6 w-2/4" />
            )}
            <div className="flex items-center justify-end">
              <SkeletonBlock className="h-4 w-2/4" />
            </div>
          </div>

          {/* Description  */}
          <div className="mb-1">
            <SkeletonBlock className="h-8 w-3/4" />
          </div>

          <div className="mt-1">
            <SkeletonBlock className="h-4 w-full" />
            <div className="h-1" />
            <SkeletonBlock className="h-4 w-full" />
            <div className="h-1" />
            <SkeletonBlock className="h-4 w-9/16" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image  */}
          <div className="relative">
            <SkeletonBlock className="w-full aspect-video" />
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
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-full" />
          </div>

          {/* Age */}
          <SkeletonBlock className="h-4 w-full" />

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="h-4 w-18 rounded-full" />
            <SkeletonBlock className="h-4 w-16 rounded-full" />
            <SkeletonBlock className="h-4 w-16 rounded-full" />
            <SkeletonBlock className="h-4 w-24 rounded-full" />
            <SkeletonBlock className="h-4 w-12 rounded-full" />
            <SkeletonBlock className="h-4 w-12 rounded-full" />
            <SkeletonBlock className="h-4 w-16 rounded-full" />
            <SkeletonBlock className="h-4 w-16 rounded-full" />
            <SkeletonBlock className="h-4 w-12 rounded-full" />
            <SkeletonBlock className="h-4 w-12 rounded-full" />
            <SkeletonBlock className="h-4 w-12 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
