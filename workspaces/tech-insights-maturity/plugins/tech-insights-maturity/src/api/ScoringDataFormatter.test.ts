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
import {
  MaturityCheckResult,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';
import { ScoringDataFormatter } from './ScoringDataFormatter';
import {
  activeOwnershipCheckResult,
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
} from './testData';

// Check Result for Entity
const oneAreaOneCheckResult: MaturityCheckResult[] = [
  productOwnershipCheckResult,
];
const oneAreaMultipleChecksCheckResult: MaturityCheckResult[] = [
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
  activeOwnershipCheckResult,
];
const multipleAreasMultipleChecksCheckResult: MaturityCheckResult[] = [
  productOwnershipCheckResult,
  technicalOwnershipCheckResult,
  activeOwnershipCheckResult,
  {
    facts: {
      hasReadme: {
        id: 'hasReadme',
        value: false,
        type: 'boolean' as const,
        description: 'The entity has valid README file',
      },
    },
    result: false,
    check: {
      id: 'readmeValidationCheck',
      type: 'Documentation',
      name: 'Entity Documentation',
      description: 'Entity is thoroughly documented',
      factIds: ['hasReadme'],
      metadata: {
        exp: 100,
        rank: Rank.Bronze,
        category: 'Documentation',
        solution: '',
      },
    },
  },
];

describe('ScoringDataFormatter', () => {
  const sdf = new ScoringDataFormatter();
  describe('getMaturityRank', () => {
    it('returns result value true if all task has been completed', () => {
      expect(sdf.getMaturityRank(oneAreaOneCheckResult).isMaxRank).toEqual(
        true,
      );
    });
    it('awards rank which is one level lower than the rank of the lowest task that failed', () => {
      expect(
        sdf.getMaturityRank(oneAreaMultipleChecksCheckResult).rank,
      ).toEqual(Rank.Silver);
    });
    it('awards rank which is one level lower than the rank of the lowest task that failed for all areas', () => {
      expect(
        sdf.getMaturityRank(multipleAreasMultipleChecksCheckResult).rank,
      ).toEqual(Rank.Stone);
    });
  });

  describe('generateMaturitySummary', () => {
    it('returns result value true if all task has been completed', () => {
      expect(sdf.getMaturitySummary(oneAreaOneCheckResult).isMaxRank).toEqual(
        true,
      );
    });
    it('awards rank which is one level lower than the rank of the lowest task that failed', () => {
      expect(
        sdf.getMaturitySummary(oneAreaMultipleChecksCheckResult).rank,
      ).toEqual(Rank.Silver);
    });
    it('awards Stone rank when no task was completed', () => {
      expect(
        sdf.getMaturitySummary(multipleAreasMultipleChecksCheckResult)
          .areaSummaries[1].rank,
      ).toEqual(Rank.Stone);
    });
    it('awards rank which is one level lower than the rank of the lowest task that failed for all areas', () => {
      expect(
        sdf.getMaturitySummary(multipleAreasMultipleChecksCheckResult).rank,
      ).toEqual(Rank.Stone);
    });
    it('returns the correct maximum possible rank', () => {
      expect(
        sdf.getMaturitySummary(multipleAreasMultipleChecksCheckResult).maxRank,
      ).toEqual(Rank.Gold);
    });
  });

  describe('calculatePercent', () => {
    it('returns 0 when totalChecks is 0', () => {
      expect(sdf.calculatePercent(0, 0)).toEqual(0);
    });

    it('returns an integer representing the percent of passedChecks out of totalChecks', () => {
      expect(sdf.calculatePercent(1, 2)).toEqual(50);
    });
  });
});
