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
  LabelDisplayName,
  PromLabel,
  SingleLabelValues,
} from '../../types/Metrics';

export type Quantiles = '0.5' | '0.95' | '0.99' | '0.999';
export const allQuantiles: Quantiles[] = ['0.5', '0.95', '0.99', '0.999'];

export type LabelSettings = {
  checked: boolean;
  displayName: LabelDisplayName;
  values: SingleLabelValues;
  defaultValue: boolean;
  singleSelection: boolean;
};
export type LabelsSettings = Map<PromLabel, LabelSettings>;

export interface MetricsSettings {
  labelsSettings: LabelsSettings;
  showAverage: boolean;
  showSpans: boolean;
  showTrendlines: boolean;
  showQuantiles: Quantiles[];
}
