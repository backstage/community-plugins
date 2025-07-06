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

import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';

import { npmTranslationRef } from './ref';

const de = createTranslationMessages({
  ref: npmTranslationRef,
  full: true, // False means that this is a partial translation
  messages: {
    'infoCard.title': 'NPM Paket {{packageName}}',
    'infoCard.latestVersion': 'Aktuelle Version',
    'infoCard.publishedAt': 'Veröffentlicht am',
    'infoCard.license': 'Lizenz',
    'infoCard.description': 'Beschreibung',
    'infoCard.keywords': 'Stichwörter',
    'infoCard.registryName': 'Registry Name',
    'infoCard.npmRepository': 'NPM Repository',
    'infoCard.codeRepository': 'Quellcode Repository',
    'infoCard.issueTracker': 'Fehlerverfolgung',
    'infoCard.homepage': 'Webseite',

    'releaseOverviewCard.title': 'Aktuelle Tags',
    'releaseOverviewCard.toolbar.searchPlaceholder': 'Suche',
    'releaseOverviewCard.columns.tag': 'Tag',
    'releaseOverviewCard.columns.version': 'Version',
    'releaseOverviewCard.columns.published': 'Veröffentlicht',

    'releaseTableCard.title': 'Aktuelle Versionen',
    'releaseTableCard.toolbar.searchPlaceholder': 'Suche',
    'releaseTableCard.columns.tag': 'Tag',
    'releaseTableCard.columns.version': 'Version',
    'releaseTableCard.columns.published': 'Veröffentlicht',

    'versionHistoryCard.title': 'Versionsverlauf',
    'versionHistoryCard.toolbar.searchPlaceholder': 'Suche',
    'versionHistoryCard.columns.version': 'Version',
    'versionHistoryCard.columns.published': 'Veröffentlicht',
  },
});

export default de;
