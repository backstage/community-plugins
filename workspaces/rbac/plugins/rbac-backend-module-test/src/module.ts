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
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';

import { rbacProviderExtensionPoint } from '@backstage-community/plugin-rbac-node';

import { TestProvider } from './provider/TestProvider';

/**
 * The test backend module for the rbac plugin.
 *
 * @alpha
 */
export const rbacModuleTest = createBackendModule({
  pluginId: 'permission',
  moduleId: 'test',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        rbac: rbacProviderExtensionPoint,
        scheduler: coreServices.scheduler,
        config: coreServices.rootConfig,
      },
      async init({ logger, rbac, scheduler, config }) {
        rbac.addRBACProvider(
          TestProvider.fromConfig(
            { config, logger },
            {
              scheduler: scheduler,
              schedule: scheduler.createScheduledTaskRunner({
                frequency: { minutes: 30 },
                timeout: { minutes: 3 },
              }),
            },
          ),
        );
      },
    });
  },
});
