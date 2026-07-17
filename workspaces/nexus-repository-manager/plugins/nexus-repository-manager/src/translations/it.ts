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
 * Italian translation for plugin.nexus-repository-manager.
 * @public
 */
const nexusRepositoryManagerTranslationIt = createTranslationMessages({
  ref: nexusRepositoryManagerTranslationRef,
  messages: {
    'table.title': 'Gestore del repository Nexus: {{title}}',
    'table.labelRowsSelect': 'Righe',
    'table.columns.version': 'Versione',
    'table.columns.artifact': 'Artefatto',
    'table.columns.repositoryType': 'Tipo di repository',
    'table.columns.checksum': 'Checksum',
    'table.columns.modified': 'Modificato',
    'table.columns.size': 'Dimensione',
    'table.emptyValue': 'N/A',
    'table.emptyContent.message': 'Non è stato ancora aggiunto alcun dato,',
    'entityContent.title': 'Crea artefatti',
    'table.searchPlaceholder': 'Filtro',
    'table.emptyContent.linkText': 'impara come aggiungere dati',
  },
});

export default nexusRepositoryManagerTranslationIt;
