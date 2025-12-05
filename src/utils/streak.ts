/**
 * Centralized streak calculation utility
 * Calculates consecutive weeks with at least one drink logged
 */

/**
 * Get the ISO week string (YYYY-WW format) for a given date
 * Week starts on Monday (ISO 8601 standard)
 */
function getISOWeek(date: Date): string {
  const target = new Date(date.valueOf());
  const dayNum = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  target.setDate(target.getDate() - dayNum + 3); // Get Thursday of the week
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${target.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

/**
 * Calculate streak from drink log dates
 * @param dates Array of ISO date strings from drink logs
 * @returns Number of consecutive weeks with at least one drink logged
 */
export function calculateStreakFromDates(dates: string[]): number {
  if (dates.length === 0) return 0;

  // Convert all dates to ISO week strings
  const weekSet = new Set<string>(
    dates.map((iso) => getISOWeek(new Date(iso)))
  );

  const today = new Date();
  const currentWeek = getISOWeek(today);

  // Only count if user has logged in the *current week*
  if (!weekSet.has(currentWeek)) {
    return 0;
  }

  let streak = 0;
  let current = new Date(today);

  // Count backwards from current week
  while (weekSet.has(getISOWeek(current))) {
    streak += 1;
    // Move to previous week (subtract 7 days)
    current.setDate(current.getDate() - 7);
  }

  return streak;
}
