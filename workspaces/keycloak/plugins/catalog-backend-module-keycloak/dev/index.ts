/*
 * Copyright 2024 The Backstage Authors
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

import { catalogModuleKeycloakEntityProvider } from '../src/module/catalogModuleKeycloakEntityProvider';

const backend = createBackend();

// api endpoints from here: https://github.com/backstage/backstage/blob/master/plugins/catalog-backend/src/service/createRouter.ts
backend.add(import('@backstage/plugin-catalog-backend'));

// Subscribe to catalog errors https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

backend.add(catalogModuleKeycloakEntityProvider);

backend.start();
