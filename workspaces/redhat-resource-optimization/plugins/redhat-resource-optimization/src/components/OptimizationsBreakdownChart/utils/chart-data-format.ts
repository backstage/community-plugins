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
  LongTermRecommendationBoxPlots,
  MediumTermRecommendationBoxPlots,
  RecommendationBoxPlotsRecommendations,
  ShortTermRecommendationBoxPlots,
} from '@backstage-community/plugin-redhat-resource-optimization-common';
import {
  Interval,
  OptimizationType,
  RecommendationType,
  ResourceType,
  UsageType,
} from '../types/chart';
import { format } from 'date-fns';

export const getRecommendationTerm = (
  interval: Interval,
  recommendations?: RecommendationBoxPlotsRecommendations,
):
  | ShortTermRecommendationBoxPlots
  | MediumTermRecommendationBoxPlots
  | LongTermRecommendationBoxPlots => {
  let result;
  // eslint-disable-next-line default-case
  switch (interval) {
    case 'shortTerm':
      result = recommendations?.recommendationTerms?.shortTerm;
      break;
    case 'mediumTerm':
      result = recommendations?.recommendationTerms?.mediumTerm;
      break;
    case 'longTerm':
      result = recommendations?.recommendationTerms?.longTerm;
      break;
  }

  return result || {};
};

export const createUsageDatum = (
  usageType: UsageType,
  currentInterval: Interval,
  recommendations?: RecommendationBoxPlotsRecommendations,
) => {
  const datum = [];

  if (recommendations) {
    const term = getRecommendationTerm(currentInterval, recommendations);
    const plotsData = term?.plots?.plotsData || {};

    for (const key of Object.keys(plotsData)) {
      const data = plotsData?.[key]?.[usageType];
      const date = new Date(key);
      const xVal =
        currentInterval === 'shortTerm'
          ? format(date, 'kk:mm')
          : format(date, 'MMM d');
      datum.push({
        key,
        name: usageType,
        units: data?.format,
        x: xVal,
        y: data ? [data.min, data.median, data.max, data.q1, data.q3] : [null],
      });
    }
  }

  // Pad dates if plots_data is missing
  if (datum.length === 0 && recommendations?.monitoringEndTime) {
    if (currentInterval === 'shortTerm') {
      const today = new Date(recommendations?.monitoringEndTime);
      for (let hour = 24; hour > 0; hour -= 6) {
        today.setHours(today.getHours() - hour);
        datum.push({
          key: today.toDateString(),
          name: usageType,
          x: format(today, 'kk:mm'),
          y: [null],
        });
      }
    } else {
      for (let day = currentInterval === 'longTerm' ? 15 : 7; day > 0; day--) {
        const today = new Date(recommendations?.monitoringEndTime);
        today.setDate(today.getDate() - day);
        datum.push({
          key: today.toDateString(),
          name: usageType,
          x: format(today, 'MMM d'),
          y: [null],
        });
      }
    }
  }
  return datum;
};

export const createRecommendationDatum = (
  currentInterval: Interval,
  usageDatum: any,
  recommendationType: RecommendationType,
  resourceType: ResourceType,
  optimizationType: OptimizationType,
  recommendations?: RecommendationBoxPlotsRecommendations,
) => {
  const term = getRecommendationTerm(currentInterval, recommendations);
  const values =
    term?.recommendationEngines?.[optimizationType]?.config?.[resourceType]?.[
      recommendationType
    ];

  const datum: any[] = [];

  if (values) {
    usageDatum.forEach((data: any) => {
      datum.push({
        ...data,
        name: resourceType,
        y: values.amount,
        units: values.format,
      });
    });
  }

  return datum.length
    ? [
        {
          ...datum[0],
          key: undefined, // Don't use date here
          x: 0, // Extends threshold lines to chart edge
        },
        ...datum,
        {
          ...datum[0],
          key: undefined, // Don't use date here
          x: 100,
        },
      ]
    : [];
};
