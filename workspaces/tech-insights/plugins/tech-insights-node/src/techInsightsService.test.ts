/*
 * Copyright 2022 The Backstage Authors
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

import { createBackendModule } from '@backstage/backend-plugin-api';
import {
  registerMswTestHooks,
  startTestBackend,
} from '@backstage/backend-test-utils';
import { setupServer } from 'msw/node';
import { techInsightsServiceRef } from './techInsightsService';

describe('techInsightsServiceRef', () => {
  const server = setupServer();
  registerMswTestHooks(server);

  it('should return a techInsightsClient', async () => {
    expect.assertions(1);

    const testModule = createBackendModule({
      moduleId: 'test',
      pluginId: 'test',
      register(env) {
        env.registerInit({
          deps: {
            techInsights: techInsightsServiceRef,
          },
          async init({ techInsights }) {
            expect(techInsights.getAllChecks).toBeDefined();
          },
        });
      },
    });

    await startTestBackend({
      features: [testModule],
    });
  });
});
