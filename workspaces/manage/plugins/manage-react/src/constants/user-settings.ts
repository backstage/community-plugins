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

/**
 * Known user settings which are used through the Manage page, and are
 * pre-fetched on page load.
 *
 * @public
 */
export const userSettingsKeys = {
  'page-tab-order': ['$manage-page-tabs', 'order'],
  'kind-order': ['$manage-page-kind', 'order'],
  'entities-table-page-size': ['$manage-page-entities-table', 'page-size'],
  'entities-combined': ['$manage-page-filter', 'combined'],
} satisfies Record<string, [string, string]>;
