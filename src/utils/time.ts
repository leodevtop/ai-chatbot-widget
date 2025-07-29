import { formatInTimeZone, toZonedTime, fromZonedTime, getTimezoneOffset } from 'date-fns-tz';

/**
 * Get current UTC time (Date object)
 */
export function now(): Date {
  return new Date();
}

/**
 * Get future UTC time by adding minutes to current time
 */
export function expiresIn(minutes: number = 30): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if a Date or ISO string is expired
 */
export function isExpired(date: Date | string): boolean {
  const target = typeof date === 'string' ? new Date(date) : date;
  return target.getTime() < Date.now();
}

/**
 * Format UTC date into string at given timezone
 */
export function formatUtcInTimezone(utc: Date, timezone: string, pattern = 'yyyy-MM-dd HH:mm:ssXXX'): string {
  return formatInTimeZone(utc, timezone, pattern);
}

/**
 * Convert UTC → local time as Date (not string)
 */
export function convertToZonedTime(utc: Date, timezone: string): Date {
  return toZonedTime(utc, timezone);
}

/**
 * Convert local time at timeZone → UTC Date
 */
export function convertFromZonedTime(localTime: string, timezone: string): Date {
  return fromZonedTime(localTime, timezone);
}
