/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export const formatDateWithTimeCheck = (dateString: string): string => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);

  // If the time is after 8 PM (20:00), add one day
  if (date.getHours() >= 20) {
    date.setDate(date.getDate() + 1);
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const getDevelopmentDuration = (lastActivity: string): string => {
  if (!lastActivity) return '0 days';

  const lastActivityDate = new Date(lastActivity);
  const today = new Date();

  // Calculate the difference in years, months, and days
  let years = today.getFullYear() - lastActivityDate.getFullYear();
  let months = today.getMonth() - lastActivityDate.getMonth();
  let days = today.getDate() - lastActivityDate.getDate();

  // Adjust for negative days/months
  if (days < 0) {
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const daysInLastMonth = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth() + 1,
      0,
    ).getDate();
    days += daysInLastMonth;
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  // Calculate total months and days for more accurate year/month conversion
  const totalMonths = years * 12 + months;
  const totalDays = Math.round(
    (today.getTime() - lastActivityDate.getTime()) / MS_PER_DAY,
  );

  // Return the highest unit that has a value >= 1
  if (totalMonths >= 12) {
    const yearCount = Math.round(totalMonths / 12);
    return `${yearCount} ${yearCount === 1 ? 'year' : 'years'}`;
  }

  if (totalMonths > 0) {
    return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
  }

  // For days, ensure we have at least 1 day
  const dayCount = Math.max(1, totalDays);
  if (dayCount === 1) return '1 day';
  return `${dayCount} days`;
};

export const formatActivityTooltip = (
  lastActivity: string,
  activeSince: string,
): string => {
  return `Last activity on ${formatDateWithTimeCheck(
    lastActivity,
  )}. Active since ${formatDateWithTimeCheck(activeSince)}`;
};

export const getStatusText = (
  isActive: boolean,
  lastActivity: string,
): string => {
  if (!isActive) return 'Inactive';
  const duration = getDevelopmentDuration(lastActivity);
  return `In development for ${duration}`;
};

/**
 * Formats a date string to a locale-specific date format.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const userLocale =
    window.navigator.language || window.navigator.languages?.[0] || 'en-US';
  return date.toLocaleDateString(userLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
