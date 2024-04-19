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
import {
  createApiFactory,
  createPlugin,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { airbrakeApiRef, ProductionAirbrakeApi } from './api';

/**
 * The Airbrake plugin instance
 *
 * @public
 */
export const airbrakePlugin = createPlugin({
  id: 'airbrake',
  apis: [
    createApiFactory({
      api: airbrakeApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory: ({ discoveryApi }) => new ProductionAirbrakeApi(discoveryApi),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});
