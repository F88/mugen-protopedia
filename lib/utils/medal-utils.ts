import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { checkNotableHighlights } from './prototype-highlights';
import { calculateAge } from './anniversary-nerd';

export type MedalCounts = {
  viewMedals: number;
  goodMedals: number;
  commentMedals: number;
  awardMedals: number;
  cakeMedals: number;
  candleMedals: number;
};

const VIEW_DIVISOR = 1_000;
const GOOD_DIVISOR = 10;
const COMMENT_DIVISOR = 5;

function normalizeCount(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

export function calculateMedalCounts(prototype: Prototype): MedalCounts {
  const highlights = checkNotableHighlights(prototype);

  const viewMedals = Math.floor(normalizeCount(prototype.viewCount) / VIEW_DIVISOR);
  const goodMedals = Math.floor(normalizeCount(prototype.goodCount) / GOOD_DIVISOR);
  const commentMedals = Math.floor(normalizeCount(prototype.commentCount) / COMMENT_DIVISOR);

  const awardMedals = (prototype.awards ?? []).length;

  let cakeMedals = 0;
  let candleMedals = 0;
  if (highlights.isBirthDay) {
    cakeMedals++;
    const age = calculateAge(prototype.releaseDate);
    candleMedals = age.years;
  }

  return {
    viewMedals,
    goodMedals,
    commentMedals,
    awardMedals,
    cakeMedals,
    candleMedals,
  };
}

export function buildMedalString(counts: MedalCounts): string {
  const { cakeMedals, awardMedals, viewMedals, goodMedals, commentMedals, candleMedals } = counts;

  return [
    '🎂'.repeat(cakeMedals),
    '🕯️'.repeat(candleMedals),
    '🎖️'.repeat(awardMedals),
    '👀'.repeat(viewMedals),
    '👍'.repeat(goodMedals),
    '💬'.repeat(commentMedals),
  ]
    .filter((segment) => segment.length > 0)
    .join('');
}
