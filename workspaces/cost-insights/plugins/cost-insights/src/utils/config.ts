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

import { Currency } from '../types';
import { Metric } from '@backstage-community/plugin-cost-insights-common';

export function validateMetrics(metrics: Metric[]) {
  const defaults = metrics.filter(metric => metric.default);
  if (defaults.length > 1) {
    throw new Error(
      `Only one default metric can be set at a time. Found ${defaults.length}`,
    );
  }
}

export function validateCurrencies(currencies: Currency[]) {
  const withoutKinds = currencies.filter(currency => currency.kind === null);
  if (withoutKinds.length > 1) {
    throw new Error(
      `Only one currency can be without kind. Found ${withoutKinds.length}`,
    );
  }
}
