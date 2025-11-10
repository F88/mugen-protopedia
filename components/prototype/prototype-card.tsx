'use client';

import { useState } from 'react';

import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { cn } from '@/lib/utils';
import { formatAgeFromDate, formatDateForDisplay } from '@/lib/utils/format';
import { checkNotableHighlights } from '@/lib/utils/prototype-highlights';
import { buildTagLink } from '@/lib/utils/prototype-utils';

import { Castle, SquarePlay, UserRound } from 'lucide-react';

import { Medals } from '@/components/medals';
import { PrototypeMainImage } from '@/components/prototype/prototype-main-image';
import { PrototypeStats } from '@/components/prototype/prototype-stats';
import { PrototypeIdBadge } from '@/components/ui/badges/prototype-id-badge';
import { StatusBadge } from '@/components/ui/badges/status-badge';
import { ValueBadge } from '@/components/ui/badges/value-badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type PrototypeCardProps = {
  prototype: Prototype;
  isFocused?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export const PrototypeCard = ({
  prototype,
  isFocused = false,
  onClick,
}: PrototypeCardProps) => {
  const [expanded, setExpanded] = useState(false);

  // Highlights
  const highlights = checkNotableHighlights(prototype);
  // console.debug('Prototype has any notable highlights!!', { highlights });
  const sholdHighlight = highlights.hasAwards;
  const isAnniversary = highlights.isBirthDay;

  // Priority: Anniversary > Awards (only one highlight at a time)
  const getBorderClass = () => {
    if (isFocused) {
      if (isAnniversary) return 'focus-anniversary-border';
      if (sholdHighlight) return 'focus-highlight-border';
      return 'focus-border';
    } else {
      if (isAnniversary) return 'anniversary-border';
      if (sholdHighlight) return 'highlight-border';
      return 'gray-border';
    }
  };

  const urlOfPageForPrototype = `https://protopedia.net/prototype/${prototype.id}`;

  const summary = (prototype.summary ?? '').trim();
  const isLongSummary = summary.length > 100;
  const displayedSummary =
    expanded || !isLongSummary ? summary : summary.slice(0, 100);

  const formattedDate = formatDateForDisplay(prototype.releaseDate);
  const elapsed = formatAgeFromDate(prototype.releaseDate);

  const officialLink =
    typeof prototype.officialLink === 'string'
      ? prototype.officialLink.trim()
      : '';

  const videoUrls: { label: string; url?: string }[] = [];
  const videoUrl =
    typeof prototype.videoUrl === 'string' ? prototype.videoUrl.trim() : '';
  if (videoUrl.length > 0) {
    videoUrls.push({ label: 'Video Link', url: videoUrl });
  }

  // console.log(prototype);

  const awardBadges = (prototype.awards ?? []).map((award, index) => (
    <ValueBadge
      key={`award-${award}-${index}`}
      value={`🎖️ ${award}`}
      size="responsive"
      className="bg-linear-to-r from-amber-300 via-amber-200 to-amber-400 text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.35)] border border-amber-300/70 dark:from-amber-500/80 dark:via-amber-400/80 dark:to-amber-600/80 dark:text-slate-900 dark:border-amber-400/60"
    />
  ));

  const eventBadges = (prototype.events ?? []).map((event, index) => (
    <ValueBadge
      //
      key={`event-${event}-${index}`}
      value={`🎪 ${event}`}
      size="responsive"
    />
  ));

  const tagBadges = (prototype.tags ?? []).map((tag, index) => (
    <ValueBadge
      key={`tag-${tag}-${index}`}
      value={`🏷️ ${tag}`}
      size="responsive"
      href={buildTagLink(tag)}
    />
  ));

  const teamBadges = prototype.teamNm
    ? [
        <ValueBadge
          key="team-name"
          icon={<Castle aria-hidden className="h-4 w-4" />}
          value={prototype.teamNm}
          size="responsive"
        />,
      ]
    : [];
  const userBadges = prototype.users.map((user, index) => (
    <ValueBadge
      key={`user-${user}-${index}`}
      icon={<UserRound aria-hidden className="h-4 w-4" />}
      value={user}
      size="responsive"
    />
  ));

  const metaBadges = [
    <ValueBadge
      key="meta-date"
      value={`🎉 ${formattedDate} (${elapsed})`}
      className="w-full justify-center text-center"
      nowrap
      size="responsive"
    />,
  ];

  const videoBadges =
    videoUrls.length > 0
      ? [
          <ValueBadge
            key="video"
            icon={<SquarePlay aria-hidden className="h-4 w-4" />}
            value={`️1`}
            size="responsive"
          />,
        ]
      : [];

  const materialBadges = (prototype.materials ?? []).map((material, index) => (
    <ValueBadge
      key={`material-${material}-${index}`}
      value={`📦 ${material}`}
      size="responsive"
    />
  ));

  const badgeElements = [
    // ...metaBadges,
    ...awardBadges,
    ...eventBadges,
    ...teamBadges,
    ...userBadges,
    ...videoBadges,
    ...tagBadges,
    ...materialBadges,
  ];

  return (
    <div className="border-4 rounded-lg p-1 transparent-border">
      <Card
        className={cn(
          'group relative h-full border-2 transition-all duration-200 hover:shadow-md cursor-pointer',
          'bg-card text-card-foreground', // テーマ対応の背景色とテキスト色
          getBorderClass(),
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
      >
        {/* Main content */}
        {/* <Medals prototype={prototype} /> */}
        <CardHeader className="">
          {/* ID, status, and medals */}
          <div className="flex w-full items-start gap-2">
            <PrototypeIdBadge id={prototype.id} />
            <Medals prototype={prototype} className="self-center" />
            <StatusBadge status={prototype.status} className="ml-auto" />
          </div>
          <CardTitle className="text-xl">
            <a
              href={urlOfPageForPrototype}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {prototype.prototypeNm}
            </a>
          </CardTitle>
          <CardDescription>
            <div>
              {/* Summary */}
              <p className="font-semibold">
                {displayedSummary}
                {!expanded && isLongSummary ? '…' : ''}
              </p>
              {isLongSummary && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setExpanded((previous) => !previous)}
                  className="h-auto p-0 text-sm text-blue-600"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          </CardDescription>
          {/* <CardAction> */}
          {/* <Button variant="link">#{prototype.id}</Button> */}
          {/* </CardAction> */}
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Main Image */}
          <PrototypeMainImage prototype={prototype} />

          {/* Official link of prototype */}
          {officialLink && (
            <>
              {/* <a
                href={officialLink}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                🔗 {officialLink}
              </a> */}
              <ValueBadge
                value={`🔗 ${officialLink}`}
                size="responsive"
                href={officialLink}
                className="w-full"
              />
            </>
          )}

          {/* x-counts */}
          <PrototypeStats prototype={prototype} />

          {/* Badges */}
          {metaBadges.length > 0 && (
            <div className="flex flex-wrap gap-2">{metaBadges}</div>
          )}
          {badgeElements.length > 0 && (
            <div className="flex flex-wrap gap-2">{badgeElements}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
