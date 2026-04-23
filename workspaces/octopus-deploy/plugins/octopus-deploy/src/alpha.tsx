/*
 * Copyright 2023 The Backstage Authors
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
  ApiBlueprint,
  configApiRef,
  createFrontendPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  FormFieldBlueprint,
  createFormField,
} from '@backstage/plugin-scaffolder-react/alpha';
import { ConfigApi, DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

import { isOctopusDeployAvailable } from './plugin';
import { OctopusDeployClient, octopusDeployApiRef } from './api';

/**
 * @alpha
 */
export const octopusDeployApi = ApiBlueprint.make({
  name: 'octopusDeployApi',
  params: defineParams =>
    defineParams({
      api: octopusDeployApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        configApi: configApiRef,
      },
      factory: ({
        discoveryApi,
        fetchApi,
        configApi,
      }: {
        discoveryApi: DiscoveryApi;
        fetchApi: FetchApi;
        configApi: ConfigApi;
      }) => new OctopusDeployClient({ discoveryApi, fetchApi, configApi }),
    }),
});

/**
 * @alpha
 */
export const octopusDeployEntityContent: any = EntityContentBlueprint.make({
  name: 'octopusDeployEntityContent',
  params: {
    path: 'octopus-deploy',
    title: 'Octopus Deploy',
    filter: isOctopusDeployAvailable,
    loader: () =>
      import('./components/EntityPageOctopusDeploy').then(m => (
        <m.EntityPageOctopusDeploy />
      )),
  },
});

/**
 * @alpha
 */
export const octopusDeployProjectGroupDropdown = FormFieldBlueprint.make({
  name: 'OctopusDeployProjectGroupDropdown',
  params: {
    field: () =>
      import('./components/ScaffolderDropdown').then(m =>
        createFormField({
          name: 'OctopusDeployProjectGroupDropdown',
          component: m.ProjectGroupDropdown,
        }),
      ),
  },
});

/**
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'octopus-deploy',
  extensions: [
    octopusDeployApi,
    octopusDeployEntityContent,
    octopusDeployProjectGroupDropdown,
  ],
});
