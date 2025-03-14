/*
 * Copyright 2023 The Backstage Authors
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
  createBackendPlugin,
  coreServices,
} from '@backstage/backend-plugin-api';

import { todoServiceRef } from './service/TodoReaderService';
import { createRouter } from './service/router';

/**
 * The Todos plugin is responsible for aggregating todo comments within source.
 * @public
 */
export const todoPlugin = createBackendPlugin({
  pluginId: 'todo',
  register(env) {
    env.registerInit({
      deps: {
        todoService: todoServiceRef,
        http: coreServices.httpRouter,
        config: coreServices.rootConfig,
        logger: coreServices.rootLogger,
      },
      async init({ http, todoService, config, logger }) {
        http.use(
          await createRouter({
            todoService,
            config: config,
            logger: logger,
          }),
        );
      },
    });
  },
});
