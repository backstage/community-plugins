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
import { formatTrend, getTrendForCoverage } from './CoverageHistoryChart';

const coverage = (line: number, branch: number) => ({
  timestamp: 0,
  line: { available: 0, covered: 0, missed: 0, percentage: line },
  branch: { available: 0, covered: 0, missed: 0, percentage: branch },
});

describe('getTrendForCoverage function', () => {
  it('should return the change in percentage points from the oldest to the latest build', () => {
    const history = [coverage(66.05, 40), coverage(60, 50), coverage(56.76, 0)];
    expect(getTrendForCoverage(history, 'line')).toBeCloseTo(9.29, 2);
    expect(getTrendForCoverage(history, 'branch')).toBe(40);
    expect(getTrendForCoverage([coverage(80, 70)], 'line')).toBe(0);
  });
});

describe('formatTrend function', () => {
  it('should format the trend in percentage points with a sign', () => {
    expect(formatTrend(9.29)).toBe('+9.29 pp');
    expect(formatTrend(-1.5)).toBe('-1.50 pp');
    expect(formatTrend(0)).toBe('0.00 pp');
  });
});
