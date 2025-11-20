export type IndicatorOptions = {
  hasValue: boolean;
  hasError: boolean;
};

export function getIndicatorSymbol({
  hasValue,
  hasError,
}: IndicatorOptions): string {
  if (!hasValue) return '';
  if (hasError) return '❌';
  return '✅';
}
