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

import { createDevApp } from '@backstage/dev-utils';
// eslint-disable-next-line @backstage/no-ui-css-imports-in-non-frontend
import '@backstage/ui/css/styles.css';
import {
  GraphqlVoyagerPage,
  graphqlVoyagerPlugin,
  GraphQLVoyagerEndpoints,
  graphQlVoyagerApiRef,
} from '../src';
import { dismissResizeObserverOverlay } from './dismissResizeObserverOverlay';

dismissResizeObserverOverlay();

createDevApp()
  .registerPlugin(graphqlVoyagerPlugin)
  .registerApi({
    api: graphQlVoyagerApiRef,
    deps: {},
    factory() {
      return GraphQLVoyagerEndpoints.from([
        {
          id: 'countries',
          title: 'Countries',
          introspectionErrorMessage:
            'Unable to introspect the Countries GraphQL API.',
          introspection: async (query: string) => {
            const res = await fetch('https://countries.trevorblades.com/', {
              method: 'POST',
              body: JSON.stringify({ query }),
              headers: {
                'Content-Type': 'application/json',
              },
            });
            return res.json();
          },
        },
        {
          id: 'broken',
          title: 'Broken endpoint',
          introspectionErrorMessage:
            'Unable to perform introspection, make sure you are on the correct environment.',
          introspection: async () => ({ data: null }),
        },
      ]);
    },
  })
  .addPage({
    element: <GraphqlVoyagerPage />,
    title: 'GraphQL Voyager',
    path: '/graphql-voyager',
  })
  .render();
