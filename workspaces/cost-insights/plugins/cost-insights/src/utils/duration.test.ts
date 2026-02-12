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

import { Duration } from '../types';
import {
  exclusiveEndDateOf,
  inclusiveEndDateOf,
  inclusiveStartDateOf,
  quarterEndDate,
  intervalsOf,
} from './duration';

const lastCompleteBillingDate = '2020-06-05';

describe.each`
  duration         | startDate       | endDate
  ${Duration.P30D} | ${'2020-04-06'} | ${'2020-06-05'}
  ${Duration.P90D} | ${'2019-12-08'} | ${'2020-06-05'}
  ${Duration.P3M}  | ${'2019-10-01'} | ${'2020-03-31'}
`('Calculates interval dates correctly', ({ duration, startDate, endDate }) => {
  it(`Calculates dates correctly for ${duration}`, () => {
    expect(inclusiveStartDateOf(duration, lastCompleteBillingDate)).toBe(
      startDate,
    );
    expect(inclusiveEndDateOf(duration, lastCompleteBillingDate)).toBe(endDate);
  });
});

describe.each`
  inclusiveEndDate | expectedQuarterEndDate
  ${'2020-12-31'}  | ${'2020-12-31'}
  ${'2020-12-30'}  | ${'2020-09-30'}
  ${'2021-02-19'}  | ${'2020-12-31'}
`('quarterEndDate', ({ inclusiveEndDate, expectedQuarterEndDate }) => {
  it(`calculates quarter end date correctly from inclusive end date ${inclusiveEndDate}`, () => {
    expect(quarterEndDate(inclusiveEndDate)).toBe(expectedQuarterEndDate);
  });
});

describe('Custom date range support', () => {
  const customDateRange = { start: '2020-01-01', end: '2020-01-31' };
  const billingDate = '2020-06-05';

  it('Should calculate start date for custom range without comparison mode', () => {
    const startDate = inclusiveStartDateOf(
      Duration.CUSTOM,
      billingDate,
      customDateRange,
      false,
    );
    // Without comparison mode, return the start date as-is
    expect(startDate).toBe('2020-01-01');
  });

  it('Should calculate start date for custom range with comparison mode', () => {
    const startDate = inclusiveStartDateOf(
      Duration.CUSTOM,
      billingDate,
      customDateRange,
      true,
    );
    // With comparison mode, create a comparison period (31 days before start)
    expect(startDate).toBe('2019-12-01');
  });

  it('Should calculate end date for custom range', () => {
    const endDate = exclusiveEndDateOf(
      Duration.CUSTOM,
      billingDate,
      customDateRange,
    );
    // Exclusive end date should be one day after the inclusive end
    expect(endDate).toBe('2020-02-01');
  });

  it('Should calculate inclusive end date for custom range', () => {
    const endDate = inclusiveEndDateOf(
      Duration.CUSTOM,
      billingDate,
      customDateRange,
    );
    expect(endDate).toBe('2020-01-31');
  });

  it('Should generate correct intervals for custom range without comparison mode', () => {
    const intervals = intervalsOf(
      Duration.CUSTOM,
      billingDate,
      2,
      customDateRange,
      false,
    );
    // Without comparison mode, use the full 31 days
    expect(intervals).toBe('R2/P31D/2020-02-01');
  });

  it('Should generate correct intervals for custom range with comparison mode', () => {
    const intervals = intervalsOf(
      Duration.CUSTOM,
      billingDate,
      2,
      customDateRange,
      true,
    );
    // With comparison mode, split into 15-day periods (floor of 31/2)
    expect(intervals).toBe('R2/P15D/2020-02-01');
  });

  it('Should throw error for CUSTOM without customDateRange', () => {
    expect(() => inclusiveStartDateOf(Duration.CUSTOM, billingDate)).toThrow(
      'CUSTOM duration requires customDateRange parameter',
    );
  });

  it('Should be backward compatible with standard durations', () => {
    // All standard durations should work without customDateRange
    expect(() =>
      inclusiveStartDateOf(Duration.P30D, billingDate),
    ).not.toThrow();
    expect(() =>
      inclusiveStartDateOf(Duration.P90D, billingDate),
    ).not.toThrow();
    expect(() => inclusiveStartDateOf(Duration.P3M, billingDate)).not.toThrow();
  });

  it('Should ignore customDateRange for standard durations', () => {
    // Standard durations should ignore customDateRange parameter
    const withoutCustom = inclusiveStartDateOf(Duration.P30D, billingDate);
    const withCustom = inclusiveStartDateOf(
      Duration.P30D,
      billingDate,
      customDateRange,
    );
    expect(withoutCustom).toBe(withCustom);
  });
});
