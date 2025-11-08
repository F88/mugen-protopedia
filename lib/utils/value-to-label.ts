/**
 * Utility functions to convert prototype property values to human-readable labels.
 *
 * releaseFlg:
 * 2: '一般公開' // API で取得出来るデータは releaseFlg:2 のデータのみである(推定)
 * x: '下書き保存'
 * x: '限定共有'
 *
 * status:
 * 1: 'アイデア'
 * 2: '開発中'
 * 3: '完成'
 * 4: '供養'
 *
 * thanksFlg:
 * 1: '1:Unknown'
 *
 * licenseType:
 * 1: '表示する' // Creative Commons Attribution CC BY version 4.0 or later (CC BY 4+)
 * 2: '表示しない'
 *
 * 2022.05.23 | helpcenter https://protopedia.gitbook.io/helpcenter/info/2022.05.23
 *
 */

const RELEASE_FLAG_LABELS: Record<number, string> = {
  2: '一般公開',
};

const STATUS_LABELS: Record<number, string> = {
  1: 'アイデア',
  2: '開発中',
  3: '完成',
  4: '供養',
};

const THANKS_FLAG_LABELS: Record<number, string> = {
  // No known labels yet
};

const LICENSE_TYPE_LABELS: Record<number, string> = {
  1: '表示する',
  2: '表示しない',
};

/**
 * Get label for value of ResultOfListPrototypesApiResponse.status
 */
export const getPrototypeStatusLabel = (status: number): string => {
  return STATUS_LABELS[status] ?? `${status}`;
};

/**
 * Get label for value of ResultOfListPrototypesApiResponse.releaseFlg
 */
export const getPrototypeReleaseFlagLabel = (releaseFlag: number): string => {
  return RELEASE_FLAG_LABELS[releaseFlag] ?? `${releaseFlag}`;
};

/**
 * Get label for value of ResultOfListPrototypesApiResponse.thanksFlg
 */
export const getPrototypeThanksFlagLabel = (thanksFlag: number): string => {
  return THANKS_FLAG_LABELS[thanksFlag] ?? `${thanksFlag}`;
};

/**
 * Get label for value of ResultOfListPrototypesApiResponse.licenseType
 */
export const getPrototypeLicenseTypeLabel = (licenseType: number): string => {
  return LICENSE_TYPE_LABELS[licenseType] ?? `${licenseType}`;
};
