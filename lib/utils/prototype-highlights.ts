import type { NormalizedPrototype as Prototype } from '@/lib/api/prototypes';
import { isBirthDay } from '@/lib/utils/anniversary-nerd';

/**
 * Prototypeの特筆すべきハイライトの有無を示すフラグ一覧
 */
export interface NotableHighlights {
  /**
   *  受賞歴があるかどうか
   */
  hasAwards: boolean;
  /**
   * 閲覧数のマイルストーンに到達しているかどうか
   */
  hasViewMilestone: boolean;
  /**
   * いいね数のマイルストーンに到達しているかどうか
   */
  hasGoodMilestone: boolean;
  /**
   * コメント数のマイルストーンに到達しているかどうか
   */
  hasCommentMilestone: boolean;
  /**
   * 本日が誕生日かどうか
   */
  isBirthDay: boolean;
}

/**
 * Prototypeに特筆すべきハイライトがあるかを判定する。
 *
 * @param prototype 判定対象のPrototype
 * @returns 特筆すべきハイライトの有無を示すフラグ一覧
 */
export const checkNotableHighlights = (
  prototype: Prototype,
): NotableHighlights => {
  const hasAwards = Array.isArray(prototype.awards)
    ? prototype.awards.some(
        (award) => typeof award === 'string' && award.trim().length > 0,
      )
    : false;

  const hasViewMilestone = prototype.viewCount >= 1_000;
  const hasGoodMilestone = prototype.goodCount >= 10;
  const hasCommentMilestone = prototype.commentCount >= 5;

  const isReleaseBirthday = Boolean(
    prototype.releaseDate && isBirthDay(prototype.releaseDate),
  );

  return {
    hasAwards,
    hasViewMilestone,
    hasGoodMilestone,
    hasCommentMilestone,
    isBirthDay: isReleaseBirthday,
  };
};
