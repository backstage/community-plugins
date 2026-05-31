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
import { jfrogArtifactoryTranslationRef } from './ref';

/**
 * Italian translation for plugin.jfrog-artifactory.
 * @public
 */
const jfrogArtifactoryTranslationIt = createTranslationMessages({
  ref: jfrogArtifactoryTranslationRef,
  messages: {
    'page.title': 'Repository Artifactory di JFrog: {{image}}',
    'table.searchPlaceholder': 'Filtro',
    'table.labelRowsSelect': 'Righe',
    'table.pagination.showResults': 'Mostra {{count}} risultati',
    'table.pagination.rangeLabel': '{{start}} - {{end}} di {{total}}',
    'table.columns.version': 'Versione',
    'table.columns.repositories': 'Repository',
    'table.columns.manifest': 'Manifesto',
    'table.columns.modified': 'Modificato',
    'table.columns.size': 'Dimensione',
    'table.emptyContent.message': 'Non è stato ancora aggiunto alcun dato,',
    'table.emptyContent.learnMore': 'impara come aggiungere dati.',
    'manifest.sha256': 'sha256',
  },
});

export default jfrogArtifactoryTranslationIt;
