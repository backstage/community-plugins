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
  MaturityRank,
  MaturitySummary,
  MaturitySummaryByArea,
  Rank,
} from '@backstage-community/plugin-tech-insights-maturity-common';

/**
 * Formats scoring data received from TechInsightsPlugin checks run
 */
export class ScoringDataFormatter {
  getMaturityRank(results: MaturityCheckResult[]): MaturityRank {
    return this.calculateRank(results);
  }

  getMaturitySummary(results: MaturityCheckResult[]): MaturitySummary {
    const { rank, isMaxRank } = this.calculateRank(results);
    const maxRank = this.calculateMaxRank(results);
    const nextRank = isMaxRank ? maxRank : rank + 1;
    const scoresByArea = this.groupCheckResultByCategory(results);
    let totalChecks = 0;
    let passedChecks = 0;
    let rankTotalChecks = 0;
    let rankPassedChecks = 0;

    const areaSummaries: MaturitySummaryByArea[] = Object.entries(scoresByArea)
      .map(([areaName, areaResults]) => {
        const { rank: areaRank, isMaxRank: areaIsMaxRank } =
          this.calculateRank(areaResults);
        const areaMaxRank = this.calculateMaxRank(areaResults);
        const areaNextRank = areaIsMaxRank ? areaMaxRank : areaRank + 1;
        let areaTotalChecks = 0;
        let areaPassedChecks = 0;

        // Count checks for each rank because overall next rank may be different from area next rank
        const areaRankTotalChecks: { [key: number]: number } = {
          [Rank.Stone]: 0,
          [Rank.Bronze]: 0,
          [Rank.Silver]: 0,
          [Rank.Gold]: 0,
        };
        const areaRankPassedChecks: { [key: number]: number } = {
          [Rank.Stone]: 0,
          [Rank.Bronze]: 0,
          [Rank.Silver]: 0,
          [Rank.Gold]: 0,
        };

        areaResults.forEach(checkResult => {
          areaTotalChecks++;
          if (checkResult.result) {
            areaPassedChecks++;
          }

          // Count check progress in each rank
          areaRankTotalChecks[checkResult.check.metadata.rank]++;
          if (checkResult.result) {
            areaRankPassedChecks[checkResult.check.metadata.rank]++;
          }
        });

        // Aggregate overall check progress
        totalChecks += areaTotalChecks;
        passedChecks += areaPassedChecks;
        // Aggregate check progress from checks in next overall rank
        rankTotalChecks += areaRankTotalChecks[nextRank];
        rankPassedChecks += areaRankPassedChecks[nextRank];

        const areaProgPercent = this.calculatePercent(
          areaPassedChecks,
          areaTotalChecks,
        );
        const areaRankProgPercent = this.calculatePercent(
          areaRankPassedChecks[areaNextRank],
          areaRankTotalChecks[areaNextRank],
        );

        return {
          area: areaName,
          progress: {
            passedChecks: areaPassedChecks,
            totalChecks: areaTotalChecks,
            percentage: areaProgPercent,
          },
          rankProgress: {
            passedChecks: areaRankPassedChecks[areaNextRank],
            totalChecks: areaRankTotalChecks[areaNextRank],
            percentage: areaRankProgPercent,
          },
          rank: areaRank,
          maxRank: areaMaxRank,
          isMaxRank: areaIsMaxRank,
        };
      })
      .sort((a, b) => (a.area > b.area ? -1 : 1)); // Sort according to area name

    const progPercent = this.calculatePercent(passedChecks, totalChecks);
    const rankProgPercent = this.calculatePercent(
      rankPassedChecks,
      rankTotalChecks,
    );

    return {
      points: this.calculatePoints(results),
      progress: {
        passedChecks,
        totalChecks,
        percentage: progPercent,
      },
      rankProgress: {
        passedChecks: rankPassedChecks,
        totalChecks: rankTotalChecks,
        percentage: rankProgPercent,
      },
      rank,
      maxRank,
      isMaxRank,
      areaSummaries,
    };
  }

  /**
   * Some checks within one Area are divided as they should be applied for certain types of Components only
   * When displaying Area scores in the UI they should be concatenated again for total Area score calculation
   */
  private groupCheckResultByCategory(results: MaturityCheckResult[]) {
    const checksByCategory: {
      [key: string]: MaturityCheckResult[];
    } = {};

    results.forEach(checkResult => {
      checksByCategory[checkResult.check.metadata.category] ??= [];
      checksByCategory[checkResult.check.metadata.category].push(checkResult);
    });

    return checksByCategory;
  }

  /** Calculated rank based on the total performance of all areas */
  private calculateRank(results: MaturityCheckResult[]): MaturityRank {
    const maxRank = this.calculateMaxRank(results);
    let rank = maxRank; // Assume maximum rank

    // Reduce rank if a failing check for a lower rank exists
    results.forEach(checkResult => {
      if (!checkResult.result && checkResult.check.metadata.rank <= rank) {
        rank = checkResult.check.metadata.rank - 1;
      }
    });

    const isMaxRank = rank === maxRank;

    return { rank, isMaxRank };
  }

  private calculateMaxRank(results: MaturityCheckResult[]): Rank {
    let rank: Rank = Rank.Stone;

    // Get the highest rank achievable for this area
    results.forEach(checkResult => {
      if (checkResult.check.metadata.rank > rank) {
        rank = checkResult.check.metadata.rank;
      }
    });

    return rank;
  }

  private calculatePoints(results: MaturityCheckResult[]): number {
    let points = 0;

    // Incremental of 100 points for each succeeding rank
    results
      .filter(checkResult => checkResult.result)
      .forEach(checkResult => {
        points += checkResult.check.metadata.rank * 100;
      });

    return points;
  }

  calculatePercent(passedChecks: number, totalChecks: number): number {
    // Prevent dividing by zero
    return totalChecks === 0
      ? 0
      : Math.round((passedChecks / totalChecks) * 100);
  }
}
