/**
 * Application-wide static constants.
 * These values are safe to import from both server and client code.
 */
export const APP_TITLE = '無限ProtoPedia';
export const APP_DESCRIPTION =
  '仕事中のおさぼりから酒宴のつまみにも、寝酒のお供に、気付けば夜更け、朝ぼらけ';
export const APP_URL = 'https://mugen-pp.vercel.app';
export const APP_OG_IMAGE = `${APP_URL}/img/MPP-3-0-1200x630-OG.png`;

export const APP_KEYWORDS = [
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
] as const;

export type AppKeyword = (typeof APP_KEYWORDS)[number];

// Allowed origins for ProtoPedia-related scraping and page fetching.
// Safe to use from both client and server code.
export const PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS = [
  'https://protopedia.net',
  'https://mashupawards.connpass.com',
  'https://connpass.com',
] as const;

export type ProtopediaScrapeAllowedOrigin =
  (typeof PROTOPEDIA_SCRAPE_ALLOWED_ORIGINS)[number];
