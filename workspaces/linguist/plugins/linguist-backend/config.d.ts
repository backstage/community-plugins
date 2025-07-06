/*
 * Copyright 2023 The Backstage Authors
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

import { SchedulerServiceTaskScheduleDefinition } from '@backstage/backend-plugin-api';
import { HumanDuration } from '@backstage/types';
import { Options as LinguistJsOptions } from 'linguist-js/dist/types';

export interface Config {
  /** Configuration options for the linguist plugin */
  linguist?: {
    schedule?: SchedulerServiceTaskScheduleDefinition;
    /**
     * @default 20
     */
    batchSize?: number;
    /**
     * @default false
     */
    useSourceLocation?: boolean;
    /**
     * Refresh generated language breakdown
     */
    age?: HumanDuration;
    /**
     * @default ['API', 'Component', 'Template']
     */
    kind?: string[];
    /**
     * [linguist-js](https://www.npmjs.com/package/linguist-js) options
     */
    linguistJsOptions?: LinguistJsOptions;
  };
}
