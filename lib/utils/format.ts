import { calculateAge } from '@/lib/utils/anniversary-nerd';

export const formatDateForDisplay = (value: string | number): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString().slice(0, 10);
};

type FormatAgeOptions = {
  includeMonths?: boolean;
  includeDays?: boolean;
};

export const formatAgeFromDate = (
  value: string | number,
  { includeMonths = true, includeDays = false }: FormatAgeOptions = {},
): string => {
  const parsedValue = new Date(value);
  if (Number.isNaN(parsedValue.getTime())) {
    return '';
  }

  const { years, months, days } = calculateAge(value);

  if (includeDays) {
    return `${years}歳 ${months}ヶ月 ${days}日`;
  }

  if (includeMonths) {
    return `${years}歳 ${months}ヶ月`;
  }

  return `${years}歳`;
};
