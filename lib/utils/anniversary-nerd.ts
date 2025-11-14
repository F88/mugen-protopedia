/**
 * Calculates the age difference between the provided date and now.
 *
 * Timezone note:
 * - This function uses the runtime's local timezone (the user's local time in a browser).
 * - For UI usage, call this on the client so ages reflect the user's locale/timezone.
 */
export const calculateAge = (
  value: string | number,
): { years: number; months: number; days: number } => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { years: 0, months: 0, days: 0 };
  }

  const now = new Date();
  let months =
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth());
  let days = now.getDate() - date.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    months = 0;
    days = 0;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return { years, months: remainingMonths, days };
};

/**
 * Determines whether the current date matches the provided birthday.
 * - Returns true when month/day match exactly.
 * - Treats February 29 birthdays as February 28 in non-leap years.
 *
 * Timezone note:
 * - Comparison uses the runtime's local timezone (the user's local time in a browser).
 * - To reflect the user's timezone, prefer evaluating this on the client.
 */
export const isBirthDay = (value: string | number): boolean => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  if (now.getMonth() === date.getMonth() && now.getDate() === date.getDate()) {
    return true;
  }

  const isLeapBirth = date.getMonth() === 1 && date.getDate() === 29;
  if (!isLeapBirth) {
    return false;
  }

  const isLeapYear = (year: number): boolean =>
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  if (isLeapYear(now.getFullYear())) {
    return false;
  }

  return now.getMonth() === 1 && now.getDate() === 28;
};

/**
 * Determines whether the provided date is today (same year, month, and day).
 * - Returns `true` if the date matches today's date in either the local timezone or UTC.
 * - This inclusive check helps avoid off-by-one errors near midnight across timezones.
export const isToday = (value: string | number): boolean => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const now = new Date();
  const sameLocal =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  const sameUTC =
    now.getUTCFullYear() === date.getUTCFullYear() &&
    now.getUTCMonth() === date.getUTCMonth() &&
    now.getUTCDate() === date.getUTCDate();

  return sameLocal || sameUTC;
};
