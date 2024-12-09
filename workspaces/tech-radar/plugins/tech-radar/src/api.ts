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

import { ApiRef, createApiRef } from '@backstage/core-plugin-api';
import { TechRadarLoaderResponse } from '@backstage-community/plugin-tech-radar-common';

/**
 * {@link @backstage/core-plugin-api#ApiRef} for the {@link TechRadarApi}
 *
 * @public
 */
export const techRadarApiRef: ApiRef<TechRadarApi> = createApiRef<TechRadarApi>(
  {
    id: 'plugin.techradar.service',
  },
);

/**
 * Tech Radar API responsible for loading data for the plugin
 *
 * @remarks
 *
 * This can be implemented by user; {@link https://github.com/backstage/backstage/blob/master/plugins/tech-radar/src/defaultApi.ts | default}
 * by defaults will attempt to load data from tech-radar-backend plugin, and serve mock data if it's not installed.
 *
 * @public
 */
export interface TechRadarApi {
  /**
   * Loads the TechRadar response data to pass through to the TechRadar component.
   * Takes the id prop of the TechRadarComponent or TechRadarPage to distinguish between multiple radars if needed
   */
  load: (id: string | undefined) => Promise<TechRadarLoaderResponse>;
}
