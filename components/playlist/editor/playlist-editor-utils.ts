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

export function getInputStatusClasses(options: {
  highlighted: boolean;
  hasError: boolean;
  isValid: boolean;
}) {
  if (options.highlighted) {
    return 'border-4 !border-yellow-400 dark:!border-yellow-500';
  }
  if (options.hasError) {
    return 'border-4 !border-red-500 dark:!border-red-400';
  }
  if (options.isValid) {
    return 'border-4 !border-emerald-500 dark:!border-emerald-400';
  }
  return '';
}
