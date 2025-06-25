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
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import {
  CatalogService,
  catalogServiceRef,
} from '@backstage/plugin-catalog-node';
import { actionsRegistryServiceRef } from '@backstage/backend-plugin-api/alpha';
/**
 * backstageMcpPlugin backend plugin
 *
 * @public
 */
export const backstageMcpPlugin = createBackendPlugin({
  pluginId: 'backstage-mcp-plugin',
  register(env) {
    env.registerInit({
      deps: {
        actionsRegistry: actionsRegistryServiceRef,
        logger: coreServices.logger,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        auth: coreServices.auth,
      },
      // Sample action used in the Backstage docs: https://github.com/backstage/backstage/tree/master/plugins/mcp-actions-backend
      async init({ actionsRegistry, catalog, auth }) {
        actionsRegistry.register({
          name: 'greet-user',
          title: 'Greet User',
          description: 'Generate a personalized greeting',
          schema: {
            input: z =>
              z.object({
                name: z.string().describe('The name of the person to greet'),
              }),
            output: z =>
              z.object({
                greeting: z.string().describe('The generated greeting'),
              }),
          },
          action: async ({ input }) => ({
            output: { greeting: `Hello ${input.name}!` },
          }),
        });
        // This action is used to fetch the list of catalog entities from Backstage. It returns an array of entity names
        actionsRegistry.register({
          name: 'fetch-catalog-entities',
          title: 'Fetch Catalog Entities',
          description:
            'Retrieve the list of catalog entities from the Backstage server.',
          schema: {
            input: z => z.object({}),
            output: z =>
              z.object({
                entities: z
                  .array(
                    z.object({
                      name: z
                        .string()
                        .describe(
                          'The name field for each Backstage entity in the catalog',
                        ),
                    }),
                  )
                  .describe('An array of entities'),
              }),
          },
          action: async ({}) => ({
            output: await fetchCatalogEntities(catalog, auth),
          }),
        });
      },
    });
  },
});

// TODO: This function currently just returns the name of the entity. We should expand this further as needed
export async function fetchCatalogEntities(catalog: CatalogService, auth: any) {
  const credentials = await auth.getOwnServiceCredentials();
  const { items } = await catalog.getEntities(
    {
      fields: ['metadata.name'],
    },
    {
      credentials,
    },
  );

  return {
    entities: items.map(entity => ({
      name: entity.metadata.name,
    })),
  };
}
