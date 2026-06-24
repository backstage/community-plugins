/*
 * Copyright 2021 The Backstage Authors
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
import { createApiFactory } from '@backstage/core-plugin-api';
import { xcmetricsApiRef } from '../src/api';
import { xcmetricsPlugin, XcmetricsPage } from '../src/plugin';
import { DevXcmetricsApi } from './DevXcmetricsApi';

createDevApp()
  .registerPlugin(xcmetricsPlugin)
  // Override the real HTTP client with an in-memory mock so the plugin is
  // fully functional locally without a running XCMetrics backend.
  .registerApi(
    createApiFactory({
      api: xcmetricsApiRef,
      deps: {},
      factory: () => new DevXcmetricsApi(),
    }),
  )
  .addPage({
    element: <XcmetricsPage />,
    title: 'Root Page',
    path: '/xcmetrics',
  })
  .render();
