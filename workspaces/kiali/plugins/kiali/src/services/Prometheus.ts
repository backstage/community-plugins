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
import { DurationInSeconds } from '@backstage-community/plugin-kiali-common/types';
import { serverConfig } from '../config/ServerConfig';

// The step needs to minimally cover 2 datapoints to get any sort of average. So 2*scrape is the bare
// minimum.  We set rateInterval=step which basically gives us the rate() of each disjoint set.
// (note, another approach could be to set rateInterval=step+scrape, the overlap could produce some
// smoothing). The rateInterval should typically not be < step or you're just omitting datapoints.
const defaultDataPoints = 50;
const defaultScrapeInterval = 15; // seconds
const minDataPoints = 2;

export interface PrometheusRateParams {
  rateInterval: string;
  step: number;
}

export const computePrometheusRateParams = (
  duration: DurationInSeconds,
  dataPoints?: number,
  scrapeInterval?: DurationInSeconds,
): PrometheusRateParams => {
  let actualDataPoints = dataPoints || defaultDataPoints;
  if (actualDataPoints < minDataPoints) {
    actualDataPoints = defaultDataPoints;
  }

  const configuredScrapeInterval =
    serverConfig && serverConfig.prometheus.globalScrapeInterval;
  const actualScrapeInterval =
    scrapeInterval || configuredScrapeInterval || defaultScrapeInterval;
  const minStep = 2 * actualScrapeInterval;
  let step = Math.floor(duration / actualDataPoints);
  step = step < minStep ? minStep : step;
  return {
    step: step,
    rateInterval: `${step}s`,
  };
};
