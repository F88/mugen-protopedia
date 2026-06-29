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
  id: number;

  /* Basic information */
  prototypeNm: string;

  /** Pipe-separated tags string from upstream API */
  tags?: string[];

  teamNm: string;

  /** Pipe-separated tags string from upstream API */
  users: string[];

  summary?: string;
  status: StatusCode;
  releaseFlg: ReleaseFlagCode;

  // uuid: string;
  // nid?: string;

  /* Times  */
  createId?: number;
  createDate: string;
  updateId?: number;
  updateDate: string;
  releaseDate: string;

  revision: number;

  /** Pipe-separated tags string from upstream API */
  awards?: string[];

  freeComment: string;
  systemDescription?: string;

  // counts
  viewCount: number;
  goodCount: number;
  commentCount: number;

  // URLs

  /** URL of YouTube or Vimeo */
  videoUrl?: string;

  /* URL of eyecatch image */
  mainUrl: string;

  /* URLs of related link */
  relatedLink?: string;
  relatedLink2?: string;
  relatedLink3?: string;
  relatedLink4?: string;
  relatedLink5?: string;

  // License
  licenseType: LicenseTypeCode;

  // Others
  thanksFlg: ThanksFlagCode;

  /** Pipe-separated tags string from upstream API */
  events?: string[];

  officialLink?: string;

  /** Pipe-separated tags string from upstream API */
  materials?: string[];

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
 * shapes: it keeps `PrototypeForMpp`'s non-optional contract for the fields the
 * app reads unconditionally (filling `releaseDate` / `updateDate` to `''`),
 * copies the readonly arrays into mutable ones, and drops the promidas-only
 * fields (`uuid`, `nid`, `slideMode`) the app does not use.
 */
export function normalizePrototypeForMpp(p: UpstreamPrototype): PrototypeForMpp {
  const n = normalizeUpstreamPrototype(p);
  return {
    id: n.id,
    prototypeNm: n.prototypeNm,
    tags: [...n.tags],
    teamNm: n.teamNm,
    users: [...n.users],
    summary: n.summary,
    status: n.status,
    releaseFlg: n.releaseFlg,
    createId: n.createId,
    createDate: n.createDate,
    updateId: n.updateId,
    updateDate: n.updateDate ?? '',
    releaseDate: n.releaseDate ?? '',
    revision: n.revision ?? 0,
    awards: [...n.awards],
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
    events: [...n.events],
    officialLink: n.officialLink,
    materials: [...n.materials],
  } satisfies PrototypeForMpp;
}
