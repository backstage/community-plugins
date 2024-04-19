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
import pluralize from 'pluralize';
import { Duration } from '../types';
import { ChangeStatistic } from '@backstage-community/plugin-cost-insights-common';
import { inclusiveEndDateOf, inclusiveStartDateOf } from './duration';
import { notEmpty } from './assert';

export type Period = {
  periodStart: string;
  periodEnd: string;
};

export const currencyFormatter = (currency: Intl.NumberFormat) => {
  const options = currency.resolvedOptions();

  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const lengthyCurrencyFormatter = (currency: Intl.NumberFormat) => {
  const options = currency.resolvedOptions();

  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    minimumFractionDigits: 0,
    minimumSignificantDigits: 2,
    maximumSignificantDigits: 2,
  });
};

export const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const monthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  month: 'long',
  year: 'numeric',
});

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC',
  day: 'numeric',
  month: 'short',
});

export const monthOf = (date: string): string => {
  return monthFormatter.format(Date.parse(date));
};

export const quarterOf = (date: string): string => {
  // Supports formatting yyyy-LL-dd and yyyy-'Q'q returned in alerts
  const d = DateTime.fromISO(date).isValid
    ? DateTime.fromISO(date)
    : DateTime.fromFormat(date, "yyyy-'Q'q");
  return d.toFormat("'Q'q yyyy");
};

export function formatCurrency(amount: number, currency?: string): string {
  const n = Math.round(amount);
  const numString = numberFormatter.format(n);

  return currency ? `${numString} ${pluralize(currency, n)}` : numString;
}

export function formatChange(
  change: ChangeStatistic,
  options?: { absolute: boolean },
): string {
  if (notEmpty(change.ratio)) {
    return formatPercent(
      options?.absolute ? Math.abs(change.ratio) : change.ratio,
    );
  }
  if (options?.absolute) {
    return '∞';
  }
  return change.amount >= 0 ? '∞' : '-∞';
}

export function formatPercent(n: number): string {
  // Number.toFixed shows scientific notation for extreme numbers
  if (isNaN(n) || Math.abs(n) < 0.01) {
    return '0%';
  }

  if (Math.abs(n) > 10) {
    return `>${n < 0 ? '-' : ''}1000%`;
  }

  return `${(n * 100).toFixed(0)}%`;
}

export function formatLastTwoLookaheadQuarters(inclusiveEndDate: string) {
  const start = DateTime.fromISO(
    inclusiveStartDateOf(Duration.P3M, inclusiveEndDate),
  ).toFormat("'Q'q yyyy");
  const end = DateTime.fromISO(
    inclusiveEndDateOf(Duration.P3M, inclusiveEndDate),
  ).toFormat("'Q'q yyyy");
  return `${start} vs ${end}`;
}

const formatRelativePeriod = (
  duration: Duration,
  date: string,
  isEndDate: boolean,
): string => {
  const periodStart = isEndDate ? inclusiveStartDateOf(duration, date) : date;
  const periodEnd = isEndDate ? date : inclusiveEndDateOf(duration, date);
  const days = LuxonDuration.fromISO(duration).days;
  if (![periodStart, periodEnd].includes(date)) {
    throw new Error(`Invalid relative date ${date} for duration ${duration}`);
  }
  return date === periodStart ? `First ${days} Days` : `Last ${days} Days`;
};

export function formatPeriod(
  duration: Duration,
  date: string,
  isEndDate: boolean,
) {
  switch (duration) {
    case Duration.P3M:
      return quarterOf(
        isEndDate
          ? inclusiveEndDateOf(duration, date)
          : inclusiveStartDateOf(duration, date),
      );
    default:
      return formatRelativePeriod(duration, date, isEndDate);
  }
}
