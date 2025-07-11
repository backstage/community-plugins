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
  createExtensionBlueprint,
  createExtensionDataRef,
  createExtensionInput,
  createFrontendPlugin,
  NavItemBlueprint,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  graphQlBrowseApiRef,
  GraphQLEndpoints,
  GraphQLEndpoint,
  GraphiQLIcon,
} from '@backstage-community/plugin-graphiql';
import { createApiFactory } from '@backstage/core-plugin-api';
import { graphiQLRouteRef } from './route-refs';
import {
  compatWrapper,
  convertLegacyRouteRef,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';

/** @alpha */
export const graphiqlPage = PageBlueprint.make({
  params: {
    defaultPath: '/graphiql',
    routeRef: convertLegacyRouteRef(graphiQLRouteRef),
    loader: () =>
      import('./components').then(m => compatWrapper(<m.GraphiQLPage />)),
  },
});

/** @alpha */
export const graphiqlNavItem = NavItemBlueprint.make({
  params: {
    title: 'GraphiQL',
    routeRef: convertLegacyRouteRef(graphiQLRouteRef),
    icon: GraphiQLIcon,
  },
});

/** @internal */
const endpointDataRef = createExtensionDataRef<GraphQLEndpoint>().with({
  id: 'graphiql.graphiql-endpoint',
});

/** @alpha */
export const graphiqlBrowseApi = ApiBlueprint.makeWithOverrides({
  inputs: {
    endpoints: createExtensionInput([endpointDataRef]),
  },
  factory(originalFactory, { inputs }) {
    return originalFactory({
      factory: createApiFactory(
        graphQlBrowseApiRef,
        GraphQLEndpoints.from(
          inputs.endpoints.map(i => i.get(endpointDataRef)),
        ),
      ),
    });
  },
});

/** @alpha */
export const GraphiQLEndpointBlueprint = createExtensionBlueprint({
  kind: 'graphiql-endpoint',
  attachTo: { id: 'api:graphiql/browse', input: 'endpoints' },
  output: [endpointDataRef],
  factory(params: { endpoint: GraphQLEndpoint }) {
    return [endpointDataRef(params.endpoint)];
  },
});

/** @alpha */
const graphiqlGitlabGraphiQLEndpointExtension =
  GraphiQLEndpointBlueprint.makeWithOverrides({
    name: 'gitlab',
    disabled: true,
    config: {
      schema: {
        id: z => z.string().default('gitlab'),
        title: z => z.string().default('GitLab'),
        url: z => z.string().default('https://gitlab.com/api/graphql'),
      },
    },

    factory: (originalFactory, { config }) =>
      originalFactory({ endpoint: GraphQLEndpoints.create(config) }),
  });

/** @alpha */
export default createFrontendPlugin({
  pluginId: 'graphiql',
  extensions: [
    graphiqlPage,
    graphiqlNavItem,
    graphiqlBrowseApi,
    graphiqlGitlabGraphiQLEndpointExtension,
  ],
  routes: convertLegacyRouteRefs({
    root: graphiQLRouteRef,
  }),
});
