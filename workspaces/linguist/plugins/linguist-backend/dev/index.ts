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

const backend = createBackend();

// the auth plugin is needed to setup a fully authenticated backend for the catalog backend
backend.add(import('@backstage/plugin-auth-backend'));
// this is the simplest authentication provider
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// We need the catalog plugin to get the example entities and make the front entity page functional
backend.add(import('@backstage/plugin-catalog-backend'));

backend.add(import('../src/index'));
backend.add(
  import(
    '@backstage-community/plugin-catalog-backend-module-linguist-tags-processor'
  ),
);

backend.start();
