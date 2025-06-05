// Add this utility function outside your component
export function calculateWorkDays(startDate: string, endDate: string): number {
  let start = new Date(startDate);
  let end = new Date(endDate);
  
  // Swap dates if start is after end
  if (start > end) {
    [start, end] = [end, start];
  }

  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const day = current.getDay();
    // Sunday is 0, Saturday is 6
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}