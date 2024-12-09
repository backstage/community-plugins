/*
 * Copyright 2024 The Backstage Authors
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
  Metric,
  MetricsType,
} from '@backstage-community/plugin-copilot-common';
import { LanguageStats } from '../types';

export function getTopLanguagesByAcceptedPrompts(
  metricsArray: Metric[],
  topN: number = 5,
): LanguageStats[] {
  const languageStatsArray = getLanguageStats(metricsArray);
  languageStatsArray.sort((a, b) => b.totalAcceptances - a.totalAcceptances);
  return languageStatsArray.slice(0, topN);
}
export function getTopLanguagesByAcceptanceRate(
  metricsArray: Metric[],
  topN: number = 5,
): LanguageStats[] {
  const languageStatsArray = getLanguageStats(metricsArray);
  languageStatsArray.sort((a, b) => b.acceptanceRate - a.acceptanceRate);
  return languageStatsArray.slice(0, topN);
}

export function getLanguageStats(metricsArray: Metric[]): LanguageStats[] {
  const languageStatsMap: Map<string, LanguageStats> = new Map();
  metricsArray.forEach(metrics => {
    metrics.breakdown.forEach(item => {
      const existingStats = languageStatsMap.get(item.language);
      if (existingStats) {
        existingStats.totalSuggestions += item.suggestions_count;
        existingStats.totalAcceptances += item.acceptances_count;
        existingStats.acceptanceRate =
          existingStats.totalAcceptances / existingStats.totalSuggestions;
      } else {
        languageStatsMap.set(item.language, {
          language: item.language,
          totalSuggestions: item.suggestions_count,
          totalAcceptances: item.acceptances_count,
          acceptanceRate: item.acceptances_count / item.suggestions_count,
        });
      }
    });
  });
  return Array.from(languageStatsMap.values());
}

export const mappingRoutes: Record<string, MetricsType> = {
  '/copilot/enterprise': 'enterprise',
  '/copilot/organization': 'organization',
};
