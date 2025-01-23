/*
 * Copyright 2021 The Backstage Authors
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

import { JsonValue } from '@backstage/types';
import { Check as Check$1 } from '@backstage-community/plugin-tech-insights-common';
/**
 * Represents a single check defined on the TechInsights backend.
 *
 * @public
 * @deprecated Import from \@backstage-community/plugin-tech-insights-common
 */
export type Check = Check$1;

/**
 * Represents a Fact defined on the TechInsights backend.
 *
 * @public
 * @deprecated Import from \@backstage-community/plugin-tech-insights-common
 */
export interface InsightFacts {
  [factId: string]: {
    timestamp: string;
    version: string;
    facts: Record<string, JsonValue>;
  };
}
