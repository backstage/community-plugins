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
import { config } from '../config';
import { ComputedServerConfig } from '../types';
import { IntervalInMilliseconds } from '../types/Common';

export const getName = (
  durationSeconds: number,
  serverConfig: ComputedServerConfig,
): string => {
  // Add checks for serverConfig
  if (!serverConfig || !serverConfig.durations) {
    return `${durationSeconds} seconds`;
  }

  const name = serverConfig.durations[durationSeconds];
  if (name) {
    return name;
  }
  return `${durationSeconds} seconds`;
};

export const getRefreshIntervalName = (
  refreshInterval: IntervalInMilliseconds,
): string => {
  // @ts-expect-error
  const refreshIntervalOption = config.toolbar.refreshInterval[refreshInterval];
  return refreshIntervalOption.replace('Every ', '');
};
