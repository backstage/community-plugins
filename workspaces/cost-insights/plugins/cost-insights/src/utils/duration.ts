/*
 * Copyright 2020 The Backstage Authors
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

import { DateTime, Duration as LuxonDuration } from 'luxon';
import { Duration, DEFAULT_DATE_FORMAT } from '../types';
import { assertNever } from './assert';

export const DEFAULT_DURATION = Duration.P30D;

/**
 * Derive the start date of a given period, assuming two repeating intervals.
 *
 * @param duration - see comment on Duration enum
 * @param inclusiveEndDate - from CostInsightsApi.getLastCompleteBillingDate
 * @param customDateRange - optional custom date range for Duration.CUSTOM
 * @param comparisonMode - if true, creates comparison period for custom ranges (default: false)
 */
export function inclusiveStartDateOf(
  duration: Duration,
  inclusiveEndDate: string,
  customDateRange?: { start: string; end: string },
  comparisonMode: boolean = false,
): string {
  if (duration === Duration.CUSTOM && customDateRange) {
    if (comparisonMode) {
      // For comparison mode, calculate a comparison period of equal length before the selected range
      const startDate = DateTime.fromISO(customDateRange.start);
      const endDate = DateTime.fromISO(customDateRange.end);
      // Include both start and end dates (add 1 day for inclusive calculation)
      const daysDiff = Math.round(endDate.diff(startDate, 'days').days) + 1;
      // Return start of comparison period (twice the range length before the end)
      return startDate.minus({ days: daysDiff }).toFormat(DEFAULT_DATE_FORMAT);
    }
    // For non-comparison mode, return the start date as-is
    return customDateRange.start;
  }

  switch (duration) {
    case Duration.P7D:
    case Duration.P30D:
    case Duration.P90D:
      return DateTime.fromISO(inclusiveEndDate)
        .minus(
          LuxonDuration.fromISO(duration).plus(LuxonDuration.fromISO(duration)),
        )
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.P3M:
      return DateTime.fromISO(inclusiveEndDate)
        .startOf('quarter')
        .minus(
          LuxonDuration.fromISO(duration).plus(LuxonDuration.fromISO(duration)),
        )
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.CUSTOM:
      throw new Error('CUSTOM duration requires customDateRange parameter');
    default:
      return assertNever(duration);
  }
}

export function exclusiveEndDateOf(
  duration: Duration,
  inclusiveEndDate: string,
  customDateRange?: { start: string; end: string },
): string {
  if (duration === Duration.CUSTOM && customDateRange) {
    // For custom ranges, add 1 day to the end date for exclusive end
    return DateTime.fromISO(customDateRange.end)
      .plus({ days: 1 })
      .toFormat(DEFAULT_DATE_FORMAT);
  }

  switch (duration) {
    case Duration.P7D:
    case Duration.P30D:
    case Duration.P90D:
      return DateTime.fromISO(inclusiveEndDate)
        .plus({ days: 1 })
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.P3M:
      return DateTime.fromISO(quarterEndDate(inclusiveEndDate))
        .plus({ days: 1 })
        .toFormat(DEFAULT_DATE_FORMAT);
    case Duration.CUSTOM:
      throw new Error('CUSTOM duration requires customDateRange parameter');
    default:
      return assertNever(duration);
  }
}

export function inclusiveEndDateOf(
  duration: Duration,
  inclusiveEndDate: string,
  customDateRange?: { start: string; end: string },
): string {
  return DateTime.fromISO(
    exclusiveEndDateOf(duration, inclusiveEndDate, customDateRange),
  )
    .minus({ days: 1 })
    .toFormat(DEFAULT_DATE_FORMAT);
}

// https://en.wikipedia.org/wiki/ISO_8601#Repeating_intervals
export function intervalsOf(
  duration: Duration,
  inclusiveEndDate: string,
  repeating: number = 2,
  customDateRange?: { start: string; end: string },
  comparisonMode: boolean = false,
) {
  if (duration === Duration.CUSTOM && customDateRange) {
    const startDate = DateTime.fromISO(customDateRange.start);
    const endDate = DateTime.fromISO(customDateRange.end);
    // Add 1 to include both start and end dates
    const totalDays = Math.round(endDate.diff(startDate, 'days').days) + 1;

    if (comparisonMode) {
      // For comparison mode, split the range in half to create two comparison periods
      const intervalDays = Math.floor(totalDays / 2);
      return `R${repeating}/P${intervalDays}D/${exclusiveEndDateOf(
        duration,
        inclusiveEndDate,
        customDateRange,
      )}`;
    }

    // For non-comparison mode, use the full date range as a single interval
    return `R${repeating}/P${totalDays}D/${exclusiveEndDateOf(
      duration,
      inclusiveEndDate,
      customDateRange,
    )}`;
  }

  return `R${repeating}/${duration}/${exclusiveEndDateOf(
    duration,
    inclusiveEndDate,
  )}`;
}

export function quarterEndDate(inclusiveEndDate: string): string {
  const endDate = DateTime.fromISO(inclusiveEndDate);
  const endOfQuarter = endDate.endOf('quarter').toFormat(DEFAULT_DATE_FORMAT);
  if (endOfQuarter === inclusiveEndDate) {
    return endDate.toFormat(DEFAULT_DATE_FORMAT);
  }
  return endDate
    .startOf('quarter')
    .minus({ days: 1 })
    .toFormat(DEFAULT_DATE_FORMAT);
}
