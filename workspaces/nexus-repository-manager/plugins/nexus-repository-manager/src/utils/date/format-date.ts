import { format } from 'date-fns';

/**
 * Returns the given date as a formated Date.
 *
 * @param date - The given date in seconds
 * @return The date formatted to en-US locale, otherwise return 'N/A'
 */
export function formatDate(date: string | number | Date | undefined): string {
  if (!date || date === -1) {
    return 'N/A';
  }

  const adjustedDate = typeof date === 'number' ? date * 1000 : date;
  return format(new Date(adjustedDate), 'LLL d, yyyy, h:mm a');
}
