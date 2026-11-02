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

import type { WorkflowItem } from './utils';
import succeededFixture from '../__fixtures__/succeeded-workflow.json';

/**
 * Creates a WorkflowItem for testing by spreading overrides on top of a
 * real JSON fixture (succeeded-workflow.json).
 *
 * This approach:
 * - Uses realistic data from an actual Argo Workflows API response
 * - Allows targeted overrides for specific test scenarios
 * - Keeps test data consistent with the production data shape
 */
export function makeWorkflowItem(
  overrides: Partial<{
    name: string;
    namespace: string;
    startedAt: string;
    finishedAt: string;
    sourceInstance: string;
    phase: string;
  }> = {},
): WorkflowItem {
  return {
    ...succeededFixture,
    id: overrides.name ?? succeededFixture.metadata.name,
    metadata: {
      ...succeededFixture.metadata,
      ...(overrides.name && { name: overrides.name }),
      ...(overrides.namespace && { namespace: overrides.namespace }),
    },
    status: {
      ...succeededFixture.status,
      ...(overrides.phase && { phase: overrides.phase }),
      ...(overrides.startedAt && { startedAt: overrides.startedAt }),
      ...(overrides.finishedAt !== undefined && {
        finishedAt: overrides.finishedAt,
      }),
    },
    sourceInstance: overrides.sourceInstance,
  } as WorkflowItem;
}
