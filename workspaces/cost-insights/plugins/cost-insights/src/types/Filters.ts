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

import { Maybe } from '@backstage-community/plugin-cost-insights-common';
import { Duration } from './Duration';

/**
 * @public
 */
export interface PageFilters {
  group: Maybe<string>;
  project: Maybe<string>;
  duration: Duration;
  metric: string | null;
}

/**
 * @public
 */
export type ProductFilters = Array<ProductPeriod>;

/**
 * @public
 */
export interface ProductPeriod {
  duration: Duration;
  productType: string;
}
