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
import {
  MANAGE_KIND_COMMON,
  ManageTabs,
  OrganizationGraph,
} from '@backstage-community/plugin-manage';
import {
  manageTechInsightsColumns,
  ManageTechInsightsCards,
  ManageTechInsightsGrid,
} from '@backstage-community/plugin-manage-module-tech-insights';

export function Manage() {
  return (
    <ManageTabs
      combined={{
        header: <ManageTechInsightsCards inAccordion />,
        columns: [manageTechInsightsColumns({ combined: true })],
      }}
      starred={{
        header: <ManageTechInsightsGrid />,
        columns: [manageTechInsightsColumns({ combined: true })],
      }}
      kinds={{
        [MANAGE_KIND_COMMON]: {
          header: <ManageTechInsightsCards inAccordion />,
          columns: [manageTechInsightsColumns()],
        },
        component: {
          columns: [manageTechInsightsColumns({ combined: true })],
        },
      }}
      tabsAfter={[
        {
          path: 'organization',
          title: 'Organization',
          children: <OrganizationGraph />,
        },
      ]}
    />
  );
}
