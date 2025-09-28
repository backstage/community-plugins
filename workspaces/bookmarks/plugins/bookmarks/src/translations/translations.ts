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
  createTranslationRef,
  createTranslationResource,
} from '@backstage/core-plugin-api/alpha';

/**
 * Bookmarks plugin translation ref
 *
 * @public
 */
export const bookmarksTranslationRef = createTranslationRef({
  id: 'bookmarks',
  messages: {
    bookmarkViewer: {
      newTab: 'Open in new tab',
      navButton: {
        next: 'Next',
        previous: 'Previous',
      },
      mobileView: {
        toc: 'Table of Contents',
      },
    },
    bookmarkViewerFrame: {
      devModeWarning:
        'You may have to reload the page for the iframe to load correctly in development mode',
    },
    entityBookmarksContent: {
      invalid: {
        title: 'Invalid bookmarks format',
        description: 'Ensure your bookmarks are structured correctly.',
      },
      notFound: {
        title: 'No bookmarks found',
        description:
          "Add bookmarks to your entity's metadata to see them here.",
      },
    },
  },
});

/**
 * Languages that are available for the Bookmarks plugin
 *
 * @public
 */
export const AVAILABLE_LANGUAGES = ['en', 'de'];

/**
 * Translations resource for the Bookmarks plugin
 *
 * @public
 */
export const bookmarksTranslations = createTranslationResource({
  ref: bookmarksTranslationRef,
  translations: {
    de: async () => ({ default: (await import('./de')).de }),
  },
});
