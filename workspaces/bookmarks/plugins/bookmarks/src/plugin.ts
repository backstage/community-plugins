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
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { entityContentRouteRef } from './routes';

/**
 * Bookmarks plugin (legacy frontend system)
 *
 * @public
 */
export const bookmarksPlugin = createPlugin({
  id: 'bookmarks',
  routes: {
    entityContent: entityContentRouteRef,
  },
});

/**
 * EntityBookmarksContent extension for the contents of the Bookmarks tab
 * (legacy frontend system)
 *
 * @public
 */
export const EntityBookmarksContent = bookmarksPlugin.provide(
  createRoutableExtension({
    name: 'EntityBookmarksContent',
    component:
      /* istanbul ignore next: very difficult to test this in Jest */
      () =>
        import(
          './components/EntityBookmarksContent/EntityBookmarksContent'
        ).then(m => m.EntityBookmarksContent),
    mountPoint: entityContentRouteRef,
  }),
);
