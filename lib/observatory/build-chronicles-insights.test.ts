import { describe, expect, it } from 'vitest';

import type { PrototypeForMpp } from '@/lib/api/prototypes';
import {
  buildChroniclesInsights,
  buildPioneerMaterialsByUser,
} from './build-chronicles-insights';

const createPrototype = (
  overrides: Partial<PrototypeForMpp> = {},
): PrototypeForMpp => ({
  id: Math.random(),
  prototypeNm: 'Proto',
  tags: [],
  teamNm: '',
  users: ['User'],
  summary: '',
  status: 1,
  releaseFlg: 1,
  createId: 1,
  createDate: '2020-06-01T00:00:00Z',
  updateId: 1,
  updateDate: '2020-06-01T00:00:00Z',
  releaseDate: '2020-06-01T00:00:00Z',
  revision: 1,
  awards: [],
  freeComment: '',
  systemDescription: '',
  viewCount: 0,
  goodCount: 0,
  commentCount: 0,
  videoUrl: undefined,
  mainUrl: 'https://example.com',
  relatedLink: undefined,
  relatedLink2: undefined,
  relatedLink3: undefined,
  relatedLink4: undefined,
  relatedLink5: undefined,
  licenseType: 0,
  thanksFlg: 0,
  events: [],
  officialLink: undefined,
  materials: [],
  ...overrides,
});

describe('buildPioneerMaterialsByUser', () => {
  it('credits each material’s earliest maker(s), ties included', () => {
    const protos = [
      createPrototype({
        materials: ['M5Stack'],
        users: ['alice@1'],
        createDate: '2020-01-01T00:00:00Z',
      }),
      createPrototype({
        materials: ['M5Stack'],
        users: ['bob@2'],
        createDate: '2021-01-01T00:00:00Z',
      }),
      // Arduino's earliest works are same-day — both makers are pioneers.
      createPrototype({
        materials: ['Arduino'],
        users: ['bob@2'],
        createDate: '2019-01-01T00:00:00Z',
      }),
      createPrototype({
        materials: ['Arduino'],
        users: ['carol@3'],
        createDate: '2019-01-01T00:00:00Z',
      }),
    ];
    expect(buildPioneerMaterialsByUser(protos)).toEqual({
      'alice@1': ['M5Stack'],
      'bob@2': ['Arduino'],
      'carol@3': ['Arduino'],
    });
  });

  it('produces the SAME map as buildChroniclesInsights for a varied dataset', () => {
    const varied = [
      createPrototype({
        id: 1,
        materials: ['M5Stack', 'AWS'],
        users: ['alice@1', 'dave@4'], // team + multi-material
        createDate: '2018-05-01T00:00:00Z',
      }),
      createPrototype({
        id: 2,
        materials: ['M5Stack'],
        users: ['bob@2'],
        createDate: '2020-01-01T00:00:00Z',
      }),
      createPrototype({
        id: 3,
        materials: ['Arduino'],
        users: ['bob@2', 'carol@3'], // team, same-day tie with #4
        createDate: '2019-01-01T00:00:00Z',
      }),
      createPrototype({
        id: 4,
        materials: ['Arduino'],
        users: ['carol@3'],
        createDate: '2019-01-01T00:00:00Z',
      }),
      createPrototype({ id: 5, materials: [], users: ['eve@5'] }), // no materials
      createPrototype({
        id: 6,
        materials: ['LED'],
        users: ['frank@6'],
        createDate: '',
        releaseDate: '', // no date -> not a pioneer for LED
      }),
    ];
    expect(buildPioneerMaterialsByUser(varied)).toEqual(
      buildChroniclesInsights(varied).pioneerMaterialsByUser,
    );
  });
});
