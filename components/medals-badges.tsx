import type { ReactNode } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { calculateMedalCounts } from '@/lib/utils/medal-utils';
import { checkNotableHighlights } from '@/lib/utils/prototype-highlights';

import { ValueBadge } from '@/components/ui/badges/value-badge';

type MedalBadgesProps = {
  prototype: Prototype;
};

export const MedalBadges = ({ prototype }: MedalBadgesProps) => {
  const highlights = checkNotableHighlights(prototype);
  const hasAnyHighlight = Object.values(highlights).some((flag) => flag);

  if (!hasAnyHighlight) {
    return null;
  }

  const { viewMedals, goodMedals, commentMedals, cakeMedals } = calculateMedalCounts(prototype);

  const medals: ReactNode[] = [];

  for (let index = 0; index < viewMedals; index += 1) {
    medals.push(<ValueBadge key={`view-count-${index}`} value={`👀`} />);
  }

  for (let index = 0; index < goodMedals; index += 1) {
    medals.push(<ValueBadge key={`good-count-${index}`} value={`👍`} />);
  }

  for (let index = 0; index < commentMedals; index += 1) {
    medals.push(<ValueBadge key={`comment-count-${index}`} value={`💬`} />);
  }

  for (let index = 0; index < cakeMedals; index += 1) {
    medals.push(<ValueBadge key={`cake-count-${index}`} value={`🎂`} />);
  }

  const awards = prototype.awards ?? [];
  awards.forEach((award, index) => {
    const trimmedAward = award.trim();
    if (trimmedAward.length === 0) {
      return;
    }
    medals.push(<ValueBadge key={`award-${index}`} value={`🎖️ ${trimmedAward}`} />);
  });

  return <div className="mt-2 flex flex-wrap items-center gap-2">{medals}</div>;
};
