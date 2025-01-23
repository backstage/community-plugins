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

import { JsonValue } from '@backstage/types';
import { Check as _Check } from '../types';

/**
 * Represents a single check defined on the TechInsights backend.
 *
 * @public
 * @deprecated
 *
 * Use Check directly from `@backstage-community/plugin-tech-insights-common` instead
 */
export type Check = _Check;

/**
 * Represents a Fact defined on the TechInsights backend.
 *
 * @public
 * @deprecated
 *
 * Use InsightFacts directly from `@backstage-community/plugin-tech-insights-common` instead
 */
export interface InsightFacts {
  /**
   * a single fact in the backend
   */
  [factId: string]: {
    timestamp: string;
    version: string;
    facts: Record<string, JsonValue>;
  };
}
