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

/**
 * Local development backend for entity-patch-backend.
 *
 * Run with:  yarn workspace @backstage-community/plugin-entity-patch-backend start
 *   or via:  yarn start  (from the workspace root, runs alongside the frontend)
 *
 * The backend reads app-config.yaml from the workspace root and exposes the
 * plugin at http://localhost:7007/api/entity-patch
 *
 * The catalog is populated from examples/entities.yaml and examples/org.yaml
 * using an in-memory SQLite database — no external services required.
 *
 * Useful endpoints:
 *   GET  /api/entity-patch/health
 *   GET  /api/entity-patch/values/default/component/payments-api
 *   GET  /api/entity-patch/values/default/group/platform-team
 *   POST /api/entity-patch/patches/default/component/payments-api
 */

import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

// Minimal auth setup — guest provider accepts unauthenticated requests in dev
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// Catalog is required so the plugin can resolve entities by ref
backend.add(import('@backstage/plugin-catalog-backend'));
// catalog plugin
// backend.add(import('@backstage/plugin-catalog-backend'));
// backend.add(
//   import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
// );

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// The entity-patch backend plugin itself
backend.add(import('../src'));

backend.start();
