import { describe, expect, it } from 'vitest';

import {
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_OG_IMAGE,
  APP_TITLE,
  APP_URL,
  PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS,
  type ProtopediaScrapeAllowedOrigin,
} from '@/lib/config/app-constants';

describe('app-constants', () => {
  it('exposes consistent APP_* constants', () => {
    expect(APP_TITLE).toBe('無限ProtoPedia');

    expect(APP_DESCRIPTION).toBe(
      '仕事中のおさぼりから酒宴のつまみにも、寝酒のお供に、気付けば夜更け、朝ぼらけ',
    );

    expect(APP_URL).toBe('https://mugen-pp.vercel.app');

    expect(APP_OG_IMAGE).toBe(
      'https://mugen-pp.vercel.app/img/MPP-3-0-1200x630-OG.png',
    );
  });

  it('defines APP_KEYWORDS as a non-empty readonly list of strings', () => {
    expect(Array.isArray(APP_KEYWORDS)).toBe(true);
    expect(APP_KEYWORDS.length).toBeGreaterThan(0);

    expect(APP_KEYWORDS).toEqual([
      'ProtoPedia',
      'プロトタイプ',
      'プロトタイピング',
      '無限',
      '無限Viewer',
      'IoT',
      'Maker',
      'メイカー',
      'ものづくり',
      'ハッカソン',
      'コンテスト',
      '電子工作',
    ]);
  });

  it('defines PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS as a readonly list of allowed origins', () => {
    expect(Array.isArray(PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS)).toBe(true);
    expect(PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS).toEqual([
      'https://protopedia.net',
      'https://mashupawards.connpass.com',
    ]);
  });

  it('ensures ProtopediaScrapeAllowedOrigin matches the allowed origins list', () => {
    const origins: ProtopediaScrapeAllowedOrigin[] = [
      ...PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS,
    ];
    expect(origins).toEqual(PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS);
  });
});
