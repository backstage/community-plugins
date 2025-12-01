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

const jfrogArtifactoryTranslationFr = createTranslationMessages({
  ref: jfrogArtifactoryTranslationRef,
  messages: {
    'page.title': 'Dépôt JFrog Artifactory : {{image}}',
    'table.searchPlaceholder': 'Filtrer',
    'table.labelRowsSelect': 'Lignes',
    'table.columns.version': 'Version',
    'table.columns.repositories': 'Dépôts',
    'table.columns.manifest': 'Manifeste',
    'table.columns.modified': 'Modifié',
    'table.columns.size': 'Taille',
    'table.emptyContent.message': "Aucune donnée n'a encore été ajoutée,",
    'table.emptyContent.learnMore': 'apprenez à ajouter des données.',
    'manifest.sha256': 'sha256',
  },
});

export default jfrogArtifactoryTranslationFr;
