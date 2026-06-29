import {
  normalizePrototype as normalizeUpstreamPrototype,
  type UpstreamPrototype,
} from 'promidas/fetcher';
import type {
  StatusCode,
  ReleaseFlagCode,
  LicenseTypeCode,
  ThanksFlagCode,
} from 'promidas/types';

export type { UpstreamPrototype };

export type PrototypeForMpp = {
  /* ID */
  readonly id: number;

  /* Basic information */
  readonly prototypeNm: string;

  /** Pipe-separated tags string from upstream API */
  readonly tags?: readonly string[];

  readonly teamNm: string;

  /** Pipe-separated tags string from upstream API */
  readonly users: readonly string[];

  readonly summary?: string;
  readonly status: StatusCode;
  readonly releaseFlg: ReleaseFlagCode;

  // uuid: string;
  // nid?: string;

  /* Times  */
  readonly createId?: number;
  readonly createDate: string;
  readonly updateId?: number;
  readonly updateDate?: string;
  readonly releaseDate?: string;

  readonly revision: number;

  /** Pipe-separated tags string from upstream API */
  readonly awards?: readonly string[];

  readonly freeComment: string;
  readonly systemDescription?: string;

  // counts
  readonly viewCount: number;
  readonly goodCount: number;
  readonly commentCount: number;

  // URLs

  /** URL of YouTube or Vimeo */
  readonly videoUrl?: string;

  /* URL of eyecatch image */
  readonly mainUrl: string;

  /* URLs of related link */
  readonly relatedLink?: string;
  readonly relatedLink2?: string;
  readonly relatedLink3?: string;
  readonly relatedLink4?: string;
  readonly relatedLink5?: string;

  // License
  readonly licenseType: LicenseTypeCode;

  // Others
  readonly thanksFlg: ThanksFlagCode;

  /** Pipe-separated tags string from upstream API */
  readonly events?: readonly string[];

  readonly officialLink?: string;

  /** Pipe-separated tags string from upstream API */
  readonly materials?: readonly string[];

  // slideMode?: number;
};

/**
 * Normalize an upstream prototype into the app-internal {@link PrototypeForMpp}
 * shape.
 *
 * The actual normalization (pipe-separated splitting, JST -> UTC timestamps,
 * and default values for the fields that `protopedia-api-v2-client` v3 marks
 * optional) is delegated to `promidas`, so this single source of truth stays in
 * sync with the ProtoPedia data model. This adapter only bridges the two type
 * shapes: `releaseDate` / `updateDate` stay optional and pass through as
 * `undefined` when the API omits them (the API can return null here), while the
 * other fields keep `PrototypeForMpp`'s required contract via promidas's
 * defaults. It drops the promidas-only fields (`uuid`, `nid`, `slideMode`) the
 * app does not use. Both shapes are `readonly`, so arrays pass through without
 * copying.
 */
export function normalizePrototypeForMpp(p: UpstreamPrototype): PrototypeForMpp {
  const n = normalizeUpstreamPrototype(p);
  return {
    id: n.id,
    prototypeNm: n.prototypeNm,
    tags: n.tags,
    teamNm: n.teamNm,
    users: n.users,
    summary: n.summary,
    status: n.status,
    releaseFlg: n.releaseFlg,
    createId: n.createId,
    createDate: n.createDate,
    updateId: n.updateId,
    updateDate: n.updateDate,
    releaseDate: n.releaseDate,
    revision: n.revision ?? 0,
    awards: n.awards,
    freeComment: n.freeComment,
    systemDescription: n.systemDescription,
    viewCount: n.viewCount,
    goodCount: n.goodCount,
    commentCount: n.commentCount,
    videoUrl: n.videoUrl,
    mainUrl: n.mainUrl,
    relatedLink: n.relatedLink,
    relatedLink2: n.relatedLink2,
    relatedLink3: n.relatedLink3,
    relatedLink4: n.relatedLink4,
    relatedLink5: n.relatedLink5,
    licenseType: n.licenseType ?? 1,
    thanksFlg: n.thanksFlg ?? 0,
    events: n.events,
    officialLink: n.officialLink,
    materials: n.materials,
  } satisfies PrototypeForMpp;
}
