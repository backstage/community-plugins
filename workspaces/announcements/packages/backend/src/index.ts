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

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// events
backend.add(import('@backstage/plugin-events-backend'));

// signals
backend.add(import('@backstage/plugin-signals-backend'));

// notifications
backend.add(import('@backstage/plugin-notifications-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
backend.add(import('./permissionsPolicyExtension'));

// search plugins
backend.add(import('@backstage/plugin-search-backend'));
backend.add(import('@backstage/plugin-search-backend-module-pg'));
backend.add(import('@backstage/plugin-search-backend-module-catalog'));

// announcements
backend.add(import('@backstage-community/plugin-announcements-backend'));
backend.add(
  import('@backstage-community/plugin-search-backend-module-announcements'),
);

backend.start();
