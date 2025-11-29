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

const jfrogArtifactoryTranslationIt = createTranslationMessages({
  ref: jfrogArtifactoryTranslationRef,
  messages: {
    'page.title': 'Repository JFrog Artifactory: {{image}}',
    'table.searchPlaceholder': 'Filtra',
    'table.labelRowsSelect': 'Righe',
    'table.columns.version': 'Versione',
    'table.columns.repositories': 'Repository',
    'table.columns.manifest': 'Manifesto',
    'table.columns.modified': 'Modificato',
    'table.columns.size': 'Dimensione',
    'table.emptyContent.message': 'Nessun dato è stato ancora aggiunto,',
    'table.emptyContent.learnMore': 'scopri come aggiungere dati.',
    'manifest.sha256': 'sha256',
  },
});

export default jfrogArtifactoryTranslationIt;
