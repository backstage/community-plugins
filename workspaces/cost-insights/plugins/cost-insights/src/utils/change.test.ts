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

import { growthOf, getPreviousPeriodTotalCost } from './change';
import {
  GrowthType,
  ChangeThreshold,
  EngineerThreshold,
  Duration,
} from '../types';
import { Cost } from '@backstage-community/plugin-cost-insights-common';
import { MockAggregatedDailyCosts, trendlineOf, changeOf } from '../testUtils';

const GrowthMap = {
  [GrowthType.Negligible]: 'negligible growth',
  [GrowthType.Savings]: 'cost savings',
  [GrowthType.Excess]: 'cost excess',
};

describe.each`
  ratio                           | amount                     | expected
  ${undefined}                    | ${0}                       | ${GrowthType.Negligible}
  ${0.0}                          | ${0}                       | ${GrowthType.Negligible}
  ${0.0}                          | ${EngineerThreshold}       | ${GrowthType.Negligible}
  ${ChangeThreshold.lower}        | ${0}                       | ${GrowthType.Negligible}
  ${ChangeThreshold.lower + 0.01} | ${0}                       | ${GrowthType.Negligible}
  ${ChangeThreshold.lower + 0.01} | ${EngineerThreshold}       | ${GrowthType.Negligible}
  ${ChangeThreshold.lower + 0.01} | ${EngineerThreshold + 0.1} | ${GrowthType.Negligible}
  ${ChangeThreshold.lower - 0.01} | ${EngineerThreshold - 0.1} | ${GrowthType.Negligible}
  ${ChangeThreshold.lower - 0.01} | ${0}                       | ${GrowthType.Negligible}
  ${ChangeThreshold.upper}        | ${0}                       | ${GrowthType.Negligible}
  ${ChangeThreshold.upper - 0.01} | ${0}                       | ${GrowthType.Negligible}
  ${ChangeThreshold.upper + 0.01} | ${EngineerThreshold - 0.1} | ${GrowthType.Negligible}
  ${ChangeThreshold.upper + 0.01} | ${0}                       | ${GrowthType.Negligible}
  ${ChangeThreshold.lower}        | ${EngineerThreshold}       | ${GrowthType.Savings}
  ${ChangeThreshold.lower - 0.01} | ${EngineerThreshold}       | ${GrowthType.Savings}
  ${ChangeThreshold.lower - 0.01} | ${EngineerThreshold + 0.1} | ${GrowthType.Savings}
  ${ChangeThreshold.upper}        | ${EngineerThreshold}       | ${GrowthType.Excess}
  ${ChangeThreshold.upper + 0.01} | ${EngineerThreshold}       | ${GrowthType.Excess}
  ${ChangeThreshold.upper + 0.01} | ${EngineerThreshold + 0.1} | ${GrowthType.Excess}
`(
  'growthOf',
  ({
    ratio,
    amount,
    expected,
  }: {
    ratio: number;
    amount: number;
    expected: GrowthType;
  }) => {
    it(`should display ${GrowthMap[expected]}`, () => {
      expect(growthOf({ ratio, amount }, EngineerThreshold)).toBe(expected);
    });
  },
);

describe('getPreviousPeriodTotalCost', () => {
  it('Correctly returns the total cost for the previous period given daily costs', () => {
    const mockGroupDailyCost: Cost = {
      id: 'test-group',
      aggregation: MockAggregatedDailyCosts,
      change: changeOf(MockAggregatedDailyCosts),
      trendline: trendlineOf(MockAggregatedDailyCosts),
    };
    const inclusiveEndDate = '2020-09-30';
    expect(
      getPreviousPeriodTotalCost(
        mockGroupDailyCost.aggregation,
        Duration.P30D,
        inclusiveEndDate,
      ),
    ).toEqual(96_600);
  });

  it('Returns 0 for custom date ranges without comparison mode (no previous period)', () => {
    const mockGroupDailyCost: Cost = {
      id: 'test-group',
      aggregation: MockAggregatedDailyCosts,
      change: changeOf(MockAggregatedDailyCosts),
      trendline: trendlineOf(MockAggregatedDailyCosts),
    };
    const inclusiveEndDate = '2020-09-30';
    const customDateRange = { start: '2020-09-01', end: '2020-09-30' };
    expect(
      getPreviousPeriodTotalCost(
        mockGroupDailyCost.aggregation,
        Duration.CUSTOM,
        inclusiveEndDate,
        customDateRange,
        false, // comparisonMode = false
      ),
    ).toEqual(0);
  });

  it('Returns previous period cost for custom date ranges with comparison mode', () => {
    const mockGroupDailyCost: Cost = {
      id: 'test-group',
      aggregation: MockAggregatedDailyCosts,
      change: changeOf(MockAggregatedDailyCosts),
      trendline: trendlineOf(MockAggregatedDailyCosts),
    };
    const inclusiveEndDate = '2020-09-30';
    const customDateRange = { start: '2020-09-01', end: '2020-09-30' };
    const result = getPreviousPeriodTotalCost(
      mockGroupDailyCost.aggregation,
      Duration.CUSTOM,
      inclusiveEndDate,
      customDateRange,
      true, // comparisonMode = true
    );
    // With comparison mode, it should calculate a previous period
    expect(result).toBeGreaterThan(0);
  });
});
