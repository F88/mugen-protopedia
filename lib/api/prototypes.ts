import { ResultOfListPrototypesApiResponse } from 'protopedia-api-v2-client';
import { splitPipeSeparatedString } from '../utils/converter';

/**
 * Pro
 */
export type UpstreamPrototype = ResultOfListPrototypesApiResponse;

export type NormalizedPrototype = {
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
  status: number;
  releaseFlg: number;

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
  licenseType: number;

  // Others
  thanksFlg: number;

  /** Pipe-separated tags string from upstream API */
  events?: string[];

  officialLink?: string;

  /** Pipe-separated tags string from upstream API */
  materials?: string[];

  // slideMode?: number;
};

export function normalizePrototype(p: UpstreamPrototype): NormalizedPrototype {
  return {
    id: p.id,
    prototypeNm: p.prototypeNm,
    tags: p.tags ? splitPipeSeparatedString(p.tags) : [],
    teamNm: p.teamNm,
    users: p.users ? splitPipeSeparatedString(p.users) : [],
    summary: p.summary,
    status: p.status,
    releaseFlg: p.releaseFlg,
    createId: p.createId,
    createDate: p.createDate,
    updateId: p.updateId,
    updateDate: p.updateDate,
    releaseDate: p.releaseDate,
    revision: p.revision,
    awards: p.awards ? splitPipeSeparatedString(p.awards) : [],
    freeComment: p.freeComment,
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
    licenseType: p.licenseType,
    thanksFlg: p.thanksFlg,
    events: p.events ? splitPipeSeparatedString(p.events) : [],
    officialLink: p.officialLink,
    materials: p.materials ? splitPipeSeparatedString(p.materials) : [],
  } satisfies NormalizedPrototype;
}
