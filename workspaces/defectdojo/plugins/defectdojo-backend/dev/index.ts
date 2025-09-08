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
import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogServiceMock } from '@backstage/plugin-catalog-node/testUtils';

// TEMPLATE NOTE:
// This is the development setup for your plugin that wires up a
// minimal backend that can use both real and mocked plugins and services.
//
// Start up the backend by running `yarn start` in the package directory.
// Once it's up and running, try out the following requests:
//
// Health check:
//   curl http://localhost:7007/api/defectdojo/health
//
// Get findings for a product (requires authentication):
//   curl http://localhost:7007/api/defectdojo/v1/findings?productId=123 -H 'Authorization: Bearer mock-user-token'
//
// Get product information:
//   curl http://localhost:7007/api/defectdojo/v1/products/123 -H 'Authorization: Bearer mock-user-token'
//
// Get engagements for a product:
//   curl http://localhost:7007/api/defectdojo/v1/engagements?productId=123 -H 'Authorization: Bearer mock-user-token'

const backend = createBackend();

// TEMPLATE NOTE:
// Mocking the auth and httpAuth service allows you to call your plugin API without
// having to authenticate.
//
// If you want to use real auth, you can install the following instead:
//   backend.add(import('@backstage/plugin-auth-backend'));
//   backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());

// Add mock configuration for DefectDojo
backend.add(
  mockServices.rootConfig.factory({
    data: {
      defectdojo: {
        baseUrl: 'https://defectdojo.company.com',
        token: 'test-token',
        requestTimeoutMs: 30000,
        maxPages: 100,
      },
    },
  }),
);

// TEMPLATE NOTE:
// Rather than using a real catalog you can use a mock with a fixed set of entities.
backend.add(
  catalogServiceMock.factory({
    entities: [
      {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: {
          name: 'sample',
          title: 'Sample Component',
        },
        spec: {
          type: 'service',
        },
      },
    ],
  }),
);

backend.add(import('../src'));

backend.start();
