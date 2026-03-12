/*
 * Copyright 2024 The Backstage Authors
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
import { acrTranslationRef } from './ref';

/**
 * fr translation for plugin.acr.
 * @public
 */
const acrTranslationFr = createTranslationMessages({
  ref: acrTranslationRef,
  messages: {
    'page.title': 'Azure Container Registry Repository: {{image}}',
    'table.searchPlaceholder': 'Filtre',
    'table.labelRowsSelect': 'Lignes',
    'table.columns.tag': 'Balise',
    'table.columns.created': 'Créé',
    'table.columns.lastModified': 'Dernière modification',
    'table.columns.manifest': 'Manifeste',
  },
});

export default acrTranslationFr;
