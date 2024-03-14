/*
 * Copyright 2020 The Backstage Authors
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
import { CatalogClient } from '@backstage/catalog-client';
import {
  createRouter,
  TodoReaderService,
  TodoScmReader,
} from '@backstage-community/plugin-todo-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const todoReader = TodoScmReader.fromConfig(env.config, {
    logger: env.logger,
    reader: env.reader,
  });

  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  const todoService = new TodoReaderService({
    todoReader,
    catalogClient,
  });

  return await createRouter({
    todoService,
  });
}
