
export function getLeaveDatesExcludingWeekends(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return dates;
}


export function isWeekend(date: Date): boolean {
  return date.getDay() === 0 || date.getDay() === 6;
}


export function isEntirelyWeekend(start: Date, end: Date): boolean {
  let current = new Date(start);
  while (current <= end) {
    if (!isWeekend(current)) {
      return false;
    }
    current.setDate(current.getDate() + 1);
  }
  return true;
}
