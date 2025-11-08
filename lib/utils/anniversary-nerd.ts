/**
 * Calculates the age difference between the provided date and now.
 */
export const calculateAge = (
  value: string | number,
): { years: number; months: number; days: number } => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { years: 0, months: 0, days: 0 };
  }

  const now = new Date();
  let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
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
