import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { StatBadge } from '@/components/ui/badges/stat-badge';

type PrototypeStatsProps = {
  prototype: Prototype;
};

export const PrototypeStats = ({ prototype }: PrototypeStatsProps) => {
  const viewCount = prototype.viewCount;
  const goodCount = prototype.goodCount;
  const commentCount = prototype.commentCount;

  const hasViewCount = typeof viewCount === 'number';
  const hasGoodCount = typeof goodCount === 'number';
  const hasCommentCount = typeof commentCount === 'number';

  return (
    <div className="mt-2 space-y-2 py-3">
      {/* <div className="mb-2 flex items-center gap-2"> */}
      {/* <StatBadge>Stats</StatBadge> */}
      {/* </div> */}
      <div className="flex flex-wrap gap-2">
        {hasViewCount && (
          <StatBadge
            label={'👀'}
            value={viewCount}
            wrapValueWithParens={false}
            className="bg-sky-300 text-sky-900 dark:bg-sky-500/80 dark:text-sky-50"
            aria-label={`View Count ${viewCount}`}
          />
        )}
        {hasGoodCount && (
          <StatBadge
            label={'👍'}
            value={goodCount}
            wrapValueWithParens={false}
            className="bg-emerald-300 text-emerald-900 dark:bg-emerald-600/80 dark:text-emerald-50"
            aria-label={`Good Count ${goodCount}`}
          />
        )}
        {hasCommentCount && (
          <StatBadge
            label={'💬'}
            value={commentCount}
            wrapValueWithParens={false}
            className="bg-slate-300 text-slate-900 dark:bg-slate-600/80 dark:text-slate-50"
            aria-label={`Comment Count ${commentCount}`}
          />
        )}
      </div>
    </div>
  );
};
