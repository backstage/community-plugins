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
import {
  createApiFactory,
  createApiRef,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import type { ManageApi } from './ManageApi';
import { DefaultManageApi } from './DefaultManageApi';
import { ManageModuleApiRef } from './types';

/**
 * ApiRef for the Manage API.
 *
 * @public
 */
export const manageApiRef = createApiRef<ManageApi>({ id: 'manage' });

/**
 * Options for creating the Manage API.
 *
 * @public
 */
export interface ApiFactoryOptions {
  /**
   * The kind order to use when rendering the owned entities.
   */
  kindOrder?: string[];

  /**
   * Optional Manage extensions to include in the API.
   */
  extensions?: Iterable<ManageModuleApiRef>;
}

/**
 * Default API factory for the Manage plugin.
 *
 * This simplifies the API creation by providing a default implementation.
 *
 * @public
 */
export function createManageApiFactory(options?: ApiFactoryOptions) {
  const { kindOrder, extensions = [] } = options ?? {};

  const apiDeps = Object.fromEntries(
    Array.from(extensions).map(apiRef => [apiRef.id, apiRef]),
  );

  return createApiFactory({
    api: manageApiRef,
    deps: { ...apiDeps, discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
    factory(deps) {
      const { discoveryApi, fetchApi, ...providers } = deps;
      return new DefaultManageApi({
        discoveryApi,
        fetchApi,
        kindOrder,
        providers: Object.values(providers),
      });
    },
  });
}
