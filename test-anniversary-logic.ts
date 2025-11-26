import { isToday, isBirthDay } from './lib/utils/anniversary-nerd';

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const todayStr = `${yyyy}-${mm}-${dd}`;

const lastYear = yyyy - 1;
const lastYearStr = `${lastYear}-${mm}-${dd}`;

console.log(`Today: ${todayStr}`);
console.log(`Last Year: ${lastYearStr}`);

console.log(`isToday('${todayStr}'):`, isToday(todayStr));
console.log(`isToday('${lastYearStr}'):`, isToday(lastYearStr));

console.log(`isBirthDay('${todayStr}'):`, isBirthDay(todayStr));
console.log(`isBirthDay('${lastYearStr}'):`, isBirthDay(lastYearStr));

const includeInBirthdayList = (dateStr: string) => {
  return isBirthDay(dateStr) && !isToday(dateStr);
};

console.log(
  `Include '${todayStr}' (Newborn) in Birthday List?`,
  includeInBirthdayList(todayStr),
);
console.log(
  `Include '${lastYearStr}' (1 Year Old) in Birthday List?`,
  includeInBirthdayList(lastYearStr),
);
