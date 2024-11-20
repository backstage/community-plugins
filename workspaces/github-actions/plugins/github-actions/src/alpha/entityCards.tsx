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
import React from 'react';
import { EntityCardBlueprint } from '@backstage/plugin-catalog-react/alpha';
import { isGithubActionsAvailable } from '../components/Router';

/**
 * @alpha
 */
export const entityGithubActionsCard = EntityCardBlueprint.make({
  name: 'workflow-runs',
  params: {
    filter: isGithubActionsAvailable,
    loader: () =>
      import('../components/Router').then(m => <m.Router view="cards" />),
  },
});

/**
 * @alpha
 */
export const entityLatestGithubActionRunCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'latest-workflow-run',
    config: {
      schema: {
        props: z =>
          z
            .object({
              branch: z.string().default('master'),
            })
            .default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: isGithubActionsAvailable,
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.LatestWorkflowRunCard {...config.props} />
          )),
      });
    },
  });

/**
 * @alpha
 */
export const entityLatestGithubActionsForBranchCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'latest-branch-workflow-runs',
    config: {
      schema: {
        props: z =>
          z
            .object({
              branch: z.string().default('master'),
            })
            .default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: isGithubActionsAvailable,
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.LatestWorkflowsForBranchCard {...config.props} />
          )),
      });
    },
  });

/**
 * @alpha
 */
export const entityRecentGithubActionsRunsCard =
  EntityCardBlueprint.makeWithOverrides({
    name: 'recent-workflow-runs',
    config: {
      schema: {
        props: z =>
          z
            .object({
              branch: z.string().default('master'),
              dense: z.boolean().default(false),
              limit: z.number().default(5).optional(),
            })
            .default({}),
      },
    },
    factory(originalFactory, { config }) {
      return originalFactory({
        filter: isGithubActionsAvailable,
        loader: async () =>
          import('../components/Cards').then(m => (
            <m.RecentWorkflowRunsCard {...config.props} />
          )),
      });
    },
  });
