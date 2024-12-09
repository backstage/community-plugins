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
import type { GetRecommendationListRequest } from '@backstage-community/plugin-redhat-resource-optimization-common';

export const DEFAULT_DEBOUNCE_INTERVAL: number = 700;
export const DEFAULT_PAGE_SIZE_OPTIONS: number[] = [10, 20, 50, 100];
export const DEFAULT_SORTING_DIRECTION: GetRecommendationListRequest['query']['orderHow'] =
  'desc';
export const DEFAULT_SORTING_COLUMN: GetRecommendationListRequest['query']['orderBy'] =
  'last_reported';
export const DEFAULT_PADDING: 'dense' | 'default' = 'dense';
