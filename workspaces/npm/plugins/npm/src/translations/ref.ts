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

import { createTranslationRef } from '@backstage/core-plugin-api/alpha';

/**
 * @public
 */
export const npmTranslationRef = createTranslationRef({
  id: 'plugin.npm.translation-ref',
  messages: {
    infoCard: {
      title: 'NPM package {{packageName}}',
      latestVersion: 'Latest version',
      publishedAt: 'Published at',
      license: 'License',
      description: 'Description',
      keywords: 'Keywords',
      registryName: 'Registry name',
      npmRepository: 'NPM repository',
      codeRepository: 'Code repository',
      issueTracker: 'Issue tracker',
      homepage: 'Homepage',
    },
    releaseOverviewCard: {
      title: 'Current Tags',
      toolbar: {
        searchPlaceholder: 'Search',
      },
      columns: {
        tag: 'Tag',
        version: 'Version',
        published: 'Published',
      },
    },
    releaseTableCard: {
      title: 'Current Tags',
      toolbar: {
        searchPlaceholder: 'Search',
      },
      columns: {
        tag: 'Tag',
        version: 'Version',
        published: 'Published',
      },
    },
    versionHistoryCard: {
      title: 'Version History',
      toolbar: {
        searchPlaceholder: 'Search',
      },
      columns: {
        version: 'Version',
        published: 'Published',
      },
    },
  },
});
