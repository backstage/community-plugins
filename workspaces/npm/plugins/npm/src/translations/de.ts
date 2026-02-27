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

/**
 * de translation for plugin.npm.translation-ref.
 * @public
 */
const de = createTranslationMessages({
  ref: npmTranslationRef,
  messages: {
    'infoCard.title': 'NPM-Paket {{packageName}}',
    'infoCard.latestVersion': 'Neueste Version',
    'infoCard.publishedAt': 'Veröffentlicht am',
    'infoCard.license': 'Lizenz',
    'infoCard.description': 'Beschreibung',
    'infoCard.keywords': 'Schlüsselwörter',
    'infoCard.registryName': 'Registry-Name',
    'infoCard.npmRepository': 'NPM-Repository',
    'infoCard.codeRepository': 'Code-Repository',
    'infoCard.issueTracker': 'Problemverfolgung',
    'infoCard.homepage': 'Startseite',
    'releaseOverviewCard.title': 'Aktuelle Tags',
    'releaseOverviewCard.toolbar.searchPlaceholder': 'Suchen',
    'releaseOverviewCard.columns.tag': 'Tag',
    'releaseOverviewCard.columns.version': 'Version',
    'releaseOverviewCard.columns.published': 'Veröffentlicht',
    'releaseTableCard.title': 'Aktuelle Tags',
    'releaseTableCard.toolbar.searchPlaceholder': 'Suchen',
    'releaseTableCard.columns.tag': 'Tag',
    'releaseTableCard.columns.version': 'Version',
    'releaseTableCard.columns.published': 'Veröffentlicht',
    'versionHistoryCard.title': 'Versionsverlauf',
    'versionHistoryCard.toolbar.searchPlaceholder': 'Suchen',
    'versionHistoryCard.columns.version': 'Version',
    'versionHistoryCard.columns.published': 'Veröffentlicht',
  },
});

export default de;
