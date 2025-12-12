import { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';

import { splitPipeSeparatedString } from '../utils/converter';
import { normalizeProtoPediaTimestamp } from '../utils/time';

export type UpstreamPrototype = ResultOfListPrototypesApiResponse;

export type NormalizedPrototype = {
  /* ID */
  id: number;

  /* Editorial information  */
  createDate: string;
  updateDate?: undefined | string;
  releaseDate?: undefined | string;
  createId?: undefined | number;
  updateId?: undefined | number;
  releaseFlg: number;

  /* Basic information */
  status: number;
  prototypeNm: string;
  summary: string;
  freeComment: string;
  systemDescription: string;

  /** Users and Team */
  users: string[];
  teamNm: string;

  /** Tags, Materials, Events, and Awards */
  tags: string[];
  materials: string[];
  events: string[];
  awards: string[];

  /* URLs */
  // URL of official site (if any)
  officialLink?: undefined | string;
  // URL of YouTube or Vimeo video (if any)
  videoUrl?: undefined | string;
  // URL of eyecatch image
  mainUrl: string;
  // URLs of related link
  relatedLink?: undefined | string;
  relatedLink2?: undefined | string;
  relatedLink3?: undefined | string;
  relatedLink4?: undefined | string;
  relatedLink5?: undefined | string;
  /* counts */
  viewCount: number;
  goodCount: number;
  commentCount: number;

  /* Others */
  uuid?: undefined | string;
  nid?: undefined | string;
  revision?: undefined | number;
  licenseType?: undefined | number;
  thanksFlg?: undefined | number;
  slideMode?: undefined | number;
};

/**
 * Normalizes an upstream prototype object into a consistent internal format.
 *
 * @param p - Upstream prototype object from ProtoPedia API.
 * @returns Normalized prototype object.
 */
export function normalizePrototype(p: UpstreamPrototype): NormalizedPrototype {
  return {
    /* ID */
    id: p.id,

    /* Editorial information  */
    // Always ProtoPedia format → UTC ISO string
    createDate: normalizeProtoPediaTimestamp(p.createDate) ?? p.createDate,
    // Always ProtoPedia format → UTC ISO string
    updateDate: normalizeProtoPediaTimestamp(p.updateDate) ?? p.updateDate,
    // ProtoPedia format → UTC ISO string, null or undefined → undefined
    releaseDate: normalizeProtoPediaTimestamp(p.releaseDate) ?? undefined,
    createId: p.createId,
    updateId: p.updateId,
    releaseFlg: p.releaseFlg ?? 2 /* Default to 'Released' */,

    /* Basic information */
    status: p.status,
    prototypeNm: p.prototypeNm,
    summary: p.summary ?? '',
    freeComment: p.freeComment ?? '',
    systemDescription: p.systemDescription ?? '',

    /** Users and Team */
    users: p.users ? splitPipeSeparatedString(p.users) : [],
    teamNm: p.teamNm ?? '',

    /** Tags, Materials, Events, and Awards */
    tags: p.tags ? splitPipeSeparatedString(p.tags) : [],
    materials: p.materials ? splitPipeSeparatedString(p.materials) : [],
    events: p.events ? splitPipeSeparatedString(p.events) : [],
    awards: p.awards ? splitPipeSeparatedString(p.awards) : [],

    /* URLs */
    officialLink: p.officialLink,
    videoUrl: p.videoUrl,
    mainUrl: p.mainUrl,
    relatedLink: p.relatedLink,
    relatedLink2: p.relatedLink2,
    relatedLink3: p.relatedLink3,
    relatedLink4: p.relatedLink4,
    relatedLink5: p.relatedLink5,

    /* counts */
    viewCount: p.viewCount,
    goodCount: p.goodCount,
    commentCount: p.commentCount,

    /* Others */
    uuid: p.uuid,
    nid: p.nid,
    revision: p.revision ?? 0,
    licenseType: p.licenseType ?? 1,
    thanksFlg: p.thanksFlg ?? 0,
    slideMode: p.slideMode,
  } satisfies NormalizedPrototype;
}
