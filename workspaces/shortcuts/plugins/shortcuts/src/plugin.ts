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

import { DefaultShortcutsApi, shortcutsApiRef } from './api';
import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  storageApiRef,
} from '@backstage/core-plugin-api';

/** @public */
export const shortcutsPlugin = createPlugin({
  id: 'shortcuts',
  apis: [
    createApiFactory({
      api: shortcutsApiRef,
      deps: { storageApi: storageApiRef },
      factory: ({ storageApi }) =>
        new DefaultShortcutsApi(storageApi.forBucket('shortcuts')),
    }),
  ],
});

/** @public */
export const Shortcuts = shortcutsPlugin.provide(
  createComponentExtension({
    name: 'Shortcuts',
    component: { lazy: () => import('./Shortcuts').then(m => m.Shortcuts) },
  }),
);
