/*
 * Copyright 2026 The Backstage Authors
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

import { aggregationFor } from './testUtils';
import { Duration } from '../types';
import { intervalsOf } from '../utils/duration';

describe('aggregationFor', () => {
  it('should handle standard P7D intervals', () => {
    const intervals = 'R2/P7D/2020-09-01';
    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle standard P30D intervals', () => {
    const intervals = 'R2/P30D/2020-09-01';
    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle standard P90D intervals', () => {
    const intervals = 'R2/P90D/2020-09-01';
    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle custom date range intervals (8 days) without comparison mode', () => {
    // This tests the fix for the "Exhaustiveness check failed: P8D" error
    const customDateRange = { start: '2020-01-01', end: '2020-01-08' };
    const intervals = intervalsOf(
      Duration.CUSTOM,
      '2020-09-01',
      2,
      customDateRange,
      false, // no comparison mode
    );

    // intervals should be "R2/P8D/2020-01-09" (full 8 days, not split)
    expect(intervals).toContain('P8D');

    // This should not throw "Exhaustiveness check failed"
    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle custom date range intervals (8 days) with comparison mode', () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-08' };
    const intervals = intervalsOf(
      Duration.CUSTOM,
      '2020-09-01',
      2,
      customDateRange,
      true, // comparison mode
    );

    // intervals should be "R2/P4D/2020-01-09" (8 days / 2 = 4 days floor)
    expect(intervals).toContain('P4D');

    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle custom date range intervals (31 days) without comparison mode', () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-31' };
    const intervals = intervalsOf(
      Duration.CUSTOM,
      '2020-09-01',
      2,
      customDateRange,
      false, // no comparison mode
    );

    // intervals should be "R2/P31D/2020-02-01" (full 31 days, not split)
    expect(intervals).toContain('P31D');

    // This should work without throwing exhaustiveness errors
    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle custom date range intervals (31 days) with comparison mode', () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-31' };
    const intervals = intervalsOf(
      Duration.CUSTOM,
      '2020-09-01',
      2,
      customDateRange,
      true, // comparison mode
    );

    // intervals should be "R2/P15D/2020-02-01" (31 days / 2 = 15 days floor)
    expect(intervals).toContain('P15D');

    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });

  it('should handle custom date range intervals (15 days)', () => {
    const customDateRange = { start: '2020-01-01', end: '2020-01-15' };
    const intervals = intervalsOf(
      Duration.CUSTOM,
      '2020-09-01',
      2,
      customDateRange,
    );

    // This should work for any arbitrary day count
    const aggregation = aggregationFor(intervals, 1000);

    expect(aggregation).toBeDefined();
    expect(aggregation.length).toBeGreaterThan(0);
  });
});
