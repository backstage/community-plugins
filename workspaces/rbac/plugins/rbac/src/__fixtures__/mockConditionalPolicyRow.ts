/*
 * Copyright 2026 The Backstage Authors
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
import { PermissionsData } from '../types';

/**
 * A conditional permission policy row as it appears in the role form. An
 * `id` marks the row as already persisted; the `label` makes two rows with
 * different rule parameters distinguishable in diffs.
 */
export const conditionalPolicyRow = (
  id: number | undefined,
  label: string,
): PermissionsData => ({
  id,
  plugin: 'catalog',
  permission: 'catalog.entity.delete',
  resourceType: 'catalog-entity',
  isResourced: true,
  policies: [{ policy: 'Delete', effect: 'allow' }],
  conditions: {
    condition: {
      rule: 'HAS_LABEL',
      resourceType: 'catalog-entity',
      params: { label },
    },
  },
});
