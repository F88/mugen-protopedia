import { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';

import { splitPipeSeparatedString } from '../utils/converter';
import { normalizeProtoPediaTimestamp } from '../utils/time';

export type UpstreamPrototype = ResultOfListPrototypesApiResponse;

export type NormalizedPrototype = {
  /* ID */
  id: number;

  /* Editorial information  */
  createDate: string;
  updateDate?: string;
  releaseDate?: string;
  createId?: number;
  updateId?: number;
  releaseFlg: number;

  /* Basic information */
  status: number;
  prototypeNm: string;
  summary: string;
  freeComment?: string;
  systemDescription?: string;

  /** Users and Team */
  users: string[];
  teamNm?: string;

  /** Tags, Materials, Events, and Awards */
  tags: string[];
  materials: string[];
  events: string[];
  awards: string[];

  // URLs
  /** URL of official site (if any) */
  officialLink?: string;
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

  // counts
  viewCount: number;
  goodCount: number;
  commentCount: number;

  // License

  // Others
  uuid?: string;
  nid?: string;
  revision?: number;
  licenseType?: number;
  thanksFlg?: number;
  slideMode?: number;

  /** Pipe-separated tags string from upstream API */

  // slideMode?: number;
};

export function normalizePrototype(p: UpstreamPrototype): NormalizedPrototype {
  return {
    id: p.id,
    prototypeNm: p.prototypeNm,
    tags: p.tags ? splitPipeSeparatedString(p.tags) : [],
    teamNm: p.teamNm ?? '',
    users: p.users ? splitPipeSeparatedString(p.users) : [],
    summary: p.summary,
    status: p.status,
    releaseFlg: p.releaseFlg ?? 2,
    createId: p.createId,
    createDate: normalizeProtoPediaTimestamp(p.createDate) ?? p.createDate,
    updateId: p.updateId,
    updateDate: normalizeProtoPediaTimestamp(p.updateDate) ?? p.updateDate,
    releaseDate:
      normalizeProtoPediaTimestamp(p.releaseDate) ??
      normalizeProtoPediaTimestamp(p.createDate) ??
      p.createDate,
    revision: p.revision ?? 0,
    awards: p.awards ? splitPipeSeparatedString(p.awards) : [],
    freeComment: p.freeComment ?? '',
    systemDescription: p.systemDescription,
    viewCount: p.viewCount,
    goodCount: p.goodCount,
    commentCount: p.commentCount,
    videoUrl: p.videoUrl,
    mainUrl: p.mainUrl,
    relatedLink: p.relatedLink,
    relatedLink2: p.relatedLink2,
    relatedLink3: p.relatedLink3,
    relatedLink4: p.relatedLink4,
    relatedLink5: p.relatedLink5,
    licenseType: p.licenseType ?? 1,
    thanksFlg: p.thanksFlg ?? 0,
    events: p.events ? splitPipeSeparatedString(p.events) : [],
    officialLink: p.officialLink,
    materials: p.materials ? splitPipeSeparatedString(p.materials) : [],
  } satisfies NormalizedPrototype;
}
