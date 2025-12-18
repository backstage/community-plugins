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

/**
 * DEVELOPMENT SETUP FOR AZURE RESOURCES ENTITY PROVIDER
 *
 * This file creates a minimal backend to test the Azure Resources
 * entity provider with real Azure API queries.
 *
 * SETUP:
 * 1. Add the following devDependencies to package.json:
 *    - @backstage/backend-defaults
 *    - @backstage/plugin-catalog-backend
 *    - @backstage/plugin-catalog-backend-module-logs (optional)
 *
 * 2. Configure Azure authentication (choose one):
 *    a) Use DefaultAzureCredential (uses az cli, managed identity, etc.)
 *    b) Set credentials in the config below
 *
 * 3. Update the configuration below with your subscription IDs and query
 *
 * 4. Run: yarn start
 *
 * 5. Access the backend at http://localhost:7007
 *    - Catalog API: http://localhost:7007/api/catalog/entities
 *    - View entities ingested from Azure
 */

import { createBackend } from '@backstage/backend-defaults';
import { mockServices } from '@backstage/backend-test-utils';
import { catalogModuleAzureResources } from '../src/module';

const backend = createBackend();

// Add catalog plugin - provides infrastructure for entity providers
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// Use mock auth services for local development (no authentication required)
backend.add(mockServices.auth.factory());
backend.add(mockServices.httpAuth.factory());

// // add inline config or use the app-config.yaml
// backend.add(
//   mockServices.rootConfig.factory({})
// );

// Add the Azure Resources entity provider module
backend.add(catalogModuleAzureResources);

backend.start();
