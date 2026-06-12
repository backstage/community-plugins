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

import { AggregateCoverage } from '../types';
import { getTrendForCoverage } from './coverageTrend';

const snapshot = (
  linePct: number,
  branchPct: number,
  timestamp = 0,
): AggregateCoverage => ({
  timestamp,
  line: {
    available: 100,
    covered: linePct,
    missed: 100 - linePct,
    percentage: linePct,
  },
  branch: {
    available: 100,
    covered: branchPct,
    missed: 100 - branchPct,
    percentage: branchPct,
  },
});

describe('getTrendForCoverage', () => {
  it('returns a positive trend when coverage improves', () => {
    const trend = getTrendForCoverage(snapshot(80, 0), snapshot(40, 0), 'line');
    expect(trend).toBe(100); // 40 -> 80 is +100%
  });

  it('returns a negative trend when coverage drops', () => {
    const trend = getTrendForCoverage(
      snapshot(50, 0),
      snapshot(100, 0),
      'line',
    );
    expect(trend).toBe(-50); // 100 -> 50 is -50%
  });

  it('returns 0 when coverage is unchanged', () => {
    const trend = getTrendForCoverage(snapshot(75, 0), snapshot(75, 0), 'line');
    expect(trend).toBe(0);
  });

  it('returns 0 when the baseline percentage is 0 (avoids divide-by-zero)', () => {
    const trend = getTrendForCoverage(snapshot(60, 0), snapshot(0, 0), 'line');
    expect(trend).toBe(0);
  });

  it('computes branch trend independently from line trend', () => {
    const latest = snapshot(80, 90);
    const previous = snapshot(40, 60);
    expect(getTrendForCoverage(latest, previous, 'line')).toBe(100);
    expect(getTrendForCoverage(latest, previous, 'branch')).toBe(50);
  });
});
