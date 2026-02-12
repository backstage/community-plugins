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
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isN8nAvailable } from '../components/Router';

/**
 * @alpha
 */
export const entityN8nLatestExecutionCard = EntityCardBlueprint.make({
  name: 'latest-execution',
  params: {
    filter: isN8nAvailable,
    loader: () =>
      import(
        '../components/N8nLatestExecutionCard/N8nLatestExecutionCard'
      ).then(m => <m.N8nLatestExecutionCard />),
  },
});

/**
 * @alpha
 */
export const entityN8nWorkflowsTable = EntityCardBlueprint.make({
  name: 'workflows-table',
  params: {
    filter: isN8nAvailable,
    loader: () =>
      import('../components/N8nWorkflowsTable/N8nWorkflowsTable').then(m => (
        <m.N8nWorkflowsTable />
      )),
  },
});
