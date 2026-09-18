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

import { GraphQLEndpoints } from '@backstage-community/plugin-graphiql';
import { GraphiQLEndpointBlueprint } from './alpha';

describe('GraphiQLEndpointBlueprint', () => {
  it('attaches endpoints to the GraphiQL browse API', () => {
    const extension = GraphiQLEndpointBlueprint.make({
      params: {
        endpoint: GraphQLEndpoints.create({
          id: 'test',
          title: 'Test',
          url: 'https://example.com/graphql',
        }),
      },
    });

    expect(extension.attachTo).toEqual({
      id: 'api:graphiql',
      input: 'endpoints',
    });
  });
});
