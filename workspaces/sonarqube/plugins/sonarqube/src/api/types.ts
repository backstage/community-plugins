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

import {
  MetricKey as NonDeprecatedMetricKey,
  SonarUrlProcessorFunc as NonDeprecatedSonarUrlProcessorFunc,
} from '@backstage-community/plugin-sonarqube-react';

export interface InstanceUrlWrapper {
  instanceUrl: string;
}

export interface FindingsWrapper {
  analysisDate: string;
  measures: Measure[];
}

/**
 * @deprecated use the same type from `@backstage-community/plugin-sonarqube-react` instead
 */
export type MetricKey = NonDeprecatedMetricKey;

export interface Measure {
  metric: MetricKey;
  value: string;
}

/**
 * @deprecated use the same type from `@backstage-community/plugin-sonarqube-react` instead
 */
export type SonarUrlProcessorFunc = NonDeprecatedSonarUrlProcessorFunc;
