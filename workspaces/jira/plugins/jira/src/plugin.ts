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
  configApiRef,
  createPlugin,
  createApiFactory,
  discoveryApiRef,
  createComponentExtension,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { jiraApiRef, JiraAPI } from './api';

/**
 * @public
 *
 * Creates and exports the Jira plugin.
 *
 * This plugin is identified by the ID 'jira-dashboard' and provides the necessary
 * APIs for interacting with Jira, including discovery, configuration, and fetching.
 */
export const jiraPlugin = createPlugin({
  id: 'jira-dashboard',
  apis: [
    createApiFactory({
      api: jiraApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
        fetchApi: fetchApiRef,
      },
      factory: ({ discoveryApi, configApi, fetchApi }) => {
        return new JiraAPI({
          discoveryApi,
          configApi,
          fetchApi,
        });
      },
    }),
  ],
});

/**
 * @public
 *
 * Provides the JiraWrapperCard component extension for the Jira plugin.
 *
 * This component is loaded lazily from the './components/JiraCard' module
 * and uses the `JiraWrapper` export from that module.
 */
export const JiraWrapperCard = jiraPlugin.provide(
  createComponentExtension({
    name: 'JiraWrapperCard',
    component: {
      lazy: () => import('./components/JiraCard').then(m => m.JiraWrapper),
    },
  }),
);

/**
 * @public
 *
 * Provides the JiraEntityWrapperCard component extension for the Jira plugin.
 *
 * This component is loaded lazily from the './components/JiraCard' module and
 * uses the `JiraEntityWrapper` export from that module.
 *
 */
export const JiraEntityWrapperCard = jiraPlugin.provide(
  createComponentExtension({
    name: 'JiraEntityWrapperCard',
    component: {
      lazy: () =>
        import('./components/JiraCard').then(m => m.JiraEntityWrapper),
    },
  }),
);
