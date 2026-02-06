/*
 * Copyright 2025 The Backstage Authors
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
import { Finding, Statistics } from '../../../models';

export const getFindingStatistics = (data: Finding[] = []) => {
  return data.reduce<Statistics>(
    (prev, next) => {
      prev[next.kind][next.level] = prev[next.kind][next.level]! + 1;
      prev[next.kind].total = prev[next.kind].total + 1;

      prev[next.level] = prev[next.level] + 1;
      prev.total = prev.total + 1;

      return prev;
    },
    {
      dependencies: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      code: { critical: null, high: 0, medium: 0, low: 0, total: 0 },
      containers: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
    },
  );
};
