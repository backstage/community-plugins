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
import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// Development setup: a minimal backend that mounts the mcp-capabilities plugin
// with mocked auth and a mock catalog containing one native mcp-server entity.
//
// Start with `yarn start` in the package directory, then:
//   curl 'http://localhost:7007/api/mcp-capabilities/spec?entityRef=api:default/sample-mcp'
//
// The remote URL below must point at a reachable MCP server (streamable-http)
// for a live tools/resources/prompts result.

const backend = createBackend();

backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());

backend.add(
  catalogServiceMock.factory({
    entities: [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'API',
        metadata: { name: 'sample-mcp', namespace: 'default' },
        spec: {
          type: 'mcp-server',
          lifecycle: 'experimental',
          owner: 'guests',
          remotes: [
            { type: 'streamable-http', url: 'http://localhost:8000/mcp' },
          ],
        },
      },
    ],
  }),
);

backend.add(import('../src'));

backend.start();
