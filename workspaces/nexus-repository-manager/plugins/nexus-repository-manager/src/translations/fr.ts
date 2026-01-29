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
import { nexusRepositoryManagerTranslationRef } from './ref';

/**
 * fr translation for plugin.nexus-repository-manager.
 * @public
 */
const nexusRepositoryManagerTranslationFr = createTranslationMessages({
  ref: nexusRepositoryManagerTranslationRef,
  messages: {
    'table.title': 'Nexus Repository Manager: {{title}}',
    'table.searchPlaceholder': 'Filtre',
    'table.labelRowsSelect': 'Lignes',
    'table.columns.version': 'Version',
    'table.columns.artifact': 'Artifact',
    'table.columns.repositoryType': 'Type de référentiel',
    'table.columns.checksum': 'Checksum',
    'table.columns.modified': 'Modifié',
    'table.columns.size': 'Taille',
    'table.emptyValue': 'N/A',
    'table.emptyContent.message':
      'Aucune donnée n’a été ajouté pour l’instant,',
    'table.emptyContent.linkText': 'apprenez comment ajouter des données.',
    'entityContent.title': 'Build Artifacts',
  },
});

export default nexusRepositoryManagerTranslationFr;
