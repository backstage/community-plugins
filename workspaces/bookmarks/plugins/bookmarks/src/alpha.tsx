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
  createFrontendPlugin,
  TranslationBlueprint,
} from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';
import {
  compatWrapper,
  convertLegacyRouteRefs,
} from '@backstage/core-compat-api';
import { entityContentRouteRef } from './routes';
import { isBookmarksAvailable } from './utils/isBookmarksAvailable';
import { bookmarksTranslations } from './translations/translations';

const bookmarksEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/bookmarks',
    title: 'Bookmarks',
    filter: isBookmarksAvailable,
    loader:
      /* istanbul ignore next: very difficult to test this in Jest */
      async () =>
        import(
          './components/EntityBookmarksContent/EntityBookmarksContent'
        ).then(m => compatWrapper(<m.EntityBookmarksContent />)),
  },
});

const bookmarksTranslationsExtension = TranslationBlueprint.make({
  name: 'bookmarksTranslations',
  params: {
    resource: bookmarksTranslations,
  },
});

/**
 * Bookmarks plugin (new frontend system)
 *
 * @public
 */
const bookmarksPlugin = createFrontendPlugin({
  pluginId: 'bookmarks',
  info: {
    packageJson:
      /* istanbul ignore next: very difficult to test this in Jest */
      () => import('../package.json'),
  },
  extensions: [bookmarksEntityContent, bookmarksTranslationsExtension],
  routes: convertLegacyRouteRefs({
    bookmarks: entityContentRouteRef,
  }),
});

export default bookmarksPlugin;
