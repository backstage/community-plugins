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
import {
  formatTrend,
  getFunctionCoverage,
  getTrendForCoverage,
} from './CoverageHistoryChart';

const coverage = (line: number, branch: number) => ({
  timestamp: 0,
  line: { available: 0, covered: 0, missed: 0, percentage: line },
  branch: { available: 0, covered: 0, missed: 0, percentage: branch },
});

const withFunction = (percentage: number) => ({
  ...coverage(0, 0),
  function: { available: 10, covered: 0, missed: 0, percentage },
});

describe('getTrendForCoverage function', () => {
  it('should return the change in percentage points from the oldest to the latest build', () => {
    const history = [coverage(66.05, 40), coverage(60, 50), coverage(56.76, 0)];
    expect(getTrendForCoverage(history, 'line')).toBeCloseTo(9.29, 2);
    expect(getTrendForCoverage(history, 'branch')).toBe(40);
    expect(getTrendForCoverage([coverage(80, 70)], 'line')).toBe(0);
  });

  it('should return the function coverage trend', () => {
    const history = [withFunction(70), withFunction(55)];
    expect(getTrendForCoverage(history, 'function')).toBe(15);
  });
});

describe('getFunctionCoverage function', () => {
  it('should handle an empty history', () => {
    expect(getFunctionCoverage([])).toEqual({
      history: [],
      current: undefined,
      trend: 0,
    });
  });

  it('should return no history when no build has function data', () => {
    const result = getFunctionCoverage([
      coverage(80, 70),
      {
        ...coverage(70, 60),
        function: { available: 0, covered: 0, missed: 0, percentage: 0 },
      },
    ]);
    expect(result.history).toHaveLength(0);
    expect(result.current).toBeUndefined();
  });

  it('should return no current value when only older builds have function data', () => {
    const result = getFunctionCoverage([coverage(80, 70), withFunction(50)]);
    expect(result.history).toHaveLength(1);
    expect(result.current).toBeUndefined();
  });

  it('should compute the trend over builds with function data only', () => {
    const result = getFunctionCoverage([
      withFunction(60),
      coverage(80, 70),
      withFunction(50),
    ]);
    expect(result.current).toBe(60);
    expect(result.history).toHaveLength(2);
    expect(formatTrend(result.trend)).toBe('+10.00%');
  });
});

describe('formatTrend function', () => {
  it('should format the trend as a signed percentage', () => {
    expect(formatTrend(9.29)).toBe('+9.29%');
    expect(formatTrend(-1.5)).toBe('-1.50%');
    expect(formatTrend(0)).toBe('0.00%');
  });
});
